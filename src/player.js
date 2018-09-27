const SortItOut = angular.module("SortItOutEngine", ["ngAnimate", "hmTouchEvents"])

// force scope to update when scrolling
SortItOut.directive("scroll", () => {
	return {
		link: (scope, element) => {
			element.bind("wheel", () => scope.$apply())
			element.bind("touchmove", () => scope.$apply())
		}
	}
})

SortItOut.controller("SortItOutEngineCtrl", ["$scope", ($scope) => {
	$scope.showFolderPreview = false
	$scope.selectedText = false
	$scope.desktopItems = []
	$scope.folders = []

	let itemSelected
	let prevPosition
	let placementBounds    // bounds for random placement
	let pickupCount = 0    // every new item picked up will go to the top (z-index)
	let dragBounds         // bounds for dragging
	let itemSource         // to track where the dragged item came from
	const SRC_DESKTOP = -1 // otherwise itemSource is folderIndex
	let questionToId       // used for scoring
	const MARGIN_SIZE = 20 // #preview-scroll-container margin size

	$scope.start = (instance, qset, version) => {
		generateBounds()
		generateQuestionToId(qset)
		$scope.title = instance.name
		$scope.folders = buildFolders(qset)
		$scope.desktopItems = buildItems(qset)
		$scope.$apply()
	}

	const generateBounds = () => {
		const width = $("#desktop").width()
		const height = $("#desktop").height()

		placementBounds = {
			x: {
				min: 15,
				max: width - 150
			},
			y: {
				min: 45,
				max: height - 15
			}
		}

		dragBounds = {
			x: {
				min: 15,
				max: width - 15
			},
			y: {
				min: 45,
				max: height + 15
			}
		}
	}

	const buildFolders = qset => {
		let folders = []
		let seenFolders = {}
		qset.items.forEach( item => {
			const text = item.answers[0].text
			if (!seenFolders[text]) {
				seenFolders[text] = true
				folders.push({
					text,
					items: []
				})
			}
		})
		return folders
	}

	const buildItems = qset => {
		return qset.items.map( item => {
			return {
				text: item.questions[0].text,
				position: generateRandomPosition()
			}
		})
	}

	const generateRandomPosition = () => {
		const pb = placementBounds
		const yRange = pb.y.max - pb.y.min - 125
		const y = ~~(Math.random() * (yRange) ) + pb.y.min
		const xRange = pb.x.max - pb.x.min
		const x = ~~(Math.random() * (xRange) ) + pb.x.min
		return { x, y }
	}

	$scope.hideTutorial = () => $(".tutorial").fadeOut()

	$scope.itemMouseDown = (e, text) => {
		if ($scope.selectedText) {
			return // prevent duplicated calls
		}
		itemSelected = e.currentTarget
		$scope.selectedText = text

		const left = parseInt($(itemSelected).css("left"), 10)
		const top = parseInt($(itemSelected).css("top"), 10)

		$scope.offsetLeft = left - e.clientX
		$scope.offsetTop = top - e.clientY

		$(itemSelected).css({ top, left, "z-index": pickupCount++ })
		prevPosition = { top, left }
		itemSource = SRC_DESKTOP
	}

	const isOutOfBounds = e => {
		const db = dragBounds
		const outOfBoundsX = e.clientX < db.x.min || e.clientX > db.x.max
		const outOfBoundsY = e.clientY < db.y.min || e.clientY > db.y.max
		return outOfBoundsX || outOfBoundsY
	}

	// hammer event properties are different from native, this changes the event
	// and will call the regular function after
	$scope.standardizeEvent = (hammerEvent, param2, cb)=> {
		hammerEvent.clientX = hammerEvent.center.x
		hammerEvent.clientY = hammerEvent.center.y
		hammerEvent.currentTarget = hammerEvent.target
		if (param2) {
			cb(hammerEvent, param2)
		} else {
			cb(hammerEvent)
		}
	}

	$scope.mouseMove = e => {
		if (e.center) { // if it's a hammer event
			const underElem = $(document.elementFromPoint(e.clientX, e.clientY))
			const folderElem = underElem.closest(".folder")
			if (folderElem.length) {
				folderElem.addClass("peeked")
			} else {
				$(".peeked").removeClass("peeked")
			}
		}

		if (itemSelected) {
			if (isOutOfBounds(e)) {
				return $scope.mouseUp(e)
			}
			const left = e.clientX + $scope.offsetLeft
			const top = e.clientY + $scope.offsetTop
			$(itemSelected).css({ top, left })
		}
	}

	$scope.mouseUp = e => {
		$(".peeked").removeClass("peeked")
		if (!itemSelected) {
			return
		}
		if (e.stopPropagation) {
			e.stopPropagation()
		}

		const underElem = $(document.elementFromPoint(e.clientX, e.clientY))
		const underElemId = underElem.attr("id")

		// put it back if it's out of bounds or over the dock but not a folder
		if (isOutOfBounds(e) || underElemId == "dock-main") {
			$(itemSelected).animate({
				left: prevPosition.left,
				top: Math.min(prevPosition.top, placementBounds.y.max)
			}, 300)
		} else {
			// if dragged on a folder, put it in
			const folderElem = underElem.closest(".folder")
			if (folderElem.length) {
				$scope.selectFolder(e, folderElem.data("index"))
			}

			// source is a folder, destination is back-to-desktop
			if (itemSource != SRC_DESKTOP && underElemId == "desktop-drop-zone") {
				$scope.folders[itemSource].items = $scope.folders[itemSource].items.filter(
					item => item != $scope.selectedText
				)
				$scope.desktopItems.push({
					text: $scope.selectedText,
					position: {
						x: e.clientX + $scope.offsetLeft,
						y: e.clientY + $scope.offsetTop
					}
				})
			}
		}

		itemSelected = false
		$scope.selectedText = false
		itemSource = SRC_DESKTOP
	}

	$scope.selectFolder = (e, index) => {
		if (e.stopPropagation) {
			e.stopPropagation()
		}
		if (index == itemSource) {
			return // if dragged to where it already is
		}

		if ($scope.selectedText) {
			$scope.folders[index].items.push($scope.selectedText)

			if (itemSource == SRC_DESKTOP) {
				$scope.desktopItems = $scope.desktopItems.filter(
					item => item.text != $scope.selectedText
				)
			} else {
				$scope.folders[itemSource].items = $scope.folders[itemSource].items.filter(
					item => item != $scope.selectedText
				)
			}

			$(".desktop-item.selected").removeClass("selected")
			itemSelected = false
			$scope.selectedText = false
			itemSource = SRC_DESKTOP
		} else {
			$scope.showFolderPreview = true
			$scope.folderPreviewIndex = index
		}
	}

	$scope.hideFolderPreview = () => {
		$scope.showFolderPreview = false
		$scope.folderPreviewIndex = -1
	}

	$scope.previewMouseDown = (e, text) => {
		itemSelected = $("#preview-selected-item")[0]
		$scope.selectedText = text

		const { left, top } = $(e.currentTarget).offset()

		$scope.offsetLeft = left - e.clientX
		$scope.offsetTop = top - e.clientY

		$(itemSelected).css({ top, left })
		itemSource = $scope.folderPreviewIndex
	}

	$scope.peekFolder = index => {
		$(`.folder[data-index=${index}]`).addClass("peeked")
	}

	$scope.hidePeek = () => {
		$(".peeked").removeClass("peeked")
	}

	const generateQuestionToId = qset => {
		questionToId = {}
		for (let item of qset.items) {
			questionToId[item.questions[0].text] = item.id
		}
	}

	$scope.canScrollUp = () => $("#preview-scroll-container").scrollTop() > 0

	$scope.canScrollDown = () => {
		const e = $("#preview-scroll-container")
		const scrollBottom = e.scrollTop() + e.height()
		const containerBottom = e[0].scrollHeight - MARGIN_SIZE
		return scrollBottom < containerBottom
	}

	$scope.scrollUp = () => {
		const currTop = $("#preview-scroll-container").scrollTop()
		$("#preview-scroll-container").animate({
			scrollTop: currTop - 100
		}, 300, () => $scope.$apply())
	}

	$scope.scrollDown = () => {
		const currTop = $("#preview-scroll-container").scrollTop()
		$("#preview-scroll-container").animate({
			scrollTop: currTop + 100
		}, 300, () => $scope.$apply())
	}

	$scope.readyToSubmit = () => {
		return $scope.folders.length > 0 && $scope.desktopItems.length == 0
	}

	$scope.submitClick = () => {
		if (!$scope.readyToSubmit()) {
			return
		}

		$scope.folders.forEach( ({text, items}) => {
			items.forEach( item => {
				const id = questionToId[item]
				Materia.Score.submitQuestionForScoring(id, text)
			})
		})
		Materia.Engine.end()
	}

	Materia.Engine.start($scope)
}])

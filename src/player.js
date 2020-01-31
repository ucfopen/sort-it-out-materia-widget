const SortItOut = angular.module("SortItOutEngine", ["hmTouchEvents", "ngAria"])

// force scope to update when scrolling
SortItOut.directive("scroll", () => {
	return {
		link: (scope, element) => {
			element.bind("wheel", () => scope.$apply())
			element.bind("touchmove", () => scope.$apply())
		}
	}
})

// catches keyboard shortcuts agnostic of other key event listeners
// for the assistive keyboard input listeners, check handleAssistiveSelection below
SortItOut.directive("keyboardShortcuts", ["$document", "$rootScope", ($document, $rootScope) => {
	return {
		restrict: "A",
		link: (scope, element) => {
			$document.bind("keypress", (event) => {
				// only used to listen for tab key currently
				if (event.which == 9) $rootScope.$broadcast("tabMonitor", event, event.which)
			})
		}
	}
}])

SortItOut.controller("SortItOutEngineCtrl", ["$scope", "$rootScope", "$timeout", "sanitizeHelper", function ($scope, $rootScope, $timeout, sanitizeHelper) {
	const SRC_DESKTOP = -1 // indicates drag started on desktop, otherwise itemSource is folderIndex
	const MARGIN_SIZE = 20 // #preview-scroll-container margin size
	const DOCK_HEIGHT = 125
	const previewScrollContainerEl = document.getElementById('preview-scroll-container')

	let prevPosition       // start position of drag
	let selectedElement    // element that is being dragged
	let pickupCount = 1    // every new item picked up will go to the top (z-index)
	let itemSource         // to track where the dragged item came from
	let _assistiveFolderSelectIndex = -1
	let _inAssistiveFolderSelectMode = false

	$scope.numSorted = 0
	$scope.tutorialPage = 1
	$scope.showFolderPreview = false
	$scope.showNoSubmit = false
	$scope.showSubmitDialog = true
	$scope.selectedItem = false
	$scope.desktopItems = []
	$scope.folders = []
	$scope.enlargedImage = {
		show: false,
		url: ""
	}

	const generateBounds = () => {
		const desktopEl = document.getElementById('desktop')
		const width = parseFloat(getComputedStyle(desktopEl, null).width.replace("px", ""))
		const height = parseFloat(getComputedStyle(desktopEl, null).height.replace("px", ""))
		const menuBarHeight = document.getElementById('menu-bar').offsetHeight

		$scope.placementBounds = {
			x: {
				min: 15,
				max: width - 150
			},
			y: {
				min: menuBarHeight + 5,
				max: height - 15
			}
		}

		$scope.dragBounds = {
			x: {
				min: 15,
				max: width - 15
			},
			y: {
				min: menuBarHeight + 5,
				max: menuBarHeight + height - 15
			}
		}
	}

	const makeFoldersFromQset = qset => {
		const folderNames = new Set
		qset.items.forEach( item => {
			folderNames.add(sanitizeHelper.desanitize(item.answers[0].text))
		})

		return Array.from(folderNames).map( text => ({ text, items: [] }))
	}

	const makeItemsFromQset = qset => {
		return qset.items.map( item => {
			const image = item.options.image
				? Materia.Engine.getMediaUrl(item.options.image)
				: false

			return {
				id: item.id,
				text: sanitizeHelper.desanitize(item.questions[0].text),
				image,
				position: generateRandomPosition(Boolean(item.options.image)),
				folder: SRC_DESKTOP
			}
		})
	}

	const generateRandomPosition = hasImage => {
		const pb = $scope.placementBounds

		const yRange = pb.y.max - pb.y.min - DOCK_HEIGHT - (hasImage ? 150 : 0)
		const y = ~~(Math.random() * yRange) + pb.y.min

		const xRange = pb.x.max - pb.x.min
		const x = ~~(Math.random() * xRange) + pb.x.min

		return { left: `${x}px`, top: `${y}px` }
	}

	// fisher-yates shuffle algorithm
	const shuffle = array => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			const x = array[i]
			array[i] = array[j]
			array[j] = x
		}

		return array
	}

	const setItemPos = (el, top, left) => {
		el.style.top = `${top}px`
		el.style.left = `${left}px`
	}

	// aria-live regions don't work well with normal angular data binding with scope variables
	// to overcome this, we gotta go old school and edit the DOM node manually
	const assistiveAlert = (text) => {
		if (document.getElementById("assistive-alert")) document.getElementById("assistive-alert").innerHTML = text
	}

	const removeClassShrink = () => {
		const shrunk = document.getElementsByClassName('shrink')
		Array.from(shrunk).forEach(el => el.classList.remove('shrink'))
	}

	const removeClassPeek = () => {
		const peeked = document.getElementsByClassName('peeked')
		Array.from(peeked).forEach(el => el.classList.remove('peeked'))
	}

	const isOutOfBounds = e => {
		const db = $scope.dragBounds
		const outOfBoundsX = e.clientX < db.x.min || e.clientX > db.x.max
		const outOfBoundsY = e.clientY < db.y.min || e.clientY > db.y.max
		return outOfBoundsX || outOfBoundsY
	}

	$scope.start = (instance, qset, version) => {
		generateBounds()
		$scope.title = instance.name
		$scope.folders = makeFoldersFromQset(qset)
		$scope.desktopItems = shuffle(makeItemsFromQset(qset))

		$scope.backgroundImage = "assets/desktop.jpg"
		if (qset.options.backgroundImageId) {
			$scope.backgroundImage = Materia.Engine.getMediaUrl(
				qset.options.backgroundImageId
			)
		} else if (qset.options.backgroundImageAsset) {
			$scope.backgroundImage = qset.options.backgroundImageAsset
		}
		$scope.$apply()
	}

	$scope.hideTutorial = () => {
		const tutorialEl = document.getElementById('tutorial')
		const tutorialBgEl = document.getElementById('tutorial-background')
		tutorialEl.classList.add('hide');
		tutorialEl.classList.remove('show');
		tutorialBgEl.classList.add('hide')
		tutorialBgEl.classList.remove('show')
		setTimeout(() => {
			tutorialEl.classList.add('hidden')
			tutorialBgEl.classList.add('hidden')
		}, 400)
	}

	$scope.itemMouseDown = (e, item) => {
		$scope.selectedItem = item

		// hammer events store the element differently
		selectedElement = e.element ? e.element[0] : e.currentTarget
		const computedStyle = getComputedStyle(selectedElement)
		const left = parseInt(computedStyle.left, 10)
		const top = parseInt(computedStyle.top, 10)

		$scope.offsetLeft = left - e.clientX
		$scope.offsetTop = top - e.clientY
		pickupCount++

		setItemPos(selectedElement, top, left)
		selectedElement.style.zIndex = pickupCount

		prevPosition = { top, left }
		itemSource = SRC_DESKTOP
	}

	// hammer event properties are different from native, this changes the event
	// and will call the regular function after
	$scope.standardizeEvent = (hammerEvent, param2, cb) => {
		hammerEvent.clientX = hammerEvent.center.x
		hammerEvent.clientY = hammerEvent.center.y
		hammerEvent.currentTarget = hammerEvent.target
		if (param2) {
			cb(hammerEvent, param2)
		} else {
			cb(hammerEvent)
		}
	}

	$scope.panMove = e => {
		const underElem = document.elementFromPoint(e.clientX, e.clientY)
		const folderElem = underElem ? underElem.closest('.folder') : null
		if (folderElem) {
			const index = folderElem.dataset.index
			$scope.peekFolder(index)
			if (selectedElement) selectedElement.classList.add('shrink')
		} else {
			removeClassPeek()
			removeClassShrink()
		}

		if (selectedElement) {
			if (isOutOfBounds(e)) {
				return $scope.mouseUp(e)
			}
			const left = e.clientX + $scope.offsetLeft
			const top = e.clientY + $scope.offsetTop
			setItemPos(selectedElement, top, left)
		}
	}

	$scope.mouseUp = e => {
		removeClassPeek()
		if (!selectedElement) {
			return
		}

		if (e.stopPropagation) {
			e.stopPropagation()
		}

		const underElemId = document.elementFromPoint(e.clientX, e.clientY).id

		// put it back if it's out of bounds or over the dock but not a folder
		if (isOutOfBounds(e) || underElemId == "dock-main") {
			removeClassShrink()
			setItemPos(selectedElement, Math.min(prevPosition.top, $scope.placementBounds.y.max), prevPosition.left)
		} else {
			const underElem = document.elementFromPoint(e.clientX, e.clientY)
			// dragged item INTO a folder
			const folderElem = underElem ? underElem.closest('.folder') : null
			if (folderElem) {
				$scope.mouseUpOverFolder(folderElem.dataset.index)
			}

			// draged item OUT of a folder
			if (itemSource != SRC_DESKTOP && underElem.classList.contains('desktop-zone')) {
				$scope.folders[itemSource].items = $scope.folders[itemSource].items.filter(
					item => item.text != $scope.selectedItem.text
				)

				$scope.selectedItem.position = {
					top: `${e.clientY + $scope.offsetTop}px`,
					left: `${e.clientX + $scope.offsetLeft}px`
				}

				for (const [index, item] of Object.entries($scope.desktopItems)) {
					if ($scope.selectedItem.text == item.text) {
						$scope.desktopItems[index].sorted = false
						$scope.desktopItems[index].folder = SRC_DESKTOP
						$scope.numSorted--
					}
				}
			}
		}

		selectedElement = false
		$scope.selectedItem = false
		itemSource = SRC_DESKTOP
	}

	$scope.mouseUpOverFolder = targetFolderIndex => {
		// item dropped to where it already is
		if (targetFolderIndex == itemSource) {
			return
		}

		// clicked on an open folder, close it
		if (targetFolderIndex == $scope.folderPreviewIndex) {
			$scope.hideFolderPreview()
			return
		}

		// clicked on a folder that wasn't open, open it
		if (!$scope.selectedItem) {
			$scope.showFolderPreview = true
			$scope.folderPreviewIndex = targetFolderIndex
			return
		}

		// add selected item to this folder's items
		$scope.folders[targetFolderIndex].items.push($scope.selectedItem)

		const desktopIndex = $scope.desktopItems.indexOf($scope.selectedItem)

		itemSource = $scope.desktopItems[desktopIndex].folder

		if (itemSource == SRC_DESKTOP) {
			// item is moving from the desktop
			$scope.desktopItems[desktopIndex].sorted = true
			$scope.numSorted++
		} else {
			// item moving from another folder
			// remove it from the folder's items
			const previousFolder = $scope.folders[itemSource]
			previousFolder.items = previousFolder.items.filter(
				item => item.text != $scope.selectedItem.text
			)
		}

		// update what folder this item is in
		$scope.desktopItems[desktopIndex].folder = targetFolderIndex

		// reset our dragging state
		selectedElement = false
		$scope.selectedItem = false
		itemSource = SRC_DESKTOP

		if ($scope.readyToSubmit()) {
			assistiveAlert("You are ready to submit this widget. You can press escape or tab to cancel and continue sorting items.")
			document.getElementById("submit-dialog-confirm").focus()
		}
	}

	$scope.handleItemFocus = (event, item) => {
		if ($scope.selectedItem != item) {
			$scope.selectedItem = item
			_assistiveFolderSelectIndex = -1
			_inAssistiveFolderSelectMode = false

			removeClassPeek()
			assistiveAlert(item.text + " is selected.")

			$scope.hideTutorial()
		}
	}

	$scope.handleAssistiveSelection = (event, item) => {

		switch (event.keyCode) {
			case 32: // space
				// prevent unwanted behavior folder selection behavior
				if ($scope.selectedItem.folder == _assistiveFolderSelectIndex) return
				// item has been selected, and a target folder is currently selected
				if (_inAssistiveFolderSelectMode) {
					$scope.mouseUpOverFolder(_assistiveFolderSelectIndex)
					assistiveAlert(item.text + " has been placed in " + $scope.folders[_assistiveFolderSelectIndex].text)
					removeClassPeek()
					$scope.selectedItem = item // set selectedItem back to the item that was placed, overriding the default behavior
				}
				break

			case 40: // down arrow. inits assistive folder selection mode. Folder element is NOT focused but we peek it to provide a visual indicator of selection
				event.preventDefault()
				removeClassPeek()
				if (_assistiveFolderSelectIndex >= $scope.folders.length - 1) _assistiveFolderSelectIndex = 0
				else _assistiveFolderSelectIndex++
				$scope.peekFolder(_assistiveFolderSelectIndex)
				assistiveAlert($scope.folders[_assistiveFolderSelectIndex].text + " folder selected. Press space to place this item in the folder.")
				_inAssistiveFolderSelectMode = true
				break

			case 38: // up arrow. inits assistive folder selection mode. Folder element is NOT focused but we peek it to provide a visual indicator of selection
				event.preventDefault()
				removeClassPeek()
				if (_assistiveFolderSelectIndex <= 0) _assistiveFolderSelectIndex = $scope.folders.length - 1
				else _assistiveFolderSelectIndex--
				$scope.peekFolder(_assistiveFolderSelectIndex)
				assistiveAlert($scope.folders[_assistiveFolderSelectIndex].text + " folder selected. Press space to place this item in the folder.")
				_inAssistiveFolderSelectMode = true
				break

			default:
				return false

		}
	}

	$scope.handleAssistiveRepeat = (event) => {
		if (event.which == 32) {
			document.getElementsByClassName('desktop-item')[0].focus()
		}
	}

	// available when a user tabs to the hidden assistive element indicating you can submit
	// they can hit space to submit, tabbing clears the submit window (to prevent unintended interactions)
	$scope.handleAssistiveSubmit = (event) => {
		if (event.which == 32) {
			$scope.submitClick()
		}
		else if (event.which == 9) {
			$scope.showSubmitDialog = false
		}
	}

	$scope.hideFolderPreview = () => {
		$scope.showFolderPreview = false
		$scope.folderPreviewIndex = -1
	}

	$scope.previewMouseDown = (e, item) => {
		selectedElement = document.getElementById('preview-selected-item')
		$scope.selectedItem = item

		const rect = e.currentTarget.getBoundingClientRect();
		let top = rect.top + document.body.scrollTop
		let left = rect.left + document.body.scrollLeft

		// slight shift to keep things looking good
		left -= 10
		top -= 10

		// if there's an image, move it down so it seems more centered
		if (item.image) {
			top -= 25
		}

		// if preview item is long, shift drag item to match
		if (e.clientX - left > 150) {
			left += (e.clientX - left) / 2
		}

		$scope.offsetLeft = left - e.clientX
		$scope.offsetTop = top - e.clientY

		setItemPos(selectedElement, top, left)
		itemSource = $scope.folderPreviewIndex
	}

	$scope.peekFolder = index => {
		const folders = document.querySelectorAll(`.folder[data-index="${index}"]`)
		folders.forEach(f => f.classList.add('peeked'))
	}

	$scope.enlargeImage = (url, e) => {
		if (e.stopPropagation) {
			e.stopPropagation()
		}
		$scope.enlargedImage.url = url
		$scope.enlargedImage.show = true
	}

	// this is used to prevent dragging of the images on macOS
	$scope.preventDefault = (e, stopPropagation) => {
		if (e.preventDefault) {
			e.preventDefault()
		}
		if (stopPropagation && e.stopPropagation) {
			e.stopPropagation()
		}
	}

	$scope.canScroll = () => {
		return previewScrollContainerEl.scrollHeight > previewScrollContainerEl.clientHeight;
	}

	$scope.scrollUp = () => {
		previewScrollContainerEl.scrollTop -= 100
	}

	$scope.scrollDown = () => {
		previewScrollContainerEl.scrollTop += 100
	}

	$scope.readyToSubmit = () => {
		return $scope.numSorted >= $scope.desktopItems.length
	}

	$scope.submitClick = () => {
		if (!$scope.readyToSubmit()) {
			$scope.showNoSubmit = true
			$timeout( () => {
				$scope.showNoSubmit = false
			}, 5000)
			return
		}

		// submit which folder each item is in
		$scope.folders.forEach( ({text: folderText, items}) => {
			items.forEach( item => {
				Materia.Score.submitQuestionForScoring(item.id, folderText)
			})
		})

		Materia.Engine.end()
	}

	$rootScope.$on("tabMonitor", (type, event, key) => {
		$scope.$apply(() => {
			$scope.hideTutorial()
		})
	})

	Materia.Engine.start($scope)
}])

SortItOut.service('sanitizeHelper', [ function() {
	const SANITIZE_CHARACTERS = {
		'&' : '&amp;',
		'>' : '&gt;',
		'<' : '&lt;',
		'"' : '&#34;'
	}

	const sanitize = input => {
		if (!input) return

		for (const k in SANITIZE_CHARACTERS) {
			input = input.replace(SANITIZE_CHARACTERS[k], v)
		}

		return input
	}

	const desanitize = (input) => {
		if (!input) return

		for (const k in SANITIZE_CHARACTERS) {
			input = input.replace(SANITIZE_CHARACTERS[k], k)
		}

		return input
	}

	return {
		sanitize: sanitize,
		desanitize: desanitize
	}
}])

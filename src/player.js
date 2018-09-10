const SortItOut = angular.module("SortItOutEngine", ["ngAnimate", "hmTouchEvents"]);

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

	$scope.showFolderPreview = false;
	$scope.selectedText = false;
	$scope.desktopItems = [];
	$scope.folders = [];
	let itemSelected;
	let prevPosition;
	let placementBounds;    // bounds for random placement
	let dragBounds;         // bounds for dragging
	let itemSource;         // to track where the dragged item came from
	const SRC_DESKTOP = -1; // otherwise itemSource is folderIndex
	let questionToId;       // used for scoring

	$scope.start = (instance, qset, version) => {
		generateBounds();
		generateQuestionToId(qset);
		$scope.title = instance.name;
		$scope.folders = buildFolders(qset);
		$scope.desktopItems = buildItems(qset);
		$scope.$apply();
	}

	const generateBounds = () => {
		const width = $("#desktop").width();
		const height = $("#desktop").height();

		placementBounds = {
			x: {
				min: 15,
				max: width - 150
			},
			y: {
				min: 45,
				max: height - 15
			}
		};

		dragBounds = {
			x: {
				min: 15,
				max: width - 15
			},
			y: {
				min: 45,
				max: height + 15
			}
		};
	}

	const buildFolders = qset => {
		let folders = [];
		let seenFolders = {};
		qset.items.forEach( item => {
			const text = item.answers[0].text;
			if (!seenFolders[text]) {
				seenFolders[text] = true;
				folders.push({
					text,
					items: []
				});
			}
		});
		return folders;
	}

	const buildItems = qset => {
		return qset.items.map( item => {
			return {
				text: item.questions[0].text,
				position: generateRandomPosition()
			};
		});
	}

	const generateRandomPosition = () => {
		const pb = placementBounds;
		const yRange = pb.y.max - pb.y.min - 125;
		const y = ~~(Math.random() * (yRange) ) + pb.y.min;
		const xRange = pb.x.max - pb.x.min;
		const x = ~~(Math.random() * (xRange) ) + pb.x.min;
		return { x, y };
	}

	$scope.itemMouseDown = (e, text) => {
		itemSelected = e.currentTarget;
		$scope.selectedText = text;

		const top = e.clientY - 30;
		const left = e.clientX - 50;
		$(itemSelected).css({ top, left, "z-index": 5 });
		prevPosition = { top, left };
		itemSource = SRC_DESKTOP;
	}

	const isOutOfBounds = e => {
		const db = dragBounds;
		const outOfBoundsX = e.clientX < db.x.min || e.clientX > db.x.max;
		const outOfBoundsY = e.clientY < db.y.min || e.clientY > db.y.max;
		return outOfBoundsX || outOfBoundsY;
	}

	// hammer event properties are different from native, this changes the event
	// and will call the regular function after
	$scope.standardizeEvent = (hammerEvent, param2, cb)=> {
		hammerEvent.clientX = hammerEvent.center.x;
		hammerEvent.clientY = hammerEvent.center.y;
		hammerEvent.currentTarget = hammerEvent.target;
		if (param2) {
			cb(hammerEvent, param2);
		} else {
			cb(hammerEvent);
		}
	}

	$scope.mouseMove = e => {
		if (e.center) { // if it's a hammer event
			const underElem = $(document.elementFromPoint(e.clientX, e.clientY));
			const folderElem = underElem.closest(".folder");
			if (folderElem.length) {
				folderElem.addClass("peeked");
			} else {
				$(".peeked").removeClass("peeked");
			}
		}

		if (itemSelected) {
			if (isOutOfBounds(e)) {
				console.log("outOfBounds!");
				return $scope.mouseUp(e);
			}
			const top = e.clientY - 30;
			const left = e.clientX - 50;
			$(itemSelected).css({ top, left });
		}
	}

	$scope.mouseUp = e => {
		$(".peeked").removeClass("peeked");
		if (!itemSelected) {
			return;
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}

		$(itemSelected).css({ "z-index": 1 })

		const underElem = $(document.elementFromPoint(e.clientX, e.clientY));
		if (isOutOfBounds(e) || underElem.attr("id") == "dock") {
			// put it back if it's out of bounds or over the dock but not a folder
			$(itemSelected).css({
				top: prevPosition.top,
				left: prevPosition.left
			});
		} else {
			// if dragged on a folder, put it in
			const folderElem = underElem.closest(".folder");
			if (folderElem.length) {
				$scope.selectFolder(e, folderElem.data("index"));
			}
		}

		// source is a folder
		if (itemSource != SRC_DESKTOP) {
			if (underElem.attr("id") == "back-to-desktop") {
				// if dragged on to the gray background, put it back on the desktop
				$scope.folders[itemSource].items = $scope.folders[itemSource].items.filter(
					item => item != $scope.selectedText
				);
				$scope.desktopItems.push({
					text: $scope.selectedText,
					position: {
						x: e.clientX - 35,
						y: e.clientY - 30
					}
				})
			}
			$(itemSelected).css({ position: "static" });
		}

		itemSelected = false;
		$scope.selectedText = false;
		itemSource = SRC_DESKTOP;
	}

	$scope.selectFolder = (e, index) => {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (index == itemSource) {
			return;
		}

		if ($scope.selectedText) {
			$scope.folders[index].items.push($scope.selectedText);

			if (itemSource == SRC_DESKTOP) {
				$scope.desktopItems = $scope.desktopItems.filter(
					item => item.text != $scope.selectedText
				);
			} else {
				$scope.folders[itemSource].items = $scope.folders[itemSource].items.filter(
					item => item != $scope.selectedText
				);
			}

			$(".desktop-item.selected").removeClass("selected");
			itemSelected = false;
			$scope.selectedText = false;
			itemSource = SRC_DESKTOP;
		} else {
			$scope.showFolderPreview = true;
			$scope.folderPreviewIndex = index;
		}
	}

	$scope.hideFolderPreview = () => {
		$scope.showFolderPreview = false;
		$scope.folderPreviewIndex = -1;
	}

	$scope.readyToSubmit = () => $scope.desktopItems.length == 0;

	$scope.previewMouseDown = (e, text) => {
		itemSelected = e.currentTarget;
		$scope.selectedText = text;

		const top = e.clientY - 30;
		const left = e.clientX - 50;
		$(itemSelected).css({ position: "fixed", top, left });
		prevPosition = { top, left };
		itemSource = $scope.folderPreviewIndex;
	}

	const generateQuestionToId = qset => {
		questionToId = {};
		for (let item of qset.items) {
			questionToId[item.questions[0].text] = item.id;
		}
	}

	$scope.submitClick = () => {
		console.log("\n\n\n\n");
		console.log("desktopItems: ", $scope.desktopItems);
		console.log("folders: ", $scope.folders);

		if (!$scope.readyToSubmit()) {
			return;
		}

		$scope.folders.forEach( ({text, items}) => {
			items.forEach( item => {
				const id = questionToId[item];
				Materia.Score.submitQuestionForScoring(id, text)

			});
		});
		Materia.Engine.end();
	}

	Materia.Engine.start($scope);
});

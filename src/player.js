const SortItOut = angular.module("SortItOutEngine", ["hmTouchEvents"]);
//const SortItOut = angular.module("SortItOutEngine", []);

//hammerDefaultOptsProvider.set({recognizers: [[Hammer.Tap, {time: 250}]] });

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

	$scope.showFolderPreview = false;
	$scope.selectedText = false;
	let itemSelected;
	let prevPosition;
	let placementBounds; // bounds for random placement
	let dragBounds;      // bounds for dragging

	$scope.start = (instance, qset, version) => {
		generateBounds();
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
				min: 15,
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

	$scope.logEverything = () => {
		console.log("\n\n\n\n");
		console.log("desktopItems: ", $scope.desktopItems);
		console.log("folders: ", $scope.folders);
	}

	$scope.itemMouseDown = (e, text) => {
		if (itemSelected) {
			console.log("there's already something selected??");
		}
		itemSelected = e.currentTarget;
		$scope.selectedText = text;

		const top = e.clientY - 30;
		const left = e.clientX - 50;
		$(itemSelected).css({ top, left });
		prevPosition = { top, left };
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

		if (isOutOfBounds(e)) {
			// put it back if it's out of bounds
			$(itemSelected).css({
				top: prevPosition.top,
				left: prevPosition.left
			});
		} else {
			// if dragged on a folder, put it in
			const underElem = $(document.elementFromPoint(e.clientX, e.clientY));
			const folderElem = underElem.closest(".folder");
			if (folderElem.length) {
				$scope.selectFolder(e, folderElem.data("index"));
			}

			// if dragged onto dock but not in folder, put it back
			if (underElem.attr("id") == "dock") {
				$(itemSelected).css({
					top: prevPosition.top,
					left: prevPosition.left
				})
			}
		}

		itemSelected = false;
		$scope.selectedText = false;
	}

	$scope.selectFolder = (e, index) => {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if ($scope.selectedText) {
			$scope.folders[index].items.push($scope.selectedText);
			$scope.desktopItems = $scope.desktopItems.filter(
				item => item.text != $scope.selectedText
			);
			$(".desktop-item.selected").removeClass("selected");
			$scope.selectedText = false;
			itemSelected = false;
		} else {
			$scope.showFolderPreview = true;
			$scope.folderPreviewIndex = index;
		}
	}

	$scope.hideFolderPreview = () => {
		$scope.showFolderPreview = false;
		$scope.folderPreviewIndex = -1;
	}

	$scope.peekFolder = index => {
		$scope.folders[index].peeked = true;
	}

	Materia.Engine.start($scope);
});

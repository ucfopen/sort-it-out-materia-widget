const SortItOut = angular.module("SortItOutEngine", ["hmTouchEvents"]);
//const SortItOut = angular.module("SortItOutEngine", []);

//hammerDefaultOptsProvider.set({recognizers: [[Hammer.Tap, {time: 250}]] });

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

	$scope.showFolderPreview = false;
	$scope.selectedText = false;
	let itemSelected;
	let prevPosition;
	let bounds;

	$scope.start = (instance, qset, version) => {
		bounds = generateBounds();
		$scope.instance = instance;
		$scope.folders = buildFolders(qset);
		$scope.desktopItems = buildItems(qset);
		$scope.$apply();
	}

	const generateBounds = () => {
		const width = $("#desktop").width();
		const height = $("#desktop").height();
		const x = {
			min: 15,
			max: width - 15
		};
		const y = {
			min: 15,
			max: height - 15
		};
		return { x, y };
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
		const yRange = bounds.y.max - bounds.y.min - 125;
		const y = ~~(Math.random() * (yRange) ) + bounds.y.min;
		const xRange = bounds.x.max - bounds.x.min;
		const x = ~~(Math.random() * (xRange) ) + bounds.x.min;
		return { x, y };
	}

	const scatterItems = () => {
		console.log("scatterItems");
		$(".desktop-item").each(function() {
			console.log(this);
		});
	}

	$scope.logEverything = () => {
		console.log("\n\n\n\n");
		console.log("desktopItems: ", $scope.desktopItems);
		console.log("folders: ", $scope.folders);
	}

	$scope.itemMouseDown = (e, text) => {
		console.log(e);
		if (itemSelected) {
			console.log("there's already something selected??");
		}
		itemSelected = e.currentTarget;
		$scope.selectedText = text;

		const top = e.clientY - 30;
		const left = e.clientX - 50;
		console.log(top, left);
		$(itemSelected).css({ top, left });
		prevPosition = { top, left };
	}

	const isOutOfBounds = e => {
		const outOfBoundsX = e.clientX < bounds.x.min || e.clientX > bounds.x.max;
		const outOfBoundsY = e.clientY < bounds.y.min || e.clientY > bounds.y.max;
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
				$scope.selectFolder(false, folderElem.data("index"));
			} else {
				console.log("not on a folder; x, y: ", e.clientX, e.clientY)
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

	Materia.Engine.start($scope);
});

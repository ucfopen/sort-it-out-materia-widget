const SortItOut = angular.module("SortItOutEngine", []);

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

	$scope.showFolderPreview = false;
	$scope.selectedText = false;
	let itemSelected;
	const minBoundsX = 15;
	const maxBoundsX = 785;
	const minBoundsY = 60;
	const maxBoundsY = 550;

	$scope.start = (instance, qset, version) => {
		console.log("qset: ", qset);
		$scope.instance = instance;
		$scope.folders = buildFolders(qset);
		$scope.desktopItems = buildItems(qset);
		$scope.$apply();
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
		return qset.items.map( item =>
			item.questions[0].text
		);
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

		$(itemSelected).css({
			position: "absolute",
			top: e.clientY - 30,
			left: e.clientX - 50
		});
		$scope.selectedText = text;
	}

	$scope.mouseUp = () => {
		itemSelected = false;
		$scope.selectedText = false;
	}

	$scope.mouseMove = e => {
		if (itemSelected) {
			const outOfBoundsY = e.clientY < minBoundsY || e.clientY > maxBoundsY;
			const outOfBoundsX = e.clientX < minBoundsX || e.clientX > maxBoundsX;
			if (outOfBoundsY || outOfBoundsX) {
				console.log("outOfBounds!");
				return $scope.mouseUp(e);
			}
			console.log(e);
			$(itemSelected).css({
				position: "absolute",
				top: e.clientY - 30,
				left: e.clientX - 50
			});
		}
	}

	$scope.selectFolder = (e, index) => {
		e.stopPropagation();
		if ($scope.selectedText) {
			$scope.folders[index].items.push($scope.selectedText);
			$scope.desktopItems = $scope.desktopItems.filter(
				text => text != $scope.selectedText
			);
			$(".desktop-item.selected").removeClass("selected");
			$scope.selectedText = false;
		} else {
			$scope.showFolderPreview = true;
			$scope.folderPreviewIndex = index;
		}
	}

	Materia.Engine.start($scope);
});

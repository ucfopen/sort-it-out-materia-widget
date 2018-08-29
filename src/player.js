const SortItOut = angular.module("SortItOutEngine", []);

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

	let selectedText;

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

	$scope.selectItem = (e, text) => {
		const target = $(e.currentTarget);
		const alreadySelected = target.hasClass("selected");

		$(".desktop-item.selected").removeClass("selected");
		if (alreadySelected) {
			selectedText = null;
		} else {
			target.addClass("selected");
			selectedText = text;
		}
	}

	$scope.selectFolder = index => {
		if (selectedText) {
			$scope.folders[index].items.push(selectedText);
			$scope.desktopItems = $scope.desktopItems.filter(
				text => text != selectedText
			);
			$(".desktop-item.selected").removeClass("selected");
			selectedText = null;
		} else {
			console.log("this would open the folder");
		}
	}

	Materia.Engine.start($scope);
});


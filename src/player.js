const SortItOut = angular.module("SortItOutEngine", []);

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

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

	Materia.Engine.start($scope);
});


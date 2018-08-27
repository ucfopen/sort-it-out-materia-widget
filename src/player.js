const SortItOut = angular.module("SortItOutEngine", []);

SortItOut.controller("SortItOutEngineCtrl", ($scope) => {

	$scope.start = (instance, qset, version) => {
		console.log("qset: ", qset);
		$scope.instance = instance;
		$scope.folders = buildFolders(qset);
		$scope.items = buildItems(qset);
		$scope.$apply();
	}

	const buildFolders = qset => {
		let folders = [];
		console.log("buildFolders");
		return folders;
	}

	const buildItems = qset => {
		let items = [];
		console.log("buildItems");
		return items;
	}

	Materia.Engine.start($scope);
});


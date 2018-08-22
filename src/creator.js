// creator js!
const SortItOut = angular.module("SortItOutController", ['ngMaterial', 'ngMessages']);

SortItOut.config( ($mdThemingProvider) =>
	$mdThemingProvider.theme('toolbar-dark', 'default').primaryPalette('indigo').dark()
);

SortItOut.controller("SortItOutController", ($scope) => {
	$scope.initNewWidget = (widget) => {
		$scope.title = "My Sort-It-Out Widget";
		$scope.$apply();
	};

	$scope.initExistingWidget = (title, widget, qset) => {
		$scope.title = title;
		$scope.qset = qset;
	};

	$scope.onSaveClicked = () => {
		Materia.CreatorCore.save($scope.title, $scope.qset);
	};

	$scope.onQuestionImportComplete = (items) => {
		// TODO
		return true;
	};

	$scope.onSaveComplete = () => {
		// TODO
		return true;
	};
});

/* TODO
SortItOut.factory("Resource", () => {
	{
		buildQset: ( ... ) => {
			// TODO
		},

		processQsetItem: () => {
			// TODO
		}
	}
})
*/

describe('Player Controller', function() {
	require('angular/angular.js');
	require('angular-mocks/angular-mocks.js');
	require('angular-animate/angular-animate.js');
	require('./hammer.min.js');
	require('./angular-hammer.js');
	require('jquery/jquery.min.js');

	var $scope
	var $controller
	var $timeout
	var widgetInfo
	var qset

	beforeEach(() => {
		jest.resetModules();

		// mock materia
		global.Materia = {
			Engine: {
				end: jest.fn(),
				getMediaUrl: jest.fn( (id) => `media/${id}`),
				start: jest.fn()
			},
			Score: {
				submitQuestionForScoring: jest.fn()
			}
		}

		angular.mock.module('SortItOutEngine')
		require('./player.js')

		// load qset
		widgetInfo = require('./demo.json')
		qset = widgetInfo.qset;

		// mock scope
		$scope = {
			$apply: jest.fn()
		}

		// initialize the angular controller
		inject(function(_$controller_, _$timeout_){
			// instantiate the controller
			$controller = _$controller_('SortItOutEngineCtrl', { $scope: $scope });
			$timeout = _$timeout_;
		})
	})

	it('should start properly', function() {
		$scope.start(widgetInfo, qset.data);
		expect($scope.title).toBe("Famous Artists");
		expect($scope.folders.length).toBe(5);
	});

	it('should have the folders in the correct order', function() {
		$scope.start(widgetInfo, qset.data);
		expect($scope.folders[0].text).toBe("Vincent van Gogh");
		expect($scope.folders[1].text).toBe("Pablo Picasso");
		expect($scope.folders[2].text).toBe("Claude Monet");
		expect($scope.folders[3].text).toBe("Leonardo da Vinci");
		expect($scope.folders[4].text).toBe("Salvador Dali");
	});

	it('should not allow submission of incomplete session', function() {
		$scope.start(widgetInfo, qset.data);
		$scope.submitClick();
		expect(Materia.Engine.end).not.toHaveBeenCalled();
		expect(Materia.Score.submitQuestionForScoring).not.toHaveBeenCalled();
		expect($scope.showNoSubmit).toBe(true)
		$timeout.flush();
		expect($scope.showNoSubmit).toBe(false)
	});

	it('should successfully submit', function() {
		$scope.start(widgetInfo, qset.data);

		// just dump everything in the first folder
		$scope.folders[0].items = $scope.desktopItems;
		$scope.desktopItems = [];

		expect($scope.desktopItems.length).toBe(0);
		expect($scope.folders.length).toBe(5);
		expect($scope.folders[0].items.length).toBe(17);
		$scope.submitClick();
		expect($scope.showNoSubmit).toBe(false);
		expect(Materia.Score.submitQuestionForScoring).toHaveBeenCalledTimes(17);
		expect(Materia.Engine.end).toHaveBeenCalledTimes(1);
	});

	it('should load a background image by id', function() {
		var qset2 = JSON.parse(JSON.stringify(qset));
		qset2.data.options = {
			backgroundImageAsset: false,
			backgroundImageId: "a12bc"
		};
		$scope.start(widgetInfo, qset2.data);
		expect($scope.backgroundImage).toBe("media/a12bc");
	});
});

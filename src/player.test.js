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
				start: jest.fn(),
				end: jest.fn()
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
		expect($scope.showNoSubmit).toBe(true)
		$timeout.flush();
		expect($scope.showNoSubmit).toBe(false)
	});
});

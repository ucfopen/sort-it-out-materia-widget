describe('Creator Controller', function() {
	require('angular/angular.js');
	require('angular-material/angular-material.js');
	require('angular-messages/angular-messages.js');
	require('angular-sanitize/angular-sanitize.js');
	require('angular-animate/angular-animate.js');
	require('angular-aria/angular-aria.js');
	require('angular-mocks/angular-mocks.js');

	var $scope
	var $controller
	var $timeout
	var widgetInfo
	var qset

	beforeEach(() => {
		jest.resetModules();

		// mock materia
		global.Materia = {
			CreatorCore: {
				start: jest.fn(),
				alert: jest.fn(),
				cancelSave: jest.fn(),
				save: jest.fn().mockImplementation((title, qset) => {
					//the creator core calls this on the creator when saving is successful
					$scope.onSaveComplete();
					return {title: title, qset: qset};
				})
			}
		}

		// load qset
		widgetInfo = require('./demo.json')
		qset = widgetInfo.qset;

		// load the required code
		angular.mock.module('SortItOutCreator')
		angular.module('dndLists', [])
		require('./creator.js')

		// mock scope
		$scope = {
			$apply: () => null // TODO idk what's going on here
		}

		// initialize the angualr controller
		inject(function(_$controller_, _$timeout_){
			$timeout = _$timeout_;
			// instantiate the controller
			$controller = _$controller_('SortItOutController', { $scope: $scope });
		})
	})

	it('should make a new widget', function(){
		expect($scope.ready).toBe(false);
		$scope.initNewWidget(widgetInfo);
		//time to check default values
		expect($scope.title).toBe('My Sort-It-Out Widget');
		expect($scope.backgroundImage).toBe('assets/desktop.jpg');
		expect($scope.ready).toBe(true);

		//next make sure there is one sample folder
		expect($scope.folders.length).toBe(1);
		expect($scope.folders[0].name).toBe('Sample Folder');
		expect($scope.folders[0].items.length).toBe(1);
		expect($scope.folders[0].items[0].text).toBe('Sample Item');
	});

	it('should make an existing widget', function() {
		expect($scope.ready).toBe(false);
		$scope.initExistingWidget(widgetInfo);
		// check widget info
		expect($scope.title).toBe('Famous Artists');
		expect($scope.backgroundImage).toBe('assets/canvas.jpg');
		expect($scope.ready).toBe(true);
	});
});

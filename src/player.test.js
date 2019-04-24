describe('Player Controller', function() {
	require('angular/angular');
	require('angular-mocks/angular-mocks');
	window.$ = require('jquery/dist/jquery.min.js');

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

		angular.module('hmTouchEvents', []) // mock angular-hammer
		angular.module('ngAnimate', []) // mock angular-animate
		angular.module('ngAria', []) // mock ng-aria
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

	it('should show the folder preview', function() {
		$scope.start(widgetInfo, qset.data);
		expect($scope.showFolderPreview).toBe(false);
		expect($scope.folderPreviewIndex).toBeUndefined();

		expect($scope.selectedItem).toBe(false);
		$scope.selectFolder({}, 1);
		expect($scope.showFolderPreview).toBe(true);
		expect($scope.folderPreviewIndex).toBe(1);
	});

	it('should hide the folder preview', function() {
		$scope.start(widgetInfo, qset.data);
		$scope.selectFolder({}, 1);
		expect($scope.showFolderPreview).toBe(true);
		expect($scope.folderPreviewIndex).toBe(1);
		$scope.hideFolderPreview();
		expect($scope.showFolderPreview).toBe(false);
		expect($scope.folderPreviewIndex).toBe(-1);
	});

	it('should check out of bounds properly', function() {
		$scope.start(widgetInfo, qset.data);

		// set the drag bounds
		$scope.dragBounds = {
			x: {
				min: 1,
				max: 10
			},
			y: {
				min: 30,
				max: 40
			}
		}

		var test1 = {clientX:  5, clientY: 35} // x valid, y valid
		var test2 = {clientX: 20, clientY: 35} // x over,  y valid
		var test3 = {clientX: -1, clientY: 35} // x under, y valid
		var test4 = {clientX:  5, clientY: 45} // x valid, y over
		var test5 = {clientX: 20, clientY: 45} // x over,  y over
		var test6 = {clientX: -1, clientY: 45} // x under, y over
		var test7 = {clientX:  5, clientY: 10} // x valid, y under
		var test8 = {clientX: 20, clientY: 10} // x over,  y under
		var test9 = {clientX: -1, clientY: 10} // x under, y under

		expect($scope.isOutOfBounds(test1)).toBe(false)
		expect($scope.isOutOfBounds(test2)).toBe(true)
		expect($scope.isOutOfBounds(test3)).toBe(true)
		expect($scope.isOutOfBounds(test4)).toBe(true)
		expect($scope.isOutOfBounds(test5)).toBe(true)
		expect($scope.isOutOfBounds(test6)).toBe(true)
		expect($scope.isOutOfBounds(test7)).toBe(true)
		expect($scope.isOutOfBounds(test8)).toBe(true)
		expect($scope.isOutOfBounds(test9)).toBe(true)
	});

	it('should convert hammer events properly', function() {
		$scope.start(widgetInfo, qset.data);

		var fake = jest.fn();
		var event = {
			center: {
				x: 1,
				y: 2
			},
			target: {
				test: "yes"
			}
		}

		$scope.standardizeEvent(event, false, fake);

		expect(fake).toHaveBeenCalledTimes(1);
		expect(fake).toHaveBeenCalledWith({
			center: {
				x: 1,
				y: 2
			},
			target: {
				test: "yes"
			},
			clientX: 1,
			clientY: 2,
			currentTarget: {
				test: "yes"
			}
		});
	});

	it('should convert hammer events and call the callback with a given parameter', function() {
		$scope.start(widgetInfo, qset.data);

		var fake = jest.fn();
		var event = {
			center: {
				x: 1,
				y: 2
			},
			target: {
				test: "yes"
			}
		}

		$scope.standardizeEvent(event, "param", fake);

		expect(fake).toHaveBeenCalledTimes(1);
		expect(fake).toHaveBeenCalledWith(
			{
				center: {
					x: 1,
					y: 2
				},
				target: {
					test: "yes"
				},
				clientX: 1,
				clientY: 2,
				currentTarget: {
					test: "yes"
				}
			},
			"param"
		);
	});

	it('should set focus target as the selected item', function() {
		$scope.start(widgetInfo, qset.data);
		var item = $scope.desktopItems[0];
		$scope.handleItemFocus({},item);

		expect($scope.selectedItem).toBe(item);
	})

	it('should apply sorted properties to desktop items once categorized', function() {
		$scope.start(widgetInfo, qset.data);
		var item = $scope.desktopItems[0];
		$scope.handleItemFocus({},item);

		expect($scope.selectedItem).toBe(item);

		$scope.selectFolder({},0);

		expect($scope.desktopItems[0].sorted).toBe(true)
		expect($scope.desktopItems[0].folder).toBe(0)
	})

	it('should select a folder using the arrow keys and spacebar', function() {
		$scope.start(widgetInfo, qset.data);
		var item = $scope.desktopItems[0];
		var arrowEvent = new KeyboardEvent('keydown', {'keyCode': 40});
		var spaceEvent = new KeyboardEvent('keydown', {'keyCode': 32});

		$scope.handleItemFocus({},item);

		$scope.handleAssistiveSelection(arrowEvent,item);

		expect($scope.desktopItems[0].folder).toBe(-1)

		$scope.handleAssistiveSelection(spaceEvent,item);

		expect($scope.desktopItems[0].sorted).toBe(true)
		expect($scope.desktopItems[0].folder).toBe(0)		
	})
});

describe('ScoreScreen Controller', function() {
	require('angular/angular.js');
	require('angular-mocks/angular-mocks.js');
	require('angular-animate/angular-animate.js');
	window.$ = require('jquery/dist/jquery.min.js');

	var $scope
	var $controller
	var $timeout
	var widgetInfo
	var qsets
	var scoreTables

	beforeEach(() => {
		jest.resetModules();

		// mock materia
		global.Materia = {
			ScoreCore: {
				getMediaUrl: jest.fn( (id) => `media/${id}`),
				hideResultsTable: jest.fn(),
				setHeight: jest.fn(),
				start: jest.fn()
			}
		}

		angular.mock.module('SortItOutScore')
		require('./scoreScreen.js')

		// mock scope
		$scope = {
			$apply: jest.fn()
		}

		scoreTables = generateScoreTables()
		qsets = generateQsets()

		// initialize the angular controller
		inject(function(_$controller_, _$timeout_){
			// instantiate the controller
			$controller = _$controller_('SortItOutScoreCtrl', { $scope: $scope });
			$timeout = _$timeout_;
		})
	})

	var quickStart = (qset, scoreTable) => {
		var instance = {};
		var isPreview = false;
		$scope.start(instance, qset, scoreTable, isPreview);
	}

	it('should start properly', function() {
		expect(Materia.ScoreCore.start).toHaveBeenCalled();
		expect(Materia.ScoreCore.hideResultsTable).toHaveBeenCalled();

		quickStart(qsets[0], scoreTables[0]);
		$timeout.flush();
		expect($scope.folders.length).toBe(2);
	});

	it('should start properly with images', function() {
		quickStart(qsets[1], scoreTables[1]);
	});

	it('should have the folders in the correct order', function() {
		quickStart(qsets[0], scoreTables[0]);
		expect($scope.folders[0].name).toBe("Folder 1");
		expect($scope.folders[1].name).toBe("Folder 2");
	});

	it('should handle correct answers', function() {
		quickStart(qsets[0], scoreTables[0]);

		// check values for first folder
		expect($scope.folders[0].name).toBe("Folder 1");
		expect($scope.folders[0].items.length).toBe(1);
		expect($scope.folders[0].extraItems.length).toBe(0);
		expect($scope.folders[0].correctCount).toBe(1);
		expect($scope.folders[0].pointsOff).toBe(0);

		// check items in first folder
		expect($scope.folders[0].items[0].correct).toBe(true);
		expect($scope.folders[0].items[0].image).toBe(false);
		expect($scope.folders[0].items[0].text).toBe("Item 1");
		expect($scope.folders[0].items[0].userFolderName).toBe("Folder 1");

		// check values for second folder
		expect($scope.folders[1].name).toBe("Folder 2");
		expect($scope.folders[1].items.length).toBe(1);
		expect($scope.folders[1].extraItems.length).toBe(0);
		expect($scope.folders[1].correctCount).toBe(1);
		expect($scope.folders[1].pointsOff).toBe(0);

		// check items in second folder
		expect($scope.folders[1].items[0].correct).toBe(true);
		expect($scope.folders[1].items[0].image).toBe(false);
		expect($scope.folders[1].items[0].text).toBe("Item 2");
		expect($scope.folders[1].items[0].userFolderName).toBe("Folder 2");
	});

	it('should handle wrong answers', function() {
		// swap the responses for the items
		var s = scoreTables[0];
		[s[0].data[1], s[1].data[1]] = [s[1].data[1], s[0].data[1]];

		quickStart(qsets[0], scoreTables[0]);

		// check values for first folder
		expect($scope.folders[0].name).toBe("Folder 1");
		expect($scope.folders[0].items.length).toBe(1);
		expect($scope.folders[0].extraItems.length).toBe(1);
		expect($scope.folders[0].correctCount).toBe(0);
		expect($scope.folders[0].pointsOff).toBe(0 - $scope.questionValue);

		// check items in first folder
		expect($scope.folders[0].items[0].correct).toBe(false);
		expect($scope.folders[0].items[0].image).toBe(false);
		expect($scope.folders[0].items[0].text).toBe("Item 1");
		expect($scope.folders[0].items[0].userFolderName).toBe("Folder 2");

		// check values for second folder
		expect($scope.folders[1].name).toBe("Folder 2");
		expect($scope.folders[1].items.length).toBe(1);
		expect($scope.folders[1].extraItems.length).toBe(1);
		expect($scope.folders[1].correctCount).toBe(0);
		expect($scope.folders[1].pointsOff).toBe(0 - $scope.questionValue);

		// check items in second folder
		expect($scope.folders[1].items[0].correct).toBe(false);
		expect($scope.folders[1].items[0].image).toBe(false);
		expect($scope.folders[1].items[0].text).toBe("Item 2");
		expect($scope.folders[1].items[0].userFolderName).toBe("Folder 1");
	});

	it('should be able to swap between different plays, even if the widget data differs', function() {
		// for a published widget that has been edited but there are score logs for both verions

		// start with one qset/scoretable
		quickStart(qsets[0], scoreTables[0]);

		// then swap the data (user uses "prev. attempts" dropdown)
		$scope.update(qsets[1], scoreTables[1])

		// then check everything
		// check values for first folder
		expect($scope.folders[0].name).toBe("Folder 1");
		expect($scope.folders[0].items.length).toBe(2);
		expect($scope.folders[0].extraItems.length).toBe(0);
		expect($scope.folders[0].correctCount).toBe(2);
		expect($scope.folders[0].pointsOff).toBe(0);

		// check items in first folder
		expect($scope.folders[0].items[0].correct).toBe(true);
		expect($scope.folders[0].items[0].image).toBe(false);
		expect($scope.folders[0].items[0].text).toBe("Item 1");
		expect($scope.folders[0].items[0].userFolderName).toBe("Folder 1");
		expect($scope.folders[0].items[1].correct).toBe(true);
		expect($scope.folders[0].items[1].image).toBe("media/q29nk");
		expect($scope.folders[0].items[1].text).toBe("Picture 1");
		expect($scope.folders[0].items[1].userFolderName).toBe("Folder 1");

		// check values for second folder
		expect($scope.folders[1].name).toBe("Folder 2");
		expect($scope.folders[1].items.length).toBe(1);
		expect($scope.folders[1].extraItems.length).toBe(0);
		expect($scope.folders[1].correctCount).toBe(1);
		expect($scope.folders[1].pointsOff).toBe(0);

		// check items in second folder
		expect($scope.folders[1].items[0].correct).toBe(true);
		expect($scope.folders[1].items[0].image).toBe(false);
		expect($scope.folders[1].items[0].text).toBe("Item 2");
		expect($scope.folders[1].items[0].userFolderName).toBe("Folder 2");
	})

	it('should zoom an image correctly', function() {
		quickStart(qsets[1], scoreTables[1]);
		expect($scope.zoomIndex.folder).toBe(-1);
		expect($scope.zoomIndex.item).toBe(-1);

		// the second item in the first folder of the qset has an image
		$scope.zoomImage(0, 1);
		expect($scope.zoomIndex.folder).toBe(0);
		expect($scope.zoomIndex.item).toBe(1);
	});

	it('should unzoom an image correctly', function() {
		quickStart(qsets[1], scoreTables[1]);
		expect($scope.zoomIndex.folder).toBe(-1);
		expect($scope.zoomIndex.item).toBe(-1);

		// the second item in the first folder of the qset has an image
		$scope.zoomImage(0, 1);
		expect($scope.zoomIndex.folder).toBe(0);
		expect($scope.zoomIndex.item).toBe(1);

		// zooming something that is already zoomed with unzoom it
		$scope.zoomImage(0, 1);
		expect($scope.zoomIndex.folder).toBe(-1);
		expect($scope.zoomIndex.item).toBe(-1);
	});

	it('should swap between zoomed images correctly', function() {
		quickStart(qsets[1], scoreTables[1]);
		expect($scope.zoomIndex.folder).toBe(-1);
		expect($scope.zoomIndex.item).toBe(-1);

		// zoom one image
		$scope.zoomImage(0, 1);
		expect($scope.zoomIndex.folder).toBe(0);
		expect($scope.zoomIndex.item).toBe(1);

		// click the zoom button on a different picture without unzooming the previous
		$scope.zoomImage(1, 1);
		expect($scope.zoomIndex.folder).toBe(1);
		expect($scope.zoomIndex.item).toBe(1);
	});

	var generateScoreTables = () => {
		// the 100% correct score tables that match each qset
		var scoreTable1 = [
			{
				"data": ["Item 1", "Folder 1", "Folder 1"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			},
			{
				"data": ["Item 2", "Folder 2", "Folder 2"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			}
		];

		var scoreTable2 = [
			{
				"data": ["Picture 1", "Folder 1", "Folder 1"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			},
			{
				"data": ["Item 1", "Folder 1", "Folder 1"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			},
			{
				"data": ["Item 2", "Folder 2", "Folder 2"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			}
		];

		var scoreTable3 = [
			{
				"data": ["Picture 1", "Folder 1", "Folder 1"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			},
			{
				"data": ["Item 1", "Folder 1", "Folder 1"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			},
			{
				"data": ["Item 2", "Folder 2", "Folder 2"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			},
			{
				"data": ["Picture 2", "Folder 2", "Folder 2"],
				"data_style": ["question", "response", "answer"],
				"score": 100,
				"feedback": null,
				"type": "SCORE_QUESTION_ANSWERED",
				"style": "full-value",
				"tag": "div",
				"symbol": "%",
				"graphic": "score",
				"display_score": true
			}
		];

		return [scoreTable1, scoreTable2, scoreTable3];
	}

	var generateQsets = () => {
		var qset1 = {
			"items": [
				{
					"questions": [{ "text": "Item 1" }],
					"answers": [{ "text": "Folder 1" }],
					"options": [],
					"assets": []
				},
				{
					"questions": [{ "text": "Item 2" }],
					"answers": [{ "text": "Folder 2" }],
					"options": [],
					"assets": []
				}
			],
			"options": {
				"backgroundImageAsset": "assets/desktop.jpg"
			}
		};

		var qset2 = {
			"items": [
				{
					"questions": [{ "text": "Item 1" }],
					"answers": [{ "text": "Folder 1" }],
					"options": [],
					"assets": []
				},
				{
					"questions": [{ "text": "Picture 1" }],
					"answers": [{ "text": "Folder 1" }],
					"options": {
						"image": "q29nk"
					},
					"assets": []
				},
				{
					"questions": [{ "text": "Item 2" }],
					"answers": [{ "text": "Folder 2" }],
					"options": [],
					"assets": []
				}
			],
			"options": {
				"backgroundImageAsset": "assets/desktop.jpg"
			},
			"id": "5963"
		};

		var qset3 = {
			"items": [
				{
					"questions": [{ "text": "Item 1" }],
					"answers": [{ "text": "Folder 1" }],
					"options": [],
					"assets": []
				},
				{
					"questions": [{ "text": "Picture 1" }],
					"answers": [{ "text": "Folder 1" }],
					"options": {
						"image": "q29nk"
					},
					"assets": []
				},
				{
					"questions": [{ "text": "Item 2" }],
					"answers": [{ "text": "Folder 2" }],
					"options": [],
					"assets": []
				},
				{
					"questions": [{ "text": "Picture 2" }],
					"answers": [{ "text": "Folder 2" }],
					"options": {
						"image": "a41gm"
					},
					"assets": []
				}
			],
			"options": {
				"backgroundImageAsset": "assets/desktop.jpg"
			}
		};

		return [qset1, qset2, qset3];
	}
});

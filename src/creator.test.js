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
				cancelSave: jest.fn().mockImplementation((msg) => {
					throw new Error(msg)
				}),
				save: jest.fn().mockImplementation((title, qset) => {
					//the creator core calls this on the creator when saving is successful
					$scope.onSaveComplete();
					return {title: title, qset: qset};
				}),
				showMediaImporter: jest.fn().mockImplementation(() => {
					$scope.onMediaImportComplete([{
						id: 'abc'
					}]);
				}),
				getMediaUrl: jest.fn().mockImplementation(id => {
					return 'http://' + id + '.jpg';
				})
			}
		}

		// load qset
		widgetInfo = require('./demo.json')
		qset = widgetInfo.qset;

		// load the required code
		angular.mock.module('SortItOutCreator')
		require('./creator.js')

		// mock scope
		$scope = {
			$apply: jest.fn() // TODO idk what's going on here
			// $apply: jest.fn().mockImplementation(fn => {fn()})
		}

		// initialize the angular controller
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
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		// check widget info
		expect($scope.title).toBe('Famous Artists');
		expect($scope.backgroundImage).toBe('assets/canvas.jpg');
		expect($scope.ready).toBe(true);
	});

	it('should have the folders in the correct order', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.folders[0].name).toBe("Vincent van Gogh");
		expect($scope.folders[1].name).toBe("Pablo Picasso");
		expect($scope.folders[2].name).toBe("Claude Monet");
		expect($scope.folders[3].name).toBe("Leonardo da Vinci");
		expect($scope.folders[4].name).toBe("Salvador Dali");
	});

	it('should add a new item to a folder', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.folders[0].items.length).toBe(4);
		$scope.addItem(0);
		var itemsLength = $scope.folders[0].items.length
		expect(itemsLength).toBe(5);
		expect($scope.folders[0].items[itemsLength - 1].text).toBe("");
	});

	it('should remove an item from a folder', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		$scope.addItem(0);
		var itemsLength = $scope.folders[0].items.length;
		expect(itemsLength).toBe(5);
		$scope.removeItem(0, itemsLength - 1);
		expect($scope.folders[0].items.length).toBe(4);
	});

	it('should allow 6 folders to be added', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.folders.length).toBe(5);
		expect($scope.canAddFolder()).toBe(true);
		$scope.newFolder.name = "test"
		$scope.createFolder();
		expect($scope.folders.length).toBe(6);
	});

	it('should prevent more than 6 folders', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		$scope.newFolder.name = "test"
		$scope.createFolder();
		expect($scope.folders.length).toBe(6);
		expect($scope.canAddFolder()).toBe(false);
		$scope.createFolder();
		expect($scope.folders.length).toBe(6);
		expect($scope.canAddFolder()).toBe(false);
	});

	it('should allow a folder to be deleted', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		$scope.newFolder.name = "test"
		$scope.createFolder();
		$scope.createFolder();
		expect($scope.folders.length).toBe(6);

		$scope.deleteFolder(5);
		expect($scope.folders.length).toBe(5);
	});

	it('should prevent adding another item in an invalid folder', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		expect($scope.folders[0].items.length).toBe(4);
		$scope.addItem(0); // this should work
		expect($scope.folders[0].items.length).toBe(5);
		$scope.addItem(0); // this should not work
		expect($scope.folders[0].items.length).toBe(5);

		$scope.folders[0].items[4].text = "test"
		$scope.addItem(0); // this should work
		expect($scope.folders[0].items.length).toBe(6);
		$scope.addItem(0); // this should not work
		expect($scope.folders[0].items.length).toBe(6);
	});

	it('should be able to undo the deletion of an item', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		expect($scope.folders[2].items.length).toBe(3);
		var item = $scope.folders[2].items[2];
		$scope.removeItem(2, 2);
		expect($scope.folders[2].items.length).toBe(2);
		expect($scope.undoInfo.data.text).toBe(item.text);
		expect($scope.undoInfo.folderIndex).toBe(2);
		expect($scope.undoInfo.itemIndex).toBe(2);
	});

	it('should prevent saving when an item is empty', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		$scope.addItem(0)

		expect($scope.folders[0].items[4].text).toBe('');
		expect(function (){
			$scope.onSaveClicked();
		}).toThrow(new Error('folder "Vincent van Gogh" contains an invalid item'));
	});

	it('should be able to delete an empty item', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		$scope.addItem(0)
		expect($scope.folders[0].items[4].text).toBe('');
		$scope.removeItem(0, 4);
		expect($scope.folders[0].items.length).toBe(4);
	});

	it('should be able to remove an image from an item', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		expect(typeof $scope.folders[0].items[1].image).toBe("object")
		$scope.removeImage(0, 1);
		expect(typeof $scope.folders[0].items[1].image).toBe("undefined")
	});

	it('should prevent save if widget has no title', function () {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.title).toBe('Famous Artists');
		$scope.title = '';
		expect(function (){
			$scope.onSaveClicked();
		}).toThrow(new Error('widget needs a valid title'));
	});

	it('should prevent save if a folder has an invalid name', function () {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		$scope.folders[0].name = '';
		expect(function (){
			$scope.onSaveClicked();
		}).toThrow(new Error('all folders must have names'));
	});

	it('should prevent save if two folders have the same name', function () {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		$scope.folders[0].name = $scope.folders[1].name;
		expect(function (){
			$scope.onSaveClicked();
		}).toThrow(new Error('all folder names, items, and images must be unique'));
	});

	it('should prevent save if two items have the same name', function () {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		$scope.folders[0].items[0].text = $scope.folders[0].items[1].text;
		expect(function (){
			$scope.onSaveClicked();
		}).toThrow(new Error('all folder names, items, and images must be unique'));
	});

	it('should prevent save if two items have the same image', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		$scope.folders[0].items[1].image = $scope.folders[0].items[2].image;
		expect(function (){
			$scope.onSaveClicked();
		}).toThrow(new Error('all folder names, items, and images must be unique'));
	});

	it('should save the widget properly', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		//since we're spying on this, it should return an object with a title and a qset if it determines the widget is ready to save
		var successReport = $scope.onSaveClicked();
		//make sure the title was sent correctly
		expect(successReport.title).toBe($scope.title);
		//check one of the questions and its answers to make sure it was sent correctly
		var testQuestion = successReport.qset.items[0];
		expect(testQuestion.questions[0].text).toBe('1853 - 1890');
		expect(testQuestion.answers[0].text).toBe('Vincent van Gogh');
	});

	it('should be able to change the background image to a preset', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);

		$scope.setBackground("assets/test.png");
		expect($scope.backgroundImage).toEqual("assets/test.png");
	});

	it('should allow an item\'s image to be added/edited', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.folders[0].items.length).toBe(4);
		$scope.addItem(0);
		expect($scope.folders[0].items[4].text).toBe('');
		expect($scope.folders[0].items[4].image).toBe(undefined);
		$scope.editImage(0, 4);
		expect(Materia.CreatorCore.showMediaImporter).toHaveBeenCalled()
	});

	it('should properly determine if a folder can be deleted', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.folders.length).toBe(5);

		// if there's more than 1 folder, it should be able to be deleted
		expect($scope.canDeleteFolder()).toBe(true);
		expect($scope.folders.length).toBe(5);

		$scope.deleteFolder(0);
		expect($scope.folders.length).toBe(4);
		expect($scope.canDeleteFolder()).toBe(true);

		$scope.deleteFolder(0);
		expect($scope.folders.length).toBe(3);
		expect($scope.canDeleteFolder()).toBe(true);

		$scope.deleteFolder(0);
		expect($scope.folders.length).toBe(2);
		expect($scope.canDeleteFolder()).toBe(true);

		$scope.deleteFolder(0);
		expect($scope.folders.length).toBe(1);
		expect($scope.canDeleteFolder()).toBe(false);
	});

	it('should properly set the background to a custom image', function() {
		$scope.initExistingWidget('Famous Artists', widgetInfo, qset.data);
		expect($scope.backgroundImage).toBe("assets/canvas.jpg");

		$scope.getCustomBackground();
		expect($scope.backgroundImage).toBe("http://abc.jpg");
	});
});

describe('SortItOut', function() {
	console.log("\n\n\n\naaa\n\n\n\n");

	var widgetInfo = window.__demo__['build/demo'];
	var qset = widgetInfo.qset;
	var $scope = {};
	var ctrl={};
	var $compile = {};

	describe('Creator Controller', function() {

		module.sharedInjector();
		beforeAll(module('SortItOutCreator'));

		beforeAll(inject(function(_$compile_, $rootScope, $controller){
			$scope = $rootScope.$new();
			ctrl = $controller('SortItOutController', { $scope: $scope });
			$compile = _$compile_;
		}));

		beforeEach(function () {
			spyOn(Materia.CreatorCore, 'save').and.callFake(function(title, qset){
				//the creator core calls this on the creator when saving is successful
				$scope.onSaveComplete();
				return {title: title, qset: qset};
			});
			spyOn(Materia.CreatorCore, 'cancelSave').and.callFake(function(msg){
				throw new Error(msg);
			});
		});

		it('should make a new widget', function() {
			$scope.initNewWidget({name: 'sorty'});
			expect($scope.folders.length).toEqual(1);
			//this defaults if intro title is not set
			expect($scope.title).toEqual("My Sort-It-Out Widget");
		});


		it('should make an existing widget', function() {
			$scope.initExistingWidget('sorty', widgetInfo, qset.data);
			expect($scope.title).toEqual('sorty');
			expect($scope.folders.length).toEqual(5);
		});

		it('should have the folders in the correct order', function() {
			expect($scope.folders[0].name).toBe("Vincent van Gogh");
			expect($scope.folders[1].name).toBe("Pablo Picasso");
			expect($scope.folders[2].name).toBe("Claude Monet");
			expect($scope.folders[3].name).toBe("Leonardo da Vinci");
			expect($scope.folders[4].name).toBe("Salvador Dali");
		});

		it('should add a new item to a folder', function() {
			expect($scope.folders[0].items.length).toBe(4);
			$scope.addItem(0);
			var itemsLength = $scope.folders[0].items.length
			expect(itemsLength).toBe(5);
			expect($scope.folders[0].items[itemsLength - 1].text).toBe("");
		});

		it('should remove an item from a folder', function() {
			var itemsLength = $scope.folders[0].items.length;
			expect(itemsLength).toBe(5);
			$scope.removeItem(0, itemsLength - 1);
			expect($scope.folders[0].items.length).toBe(4);
		});

		it('should prevent more than 5 folders', function() {
			expect($scope.folders.length).toBe(5);
			expect($scope.canAddFolder()).toBe(false);
			$scope.createFolder();
			expect($scope.folders.length).toBe(5);
			expect($scope.canAddFolder()).toBe(false);
		});

		it('should prevent adding another item in an invalid folder', function() {
			expect($scope.folders[0].items.length).toBe(4);
			expect($scope.addItem(0)); // this should work
			expect($scope.folders[0].items.length).toBe(5);
			expect($scope.addItem(0)); // this should not work
			expect($scope.folders[0].items.length).toBe(5);

			$scope.folders[0].items[4].text = "test"
			expect($scope.addItem(0)); // this should work
			expect($scope.folders[0].items.length).toBe(6);
			expect($scope.addItem(0)); // this should not work
			expect($scope.folders[0].items.length).toBe(6);
		});

		it('should be able to undo the deletion of an item', function() {
			expect($scope.folders[0].items.length).toBe(6);
			var item = $scope.folders[0].items[4];
			$scope.removeItem(0, 4);
			expect($scope.folders[0].items.length).toBe(5);
			expect($scope.undoInfo.data.text).toBe(item.text);
			expect($scope.undoInfo.folderIndex).toBe(0);
			expect($scope.undoInfo.itemIndex).toBe(4);
		});

		it('should prevent saving when an item is empty', function() {
			expect($scope.folders[0].items[4].text).toBe('');
			expect(function (){
				$scope.onSaveClicked();
			}).toThrow(new Error('folder "Vincent van Gogh" contains an invalid item'));
		});

		it('should be able to delete an empty item', function() {
			expect($scope.folders[0].items.length).toBe(5);
			expect($scope.folders[0].items[4].text).toBe('');
			$scope.removeItem(0, 4);
			expect($scope.folders[0].items.length).toBe(4);
		});

		/* TODO need to test mdDialog
		it('should delete a folder', function() {
			expect($scope.folders.length).toBe(5);
			expect($scope.canDeleteFolder()).toBe(true)
			expect()
		})
		*/

		it('should prevent save if widget has no title', function () {
			var previousTitle = $scope.title;
			$scope.title = '';
			expect(function (){
				$scope.onSaveClicked();
			}).toThrow(new Error('widget needs a valid title'));
			$scope.title = previousTitle;
		});

		it('should prevent save if a folder has an invalid name', function () {
			var previousName = $scope.folders[0].name;
			$scope.folders[0].name = '';
			expect(function (){
				$scope.onSaveClicked();
			}).toThrow(new Error('all folders must have names'));
			$scope.folders[0].name = previousName;
		});

		it('should prevent save if two folders have the same name', function () {
			var previousName = $scope.folders[0].name;
			$scope.folders[0].name = $scope.folders[1].name;
			expect(function (){
				$scope.onSaveClicked();
			}).toThrow(new Error('all folder names, items, and images must be unique'));
			$scope.folders[0].name = previousName;
		});

		it('should prevent save if two items have the same name', function () {
			var previousName = $scope.folders[0].items[0].text;
			$scope.folders[0].items[0].text = $scope.folders[0].items[1].text;
			expect(function (){
				$scope.onSaveClicked();
			}).toThrow(new Error('all folder names, items, and images must be unique'));
			$scope.folders[0].items[0].text = previousName;
		});

		it('should prevent save if two items have the same image', function() {
			var previousImage = $scope.folders[0].items[1].image;
			$scope.folders[0].items[1].image = $scope.folders[0].items[2].image;
			expect(function (){
				$scope.onSaveClicked();
			}).toThrow(new Error('all folder names, items, and images must be unique'));
			$scope.folders[0].items[1].image = previousImage;
		});

		it('should save the widget properly', function() {
			//since we're spying on this, it should return an object with a title and a qset if it determines the widget is ready to save
			var successReport = $scope.onSaveClicked();
			//make sure the title was sent correctly
			expect(successReport.title).toBe($scope.title);
			//check one of the questions and its answers to make sure it was sent correctly
			var testQuestion = successReport.qset.items[0];
			expect(testQuestion.questions[0].text).toBe('1853 - 1890');
			expect(testQuestion.answers[0].text).toBe('Vincent van Gogh');
		});
	});
});

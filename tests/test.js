
// Hello Widget tests are provided as examples
// These should be replaced

describe('Sort It Out', function() {

	// // grab the demo widget for easy reference
	// var widgetInfo = window.__demo__['build/demo'];
	// var qset = widgetInfo.qset;

	// var $scope = {};
	// var ctrl = {};

	// describe('Player Controller', function() {
	// 	//grab the 'helloWidget' module for use in upcoming tests
	// 	module.sharedInjector();
	// 	beforeAll(module('helloWidget'));

	// 	//set up the controller/scope prior to these tests
	// 	beforeAll(inject(function($rootScope, $controller){
	// 		//instantiate $scope with all of the generic $scope methods/properties
	// 		$scope = $rootScope.$new();
	// 		//pass $scope through the 'helloWidgetPlayerCtrl' controller
	// 		ctrl = $controller('helloWidgetPlayerCtrl', { $scope: $scope });
	// 	}));

	// 	beforeEach(function(){
	// 		//spy on Materia.Engine.end()
	// 		spyOn(Materia.Engine, 'end');
	// 	});

	// 	it('should start properly', function(){
	// 		$scope.start(widgetInfo, qset.data);
	// 		expect($scope.title).toBe('Hello Widget!');
	// 		//make sure the first question has four answers
	// 		expect($scope.questions[1].answers.length).toEqual(4);
	// 	});

	// 	it('should choose a question to answer', function(){
	// 		//'currentQuestion' should be false by default
	// 		expect($scope.currentQuestion).toBe(false);

	// 		//make sure the question we specify was set as the current question
	// 		$scope.selectQuestion($scope.questions[1]);
	// 		expect($scope.currentQuestion).toEqual($scope.questions[1]);
	// 	});

	// 	it('should cancel answering a question', function(){
	// 		//make sure the question we selected earlier is still the current question
	// 		expect($scope.currentQuestion).toEqual($scope.questions[1]);

	// 		//make sure 'currentQuestion' is unset properly when desired
	// 		$scope.cancelQuestion();
	// 		expect($scope.currentQuestion).toBe(false);
	// 	});

	// 	it('should score the first question correctly', function(){
	// 		$scope.selectQuestion($scope.questions[1]);
	// 		//this one's worth 100%
	// 		$scope.selectAnswer($scope.currentQuestion.answers[3]);
	// 		$scope.submitAnswer();
	// 		expect($scope.currentQuestion.score).toBe(100);
	// 	});

	// 	it('should not allow a question to be answered twice', function(){
	// 		expect(function(){
	// 			$scope.submitAnswer();
	// 		}).toThrow(new Error('Question already answered!'));
	// 	});

	// 	it('should not allow a question to be selected while a question is already selected', function(){
	// 		expect(function(){
	// 			$scope.selectQuestion($scope.questions[2]);
	// 		}).toThrow(new Error('A question is already selected!'));
	// 	});

	// 	it('should not allow a question to be selected after it has been answered', function(){
	// 		$scope.cancelQuestion();
	// 		$scope.selectQuestion($scope.questions[1]);
	// 		expect($scope.currentQuestion).toBe(false);
	// 	});

	// 	it('should not allow an answer to be submitted for the wrong question', function(){
	// 		$scope.cancelQuestion();
	// 		//select the second question, try submitting one of the first question's answers
	// 		$scope.selectQuestion($scope.questions[2]);
	// 		$scope.selectAnswer($scope.questions[1].answers[1]);
	// 		expect(function(){
	// 			$scope.submitAnswer();
	// 		}).toThrow(new Error('Submitted answer not in this question!'));
	// 	});

	// 	it('should score the second question correctly', function(){
	// 		//this one's worth 50%
	// 		$scope.selectAnswer($scope.currentQuestion.answers[3]);
	// 		$scope.submitAnswer();
	// 		expect($scope.currentQuestion.score).toBe(50);
	// 	});

	// 	it('should do nothing if we try selecting an answer after submitting one', function(){
	// 		var compare = $scope.currentAnswer;
	// 		//this one's worth 100%
	// 		$scope.selectAnswer($scope.currentQuestion.answers[1]);
	// 		expect($scope.currentAnswer).toEqual(compare);
	// 	});

	// 	it('should score the third question correctly', function(){
	// 		$scope.cancelQuestion();
	// 		$scope.selectQuestion($scope.questions[3]);
	// 		//this one's worth 0%
	// 		$scope.selectAnswer($scope.currentQuestion.answers[0]);
	// 		$scope.submitAnswer();
	// 		expect($scope.currentQuestion.score).toBe(0);
	// 	});

	// 	it('should bring up the "done" screen when all questions are answered', function(){
	// 		$scope.cancelQuestion();
	// 		expect($scope.allAnswered).toBe(true);
	// 		//bonus check: final score should be 50% with all of the answers we used
	// 		expect($scope.finalScore).toBe(50);
	// 	});

	// 	it('should end the widget properly when the "end" button is clicked', function(){
	// 		$scope.end();
	// 		expect(Materia.Engine.end).toHaveBeenCalled();
	// 	});

	// 	it('should shuffle answer order when the randomize option is on', function(){
	// 		//this will make the output of Math.random() predictable, for the purpose of shuffling answers
	// 		spyOn(Math, 'random').and.returnValue(0);

	// 		//change the third question to only have one answer - makes sure the suffle function reacts properly to single-answer questions
	// 		qset.data.items[2].answers.splice(0,1);

	// 		//get a list of the answer ids for the supplied question - used to see which order the answers are in
	// 		function listOfIds(q) {
	// 			var list = [];
	// 			for(var i in q.answers) {
	// 				list.push(q.answers[i].id.toString());
	// 			}
	// 			return list;
	// 		}

	// 		//check the first question - in this case it has 4 items in it
	// 		var list1 = listOfIds(qset.data.items[0]);
	// 		qset.data.options.randomize = true;
	// 		$scope.start(widgetInfo, qset.data);
	// 		//make sure we're checking the same question - use the first question's id
	// 		var list2 = listOfIds($scope.questions[qset.data.items[0].id]);
	// 		expect(list1).not.toEqual(list2);
	// 	});
	// });

	// describe('Creator Controller', function(){
	// 	//grab the 'helloWidgetCreator' module for use in upcoming tests
	// 	module.sharedInjector();
	// 	beforeAll(module('helloWidget'));
	// 	//set up the controller/scope prior to these tests
	// 	beforeAll(inject(function($rootScope, $controller){
	// 		//instantiate $scope with all of the generic $scope methods/properties
	// 		$scope = $rootScope.$new();
	// 		//pass $scope through the 'helloWidgetCreatorCtrl' controller
	// 		ctrl = $controller('helloWidgetCreatorCtrl', { $scope: $scope });
	// 	}));

	// 	beforeEach(function(){
	// 		//lets us check which arguments are passed to this function when it's called
	// 		spyOn(Materia.CreatorCore, 'alert').and.callThrough();
	// 		spyOn(Materia.CreatorCore, 'save').and.callFake(function(title, qset){
	// 			//the creator core calls this on the creator when saving is successful
	// 			$scope.onSaveComplete();
	// 			return {title: title, qset: qset};
	// 		});
	// 		spyOn(Materia.CreatorCore, 'cancelSave').and.callFake(function(msg){
	// 			throw new Error(msg);
	// 		});
	// 	});

	// 	it('should edit a new widget', function(){
	// 		$scope.initNewWidget(widgetInfo);
	// 		//make sure the title is set to the default and the question set is empty
	// 		expect($scope.title).toBe('New Widget Title');
	// 		expect($scope.questions).toEqual([]);
	// 	});

	// 	it('should make a new blank question', function(){
	// 		$scope.addQuestion();
	// 		//new question should be added and made current
	// 		expect($scope.currentQuestion).not.toBe(false);
	// 		//new question should have some expected default values
	// 		expect($scope.currentQuestion.questions[0].text).toBe('');
	// 		expect($scope.currentQuestion.answers).toEqual([]);
	// 		expect($scope.currentQuestion.unsaved).toBe(true);
	// 		//new question should be added to the list of questions
	// 		expect($scope.questions[0]).toEqual($scope.currentQuestion);
	// 	});

	// 	it('should not make a new question if a question is selected already', function(){
	// 		expect(function(){
	// 			$scope.addQuestion();
	// 		}).toThrow(new Error('A question is already selected!'));
	// 	});

	// 	it('should add a blank answer', function(){
	// 		//still a new question, so we shouldn't have any answers yet
	// 		expect($scope.editingAnswers).toEqual([]);
	// 		$scope.addAnswer();
	// 		//new answer should have some expected default values
	// 		var newAnswer = $scope.editingAnswers[0];
	// 		expect(newAnswer.id).toBe('');
	// 		expect(newAnswer.text).toBe('');
	// 		expect(newAnswer.value).toBe(0);
	// 	});

	// 	it('should only allow four answers per question', function(){
	// 		//we still have one answer from before, add three more
	// 		$scope.addAnswer();
	// 		$scope.addAnswer();
	// 		$scope.addAnswer();

	// 		//trying to add a fifth answer should throw an error
	// 		expect(function(){
	// 			$scope.addAnswer();
	// 		}).toThrow(new Error('Only four answers are allowed per question!'));
	// 	});

	// 	it('should delete a new question after canceling', function(){
	// 		$scope.cancelEdit();
	// 		//question list should be empty
	// 		expect($scope.currentQuestion).toBe(false);
	// 		expect($scope.questions).toEqual([]);
	// 	});

	// 	it('should point out problems with a question before saving', function(){
	// 		$scope.addQuestion();
	// 		//first problem - no question text
	// 		$scope.saveEdit();
	// 		expect(Materia.CreatorCore.alert.calls.mostRecent().args).toEqual(['Blank Question', 'You can not have a blank question!']);
	// 		Materia.CreatorCore.alert.calls.reset();
	// 		$scope.editingQuestion = 'Question 1';
	// 		//second problem - no answers worth 100% value
	// 		//this will also trigger if there are no answers at all
	// 		$scope.saveEdit();
	// 		expect(Materia.CreatorCore.alert.calls.mostRecent().args).toEqual(['No Correct Answer', 'You must have at least one correct answer worth 100% credit!']);
	// 		Materia.CreatorCore.alert.calls.reset();
	// 		//third problem - blank answers
	// 		$scope.addAnswer();
	// 		$scope.saveEdit();
	// 		expect(Materia.CreatorCore.alert.calls.mostRecent().args).toEqual(['Blank Answer', 'You can not have a blank answer!']);
	// 		Materia.CreatorCore.alert.calls.reset();

	// 		//give the first question some text and a non-100% value
	// 		$scope.editingAnswers[0].text = 'A';
	// 		$scope.editingAnswers[0].value = 50;

	// 		//fourth problem - no answers worth 100% value
	// 		$scope.saveEdit();
	// 		expect(Materia.CreatorCore.alert.calls.mostRecent().args).toEqual(['No Correct Answer', 'You must have at least one correct answer worth 100% credit!']);
	// 		Materia.CreatorCore.alert.calls.reset();
	// 	});

	// 	it('should set value correctly according to whether the answer is checked or unchecked', function(){
	// 		//this is normally tied to a check box being clicked in the creator, but we can approximate it
	// 		$scope.editingAnswers[0].checked = true;
	// 		$scope.answerChecked($scope.editingAnswers[0]);
	// 		expect($scope.editingAnswers[0].value).toBe(100);

	// 		$scope.editingAnswers[0].checked = false;
	// 		$scope.answerChecked($scope.editingAnswers[0]);
	// 		expect($scope.editingAnswers[0].value).toBe(0);
	// 	});

	// 	it('should save a question properly', function(){
	// 		//only remaining problem from earlier - not having an answer worth 100% value
	// 		$scope.editingAnswers[0].value = 100;
	// 		$scope.saveEdit();

	// 		//make sure there isn't a question currently being edited, and the question just saved is correct
	// 		expect($scope.currentQuestion).toBe(false);
	// 		expect($scope.questions[0].questions[0].text).toBe('Question 1');
	// 	});

	// 	it('should cancel editing an existing question', function(){
	// 		$scope.selectQuestion($scope.questions[0]);
	// 		expect($scope.currentQuestion).toEqual($scope.questions[0]);

	// 		$scope.cancelEdit();
	// 		expect($scope.currentQuestion).toBe(false);
	// 		expect($scope.questions[0].questions[0].text).toBe('Question 1');
	// 	});

	// 	it('should sanitize answer values properly', function(){
	// 		//make a new question and answer to test with
	// 		$scope.addQuestion();
	// 		$scope.editingQuestion = 'Question 2';
	// 		$scope.addAnswer();
	// 		$scope.editingAnswers[0].text = 'A';

	// 		var value;
	// 		//first - make sure numeric values are constrained between 0 and 100
	// 		//numbers below 0
	// 		$scope.editingAnswers[0].value = -2;
	// 		//this is normally run every time an answer's value input changes, but we can approximate it
	// 		$scope.cleanAnswerValue($scope.editingAnswers[0]);
	// 		value = $scope.editingAnswers[0].value;
	// 		expect(value >= 0 && value <= 100).toBeTruthy();

	// 		//numbers above 100
	// 		$scope.editingAnswers[0].value = 100 + Math.random()*1000;
	// 		$scope.cleanAnswerValue($scope.editingAnswers[0]);
	// 		value = $scope.editingAnswers[0].value;
	// 		expect(value >= 0 && value <= 100).toBeTruthy();

	// 		//second - make sure non-numeric values are converted to 0
	// 		$scope.editingAnswers[0].value = 'string';
	// 		$scope.cleanAnswerValue($scope.editingAnswers[0]);
	// 		expect($scope.editingAnswers[0].value).toBe(0);

	// 		//third - make sure it doesn't change valid numbers
	// 		$scope.editingAnswers[0].value = 75;
	// 		$scope.cleanAnswerValue($scope.editingAnswers[0]);
	// 		expect($scope.editingAnswers[0].value).toBe(75);

	// 		$scope.cancelEdit();
	// 	});

	// 	it('should remove answers properly', function(){
	// 		//make a new question and a few answers to test with
	// 		$scope.addQuestion();
	// 		$scope.editingQuestion = 'Question 2';
	// 		$scope.addAnswer();
	// 		$scope.editingAnswers[0].text = 'A';
	// 		$scope.editingAnswers[0].value = 100;
	// 		$scope.addAnswer();
	// 		$scope.editingAnswers[1].text = 'B';
	// 		$scope.editingAnswers[1].value = 100;
	// 		$scope.addAnswer();
	// 		$scope.editingAnswers[2].text = 'C';
	// 		$scope.editingAnswers[2].value = 50;
	// 		$scope.addAnswer();
	// 		$scope.editingAnswers[3].text = 'D';
	// 		$scope.editingAnswers[3].value = 0;

	// 		//the second answer should be 'B', with a value of 100
	// 		expect($scope.editingAnswers[1].text).toBe('B');
	// 		expect($scope.editingAnswers[1].value).toBe(100);
	// 		//this is normally run when the 'X' next to a button is clicked, but we can approximate it
	// 		$scope.removeAnswer(1);
	// 		//the second answer should be 'C', with a value of 50
	// 		expect($scope.editingAnswers[1].text).toBe('C');
	// 		expect($scope.editingAnswers[1].value).toBe(50);

	// 		$scope.saveEdit();
	// 	});

	// 	it('should only allow three questions', function(){
	// 		//we already have two questions, add a third one successfully
	// 		$scope.addQuestion();
	// 		$scope.editingQuestion = 'Question 3';
	// 		$scope.addAnswer();
	// 		$scope.editingAnswers[0].text = 'A';
	// 		$scope.editingAnswers[0].value = 100;
	// 		$scope.saveEdit();

	// 		//there shouldn't be a selected question, and we should have three in the list
	// 		expect($scope.currentQuestion).toBe(false);
	// 		expect($scope.questions.length).toBe(3);

	// 		//trying to add a fourth question should cause an alert
	// 		$scope.addQuestion();
	// 		expect(Materia.CreatorCore.alert.calls.mostRecent().args).toEqual(['3 Question Limit', 'For this widget, you may create up to 3 questions.']);
	// 		Materia.CreatorCore.alert.calls.reset();
	// 	});

	// 	it('should select a question for editing', function(){
	// 		$scope.selectQuestion($scope.questions[1]);
	// 		expect($scope.currentQuestion).toEqual($scope.questions[1]);
	// 	});

	// 	it('should not allow a question to be selected while a question is already selected', function(){
	// 		expect($scope.currentQuestion).toEqual($scope.questions[1]);
	// 		$scope.selectQuestion($scope.questions[2]);
	// 		expect($scope.currentQuestion).toEqual($scope.questions[1]);
	// 	});

	// 	it('should delete selected questions properly', function(){
	// 		//the second question should still be selected
	// 		expect($scope.currentQuestion).toEqual($scope.questions[1]);
	// 		//the second question should be 'Question 2'
	// 		expect($scope.questions[1].questions[0].text).toBe('Question 2');

	// 		$scope.deleteQuestion();
	// 		//there should no longer be a seleted question
	// 		expect($scope.currentQuestion).toBe(false);
	// 		//the second question should now be 'Question 3'
	// 		expect($scope.questions[1].questions[0].text).toBe('Question 3');
	// 	});

	// 	//at this point, the questions and their answers should all be valid
	// 	it('should save the widget properly', function(){
	// 		//since we're spying on this, it should return an object with a title and a qset if it determines the widget is ready to save
	// 		var successReport = $scope.onSaveClicked();
	// 		//make sure the title was sent correctly
	// 		expect(successReport.title).toBe($scope.title);
	// 		//check one of the questions and its answers to make sure it was sent correctly
	// 		var testQuestion = successReport.qset.items[0];
	// 		expect(testQuestion.questions[0].text).toBe('Question 1');
	// 		//make sure the creator-specific 'checked' property was stripped out
	// 		expect(testQuestion.answers[0].checked).not.toBeDefined();
	// 		expect(testQuestion.answers[0].text).toBe('A');
	// 		expect(testQuestion.answers[0].value).toBe(100);
	// 	});

	// 	it('should cancel saving if something is invalid', function(){
	// 		//unset the widget title
	// 		$scope.title = '';

	// 		//the error message should be what we expect it to be
	// 		expect(function(){
	// 			$scope.onSaveClicked();
	// 		}).toThrow(new Error('Widget not ready to save.'));

	// 		//test with a valid title, but no questions
	// 		$scope.title = 'Title';
	// 		$scope.questions = [];
	// 		expect(function(){
	// 			$scope.onSaveClicked();
	// 		}).toThrow(new Error('Widget not ready to save.'));
	// 	});

	// 	it('should edit an existing widget', function(){
	// 		$scope.initExistingWidget(widgetInfo.name, widgetInfo, qset.data);

	// 		//make sure the title and first question match what we passed in
	// 		expect($scope.title).toBe(widgetInfo.name);
	// 		expect($scope.questions.length).toBe(3);
	// 		expect($scope.questions[0].questions[0].text).toBe('Luke, I am your ____________.');
	// 		expect($scope.questions[0].answers[2].text).toBe('father');
	// 		expect($scope.questions[0].answers[2].value).toBe(100);
	// 	});

	// 	it('should import questions properly', function(){
	// 		$scope.initNewWidget(widgetInfo);
	// 		expect($scope.questions).toEqual([]);

	// 		//for simplicity, just copy the demo qset's questions
	// 		var importing = qset.data.items;
	// 		//add another to make sure the importer will only import three questions
	// 		var newQuestion = {
	// 			materiaType: 'question',
	// 			questions: [{text: 'Extra'}],
	// 			answers: [{
	// 				id:    '',
	// 				text:  'extra',
	// 				value: 100
	// 			}],
	// 			id: 4,
	// 			type: 'MC'
	// 		};
	// 		importing.push(newQuestion);
	// 		//this should create three questions and cause an alert, since we tried importing four
	// 		$scope.onQuestionImportComplete(importing);
	// 		//make sure the alert went out
	// 		expect(Materia.CreatorCore.alert.calls.mostRecent().args).toEqual(['3 Question Limit', 'For this widget, you may create up to 3 questions.']);
	// 		Materia.CreatorCore.alert.calls.reset();
	// 		//make sure the first three questions were imported
	// 		expect($scope.questions.length).toBe(3);
	// 	});
	// });
});
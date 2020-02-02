// require all the parts
const { DirectiveScroll } = require('./directives/dir-scroll')
const { DirectiveKeyboardShortcuts } = require('./directives/dir-keyboard-shortcuts')
const { ControllerSortItOutPlayer } = require('./controllers/controller-sort-it-out-engine')

// create the Angular player module and establish dependencies
const SortItOut = angular.module('SortItOutEngine', ['hmTouchEvents', 'ngAria'])

// Register the controller with Angular
SortItOut.directive('scroll', DirectiveScroll)
SortItOut.directive('keyboardShortcuts', ['$document', '$rootScope', DirectiveKeyboardShortcuts])
SortItOut.controller('SortItOutEngineCtrl', [
	'$scope',
	'$rootScope',
	'$timeout',
	ControllerSortItOutPlayer
])

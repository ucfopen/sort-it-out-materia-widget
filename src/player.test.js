// virtual mocks to prevent actually loading
jest.mock('./directives/dir-scroll')
jest.mock('./directives/dir-keyboard-shortcuts')
jest.mock('./controllers/controller-sort-it-out-engine')

let mockModule

describe('Player Controller', () => {
	beforeEach(() => {
		jest.resetModules()
		global.angular = {
			module: jest.fn()
		}
		mockModule = {
			directive: jest.fn(),
			controller: jest.fn()
		}
		global.angular.module.mockReturnValue(mockModule)
	})

	test('Creates Angular module', () => {
		require('./player')
		expect(global.angular.module).toHaveBeenCalledTimes(1)
		expect(global.angular.module).toHaveBeenCalledWith('SortItOutEngine', [
			'hmTouchEvents',
			'ngAria'
		])
	})

	test('DirectiveKeyboardShortcuts is registered with Angular', () => {
		const { DirectiveKeyboardShortcuts } = require('./directives/dir-keyboard-shortcuts')
		require('./player')
		expect(mockModule.directive).toHaveBeenCalledWith('keyboardShortcuts', [
			'$document',
			'$rootScope',
			DirectiveKeyboardShortcuts
		])
	})

	test('DirectiveScroll is registered with Angular', () => {
		const { DirectiveScroll } = require('./directives/dir-scroll')
		require('./player')
		expect(mockModule.directive).toHaveBeenCalledWith('scroll', DirectiveScroll)
	})

	test('ControllerSortItOutPlayer is registered with Angular', () => {
		const { ControllerSortItOutPlayer } = require('./controllers/controller-sort-it-out-engine')
		require('./player')
		expect(mockModule.controller).toHaveBeenCalledWith('SortItOutEngineCtrl', [
			'$scope',
			'$rootScope',
			'$timeout',
			ControllerSortItOutPlayer
		])
	})
})

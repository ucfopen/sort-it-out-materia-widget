let mockModule

describe('Directive keyboardShortcuts',  () => {

	beforeEach(()=>{
		jest.resetModules()
		global.angular = {
			module: jest.fn()
		}

		mockModule = {
			directive: jest.fn()
		}

		global.angular.module.mockReturnValue(mockModule)
	})

	test('Creates angular module', () => {
		require('./dir-keyboard-shortcuts')
		expect(global.angular.module).toHaveBeenCalledTimes(1)
		expect(global.angular.module).toHaveBeenCalledWith("SortItOutEngine")
	})

	test('Sets up directive', () => {
		const { keyboardShortcuts } = require('./dir-keyboard-shortcuts')
		expect(mockModule.directive).toHaveBeenCalledTimes(1)
		expect(mockModule.directive).toHaveBeenCalledWith("keyboardShortcuts", ["$document", "$rootScope", keyboardShortcuts])
	})

	test('keyboardShortcuts has expected settings', () => {
		const { keyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const result = keyboardShortcuts()
		expect(result).toHaveProperty('restrict', 'A')
		expect(result).toHaveProperty('link', expect.any(Function))
	})

	test('keyboardShortcuts.link binds to keypress', () => {
		const { keyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const $document = {
			bind: jest.fn()
		}
		const $rootScope = {
			['$broadcast']: jest.fn()
		}
		const result = keyboardShortcuts($document, $rootScope)
		result.link()
		expect($document.bind).toHaveBeenCalledTimes(1)
		expect($document.bind).toHaveBeenCalledWith('keypress', expect.any(Function))
	})

	test('keyboardShortcuts.link binding calls broadcast on tab key', () => {
		const { keyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const $document = {
			bind: jest.fn()
		}
		const $rootScope = {
			['$broadcast']: jest.fn()
		}
		const result = keyboardShortcuts($document, $rootScope)
		result.link()

		const keypressCallback = $document.bind.mock.calls[0][1]
		const event = {which: 9}
		keypressCallback(event)
		expect($rootScope.$broadcast).toHaveBeenCalledTimes(1)
		expect($rootScope.$broadcast).toHaveBeenCalledWith('tabMonitor', event, 9)
	})

	test('keyboardShortcuts.link binding skips broadcast on non tab key', () => {
		const { keyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const $document = {
			bind: jest.fn()
		}
		const $rootScope = {
			['$broadcast']: jest.fn()
		}
		const result = keyboardShortcuts($document, $rootScope)
		result.link()

		const keypressCallback = $document.bind.mock.calls[0][1]
		const event = {which: 55}
		keypressCallback(event)
		expect($rootScope.$broadcast).toHaveBeenCalledTimes(0)
	})

})

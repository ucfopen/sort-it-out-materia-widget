describe('DirectiveKeyboardShortcuts', () => {
	beforeEach(() => {
		jest.resetModules()
	})

	test('has expected settings', () => {
		const { DirectiveKeyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const result = DirectiveKeyboardShortcuts()
		expect(result).toHaveProperty('restrict', 'A')
		expect(result).toHaveProperty('link', expect.any(Function))
	})

	test('link binds to keypress', () => {
		const { DirectiveKeyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const $document = {
			bind: jest.fn()
		}
		const $rootScope = {
			['$broadcast']: jest.fn()
		}
		const result = DirectiveKeyboardShortcuts($document, $rootScope)
		result.link()
		expect($document.bind).toHaveBeenCalledTimes(1)
		expect($document.bind).toHaveBeenCalledWith('keypress', expect.any(Function))
	})

	test('link binding calls broadcast on tab key', () => {
		const { DirectiveKeyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const $document = {
			bind: jest.fn()
		}
		const $rootScope = {
			['$broadcast']: jest.fn()
		}
		const result = DirectiveKeyboardShortcuts($document, $rootScope)
		result.link()

		const keypressCallback = $document.bind.mock.calls[0][1]
		const event = { which: 9 }
		keypressCallback(event)
		expect($rootScope.$broadcast).toHaveBeenCalledTimes(1)
		expect($rootScope.$broadcast).toHaveBeenCalledWith('tabMonitor', event, 9)
	})

	test('link binding skips broadcast on non tab key', () => {
		const { DirectiveKeyboardShortcuts } = require('./dir-keyboard-shortcuts')
		const $document = {
			bind: jest.fn()
		}
		const $rootScope = {
			['$broadcast']: jest.fn()
		}
		const result = DirectiveKeyboardShortcuts($document, $rootScope)
		result.link()

		const keypressCallback = $document.bind.mock.calls[0][1]
		const event = { which: 55 }
		keypressCallback(event)
		expect($rootScope.$broadcast).toHaveBeenCalledTimes(0)
	})
})

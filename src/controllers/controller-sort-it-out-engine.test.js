let mockModule

describe('Controller SortItOutEngine',  () => {

	beforeEach(()=>{
		jest.resetModules()
		jest.resetAllMocks()

		global.angular = {
			module: jest.fn()
		}

		mockModule = {
			controller: jest.fn()
		}

		global.angular.module.mockReturnValue(mockModule)
	})

	test('Creates angular module', () => {
		require('./controller-sort-it-out-engine')
		expect(global.angular.module).toHaveBeenCalledTimes(1)
		expect(global.angular.module).toHaveBeenCalledWith("SortItOutEngine")
	})

	test('Sets up controller', () => {
		const { sortItOutEngineCtrl } = require('./controller-sort-it-out-engine')
		expect(mockModule.controller).toHaveBeenCalledTimes(1)
		expect(mockModule.controller).toHaveBeenCalledWith("SortItOutEngineCtrl", ["$scope", "$rootScope", "$timeout", sortItOutEngineCtrl])
	})

	test('peekFolder searches for the correct elements', () => {
		const querySelectorAll = jest.spyOn(document, 'querySelectorAll')
		const { peekFolder } = require('./controller-sort-it-out-engine')
		const mockFolderDomEl = {classList: {add: jest.fn()}}

		querySelectorAll.mockReturnValueOnce([mockFolderDomEl])
		peekFolder(10)
		expect(querySelectorAll).toHaveBeenCalledWith('.folder[data-index="10"]')
	})

	test('peekFolder adds peeked classes to all folders', () => {
		const querySelectorAll = jest.spyOn(document, 'querySelectorAll')
		const { peekFolder } = require('./controller-sort-it-out-engine')
		const mockFolderDomEl = {classList: {add: jest.fn()}}

		querySelectorAll.mockReturnValueOnce([mockFolderDomEl])
		peekFolder(10)
		expect(mockFolderDomEl.classList.add).toHaveBeenCalledWith('peeked')
	})

	test('preventDefault calls preventDefault', () => {
		const { preventDefault } = require('./controller-sort-it-out-engine')
		const mockEvent = { preventDefault: jest.fn() }

		expect(mockEvent.preventDefault).toHaveBeenCalledTimes(0)
		preventDefault(mockEvent, false)
		expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
	})

	test('preventDefault calls stopPropagation', () => {
		const { preventDefault } = require('./controller-sort-it-out-engine')
		const mockEvent = { stopPropagation: jest.fn() }

		expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(0)
		preventDefault(mockEvent, true)
		expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
	})

	test('handleAssistiveRepeat focuses ', () => {
		const getElementsByClassName = jest.spyOn(document, 'getElementsByClassName')
		const domEls = [{focus: jest.fn()}]
		getElementsByClassName.mockReturnValueOnce(domEls)
		const { handleAssistiveRepeat } = require('./controller-sort-it-out-engine')
		const mockEvent = { which: 32 }

		expect(domEls[0].focus).toHaveBeenCalledTimes(0)
		handleAssistiveRepeat(mockEvent)
		expect(domEls[0].focus).toHaveBeenCalledTimes(1)
	})

	test('handleAssistiveRepeat does nothing when not the space key', () => {
		const getElementsByClassName = jest.spyOn(document, 'getElementsByClassName')
		const domEls = [{focus: jest.fn()}]
		getElementsByClassName.mockReturnValueOnce(domEls)
		const { handleAssistiveRepeat } = require('./controller-sort-it-out-engine')
		const mockEvent = { which: 10 }

		handleAssistiveRepeat(mockEvent)
		expect(domEls[0].focus).toHaveBeenCalledTimes(0)
	})

	test('setItemPos sets style', () => {
		const { setItemPos } = require('./controller-sort-it-out-engine')
		const mockEl = {style: {}}
		setItemPos(mockEl, 20, 30)
		expect(mockEl.style).toEqual({top: '20px', left: '30px'})
	})

	test('generateBounds sets style', () => {
		const getElementById = jest.spyOn(document, 'getElementById')
		const getComputedStyle = jest.spyOn(window, 'getComputedStyle')
		const { generateBounds } = require('./controller-sort-it-out-engine')
		const el = document.createElement("BUTTON")

		getElementById
			.mockReturnValueOnce(el)
			.mockReturnValueOnce({offsetHeight: 10})

		getComputedStyle.mockReturnValueOnce({width: '10px', height: '20px'})
		const result = generateBounds()

		expect(result).toHaveProperty('placementBounds')
		expect(result).toHaveProperty('dragBounds')

		expect(result.placementBounds).toEqual({
			x: {max: -140, min: 15}, y: {max: 5, min: 15}
		})
		expect(result.dragBounds).toEqual({
			x: {max: -5, min: 15}, y: {max: 15, min: 15}
		})
	})

	test('shuffleArray returns an array', () => {
		const rand = jest.spyOn(Math, 'random')
		rand
			.mockReturnValueOnce(.1)
			.mockReturnValueOnce(.3)
			.mockReturnValueOnce(.8)

		const { shuffleArray } = require('./controller-sort-it-out-engine')
		const array = [1, 2, 3]
		const result = shuffleArray(array)
		expect(result).toBe(array) // returns original array
		expect(result).toHaveLength(3) // still has correct length
		expect(result).toEqual([2,3,1])
	})

	test('makeFoldersFromQset returns an unsanitzed array', () => {
		const { makeFoldersFromQset } = require('./controller-sort-it-out-engine')
		const qset = {
			items: [
				{answers: [{text: '&lt;mocktext&gt;'}]},
				{answers: [{text: '&#34;mock&amp;text&#34;'}]}
			]
		}
		const result = makeFoldersFromQset(qset)
		expect(result).toEqual([
			{items: [], text: '<mocktext>'},
			{items: [], text: '"mock&text"'}
		])
	})

	test('generateRandomPosition returns an array', () => {
		const rand = jest.spyOn(Math, 'random')
		const { generateRandomPosition } = require('./controller-sort-it-out-engine')
		const mockBounds = {
			y: {
				min: 1, max: 10
			},
			x: {
				min: 5, max: 20
			}
		}

		rand
			.mockReturnValueOnce(.3)
			.mockReturnValueOnce(.1)

		const result = generateRandomPosition(mockBounds, false)
		expect(result).toEqual({left: '6px', top: '-33px'})
	})

	test('makeItemsFromQset does some complex stuff', () => {
		global.Materia = {
			Engine: {
				getMediaUrl: jest.fn().mockReturnValue('mockImg')
			}
		}
		const rand = jest.spyOn(Math, 'random')
		const { makeItemsFromQset } = require('./controller-sort-it-out-engine')
		const mockBounds = {
			y: {
				min: 1, max: 10
			},
			x: {
				min: 5, max: 20
			}
		}

		rand
			.mockReturnValueOnce(.8)
			.mockReturnValueOnce(.9)

		const qset = {
			items: [
				{
					id: 'mockid',
					options: { image: 'imgId'},
					questions: [{text: '&lt;&lt;mocktext&gt;&gt;'}]
				},
			]
		}

		const result = makeItemsFromQset(qset, mockBounds)
		expect(result).toEqual([{
			folder: -1,
			id: 'mockid',
			image: "mockImg",
			position: {left: "18px", top: "-211px"},
			text: "<<mocktext>>"
		}])
	})

	test('hideTutorial returns an array', () => {
		const { hideTutorial } = require('./controller-sort-it-out-engine')
		const getElementById = jest.spyOn(document, 'getElementById')
		const add = jest.fn()
		const remove = jest.fn()
		const $timeout = jest.fn()
		getElementById
			.mockReturnValueOnce({classList: {add, remove}})
			.mockReturnValueOnce({classList: {add, remove}})

		hideTutorial($timeout)
		expect(add).toHaveBeenCalledTimes(2)
		expect(add).toHaveBeenCalledWith('hide')
		expect(remove).toHaveBeenCalledTimes(2)
		expect(remove).toHaveBeenCalledWith('show')
		expect($timeout).toHaveBeenCalledTimes(1)

		// execute the $timeout callback
		const $timeoutCb = $timeout.mock.calls[0][0]
		$timeoutCb()
		expect(add).toHaveBeenCalledTimes(4)
		expect(add).toHaveBeenCalledWith('hidden')
		expect(remove).toHaveBeenCalledTimes(2)
	})

	test('assistiveAlert sets innerhtml', () => {
		const { assistiveAlert } = require('./controller-sort-it-out-engine')
		const getElementById = jest.spyOn(document, 'getElementById')
		const mockAlertEl = {innerHTML: ''}
		getElementById
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(mockAlertEl)

		assistiveAlert('input text')
		expect(mockAlertEl.innerHTML).toBe('input text')
	})

	test('removeClassShrink removes shrink on each el', () => {
		const { removeClassShrink } = require('./controller-sort-it-out-engine')
		const getElementsByClassName = jest.spyOn(document, 'getElementsByClassName')
		const remove = jest.fn()
		const peekedEls = [{classList: {remove}}]
		getElementsByClassName.mockReturnValueOnce(peekedEls)

		removeClassShrink()
		expect(remove).toHaveBeenCalledTimes(1)
		expect(remove).toHaveBeenCalledWith('shrink')
	})

	test('removeClassPeek removes peeked on each el', () => {
		const { removeClassPeek } = require('./controller-sort-it-out-engine')
		const getElementsByClassName = jest.spyOn(document, 'getElementsByClassName')
		const remove = jest.fn()
		const peekedEls = [{classList: {remove}}]
		getElementsByClassName.mockReturnValueOnce(peekedEls)

		removeClassPeek()
		expect(remove).toHaveBeenCalledTimes(1)
		expect(remove).toHaveBeenCalledWith('peeked')
	})

	test('isOutOfBounds sets innerhtml', () => {
		const { isOutOfBounds } = require('./controller-sort-it-out-engine')
		const dragBounds = {
			x: {max: 10, min: 5}, y: {max: -10, min: -20}
		}

		expect(isOutOfBounds(6, -15, dragBounds)).toBe(false)
		expect(isOutOfBounds(20, -15, dragBounds)).toBe(true)
		expect(isOutOfBounds(6, 20, dragBounds)).toBe(true)
		expect(isOutOfBounds(20, 20, dragBounds)).toBe(true)
	})

	test('sanitize works', () => {
		const { sanitize } = require('./controller-sort-it-out-engine')

		expect(sanitize()).toBe(undefined)
		expect(sanitize('test')).toBe('test')
		expect(sanitize('<test>')).toBe('&lt;test&gt;')
		expect(sanitize('<<<<test>>>>')).toBe('&lt;&lt;&lt;&lt;test&gt;&gt;&gt;&gt;')
		expect(sanitize('t"e"st')).toBe('t&#34;e&#34;st')
		expect(sanitize('test&&test')).toBe('test&amp;&amp;test')
	})

	test('desanitize works', () => {
		const { desanitize } = require('./controller-sort-it-out-engine')

		expect(desanitize()).toBe(undefined)
		expect(desanitize('test')).toBe('test')
		expect(desanitize('&lt;test&gt;')).toBe('<test>')
		expect(desanitize('&lt;&lt;&lt;&lt;test&gt;&gt;&gt;&gt;')).toBe('<<<<test>>>>')
		expect(desanitize('t&#34;e&#34;st')).toBe('t"e"st')
		expect(desanitize('test&amp;&amp;test')).toBe('test&&test')
	})


})

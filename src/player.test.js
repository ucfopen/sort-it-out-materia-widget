// virtual mocks to prevent actually loading
let mockCallCount
jest.mock('./directives/dir-scroll', () => {mockCallCount++}, {virtual: true})
jest.mock('./directives/dir-keyboard-shortcuts', () => {mockCallCount++}, {virtual: true})
jest.mock('./controllers/controller-sort-it-out-engine', () => {mockCallCount++}, {virtual: true})

describe('Player Controller',  () => {
	beforeEach(()=>{
		jest.resetModules()
		global.angular = {
			module: jest.fn()
		}
	})

	test('Creates angular module', () => {
		require('./player')
		expect(global.angular.module).toHaveBeenCalledTimes(1)
		expect(global.angular.module).toHaveBeenCalledWith("SortItOutEngine", ["hmTouchEvents", "ngAria"])
	})

	test('Requires expected scripts', () => {
		mockCallCount = 0
		require('./player')
		expect(mockCallCount).toBe(3)
	})

})

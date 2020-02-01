let mockModule

describe('Directive Scroll',  () => {

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
		require('./dir-scroll')
		expect(global.angular.module).toHaveBeenCalledTimes(1)
		expect(global.angular.module).toHaveBeenCalledWith("SortItOutEngine")
	})

	test('Sets up directive', () => {
		const { scroll } = require('./dir-scroll')
		expect(mockModule.directive).toHaveBeenCalledTimes(1)
		expect(mockModule.directive).toHaveBeenCalledWith("scroll", scroll)
	})

	test('scroll has expected settings', () => {
		const { scroll } = require('./dir-scroll')
		const result = scroll()
		expect(result).not.toHaveProperty('restrict')
		expect(result).toHaveProperty('link', expect.any(Function))
	})

	test('scroll.link binds to elements wheel and touchmove', () => {
		const { scroll } = require('./dir-scroll')
		const scope = {
			['$apply']: jest.fn()
		}
		const element = {
			bind: jest.fn()
		}
		const result = scroll()
		result.link(scope, element)
		expect(element.bind).toHaveBeenCalledTimes(2)
		expect(element.bind).toHaveBeenCalledWith('wheel', expect.any(Function))
		expect(element.bind).toHaveBeenCalledWith('touchmove', expect.any(Function))
	})

	test('wheel binding calls $scope.$apply', () => {
		const { scroll } = require('./dir-scroll')
		const scope = {
			['$apply']: jest.fn()
		}
		const element = {
			bind: jest.fn()
		}
		const result = scroll()
		result.link(scope, element)
		const wheelBindCall = element.bind.mock.calls[0]

		// verify the callback is the one we expect
		expect(wheelBindCall[0]).toBe('wheel')

		// establish apply hasn't been called
		expect(scope.$apply).toHaveBeenCalledTimes(0)

		// call the callback
		wheelBindCall[1]()

		expect(scope.$apply).toHaveBeenCalledTimes(1)
	})

	test('touchmove binding calls $scope.$apply', () => {
		const { scroll } = require('./dir-scroll')
		const scope = {
			['$apply']: jest.fn()
		}
		const element = {
			bind: jest.fn()
		}
		const result = scroll()
		result.link(scope, element)
		const touchmoveBindCall = element.bind.mock.calls[1]

		// verify the callback is the one we expect
		expect(touchmoveBindCall[0]).toBe('touchmove')

		// establish apply hasn't been called
		expect(scope.$apply).toHaveBeenCalledTimes(0)

		// call the callback
		touchmoveBindCall[1]()

		expect(scope.$apply).toHaveBeenCalledTimes(1)
	})

})

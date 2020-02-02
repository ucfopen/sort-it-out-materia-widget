// make sure that scrolling and touchmove update the dom
export const DirectiveScroll = () => ({
	link: (scope, element) => {
		const cb = () => scope.$apply()
		element.bind('wheel', cb)
		element.bind('touchmove', cb)
	}
})

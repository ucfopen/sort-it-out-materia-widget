
// make sure that scrolling and touchmove update the dom
const scroll = () => ({
	link: (scope, element) => {
		const cb = () => scope.$apply()
		element.bind("wheel", cb)
		element.bind("touchmove", cb)
	}
})

// Register the directive with Angular
const SortItOut = angular.module("SortItOutEngine")
SortItOut.directive("scroll", scroll)

module.exports = {
	scroll
}

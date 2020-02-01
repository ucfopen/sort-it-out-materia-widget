
// make sure that scrolling and touchmove update the dom
const scroll = () => ({
	link: (scope, element) => {
		element.bind("wheel", () => scope.$apply())
		element.bind("touchmove", () => scope.$apply())
	}
})

// Register the directive with Angular
const SortItOut = angular.module("SortItOutEngine")
SortItOut.directive("scroll", scroll)

module.exports = {
	scroll
}

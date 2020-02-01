// catches keyboard shortcuts agnostic of other key event listeners
// for the assistive keyboard input listeners, check handleAssistiveSelection below
const keyboardShortcuts = ($document, $rootScope) => ({
	restrict: "A",
	link: () => {
		$document.bind("keypress", (event) => {
			// only used to listen for tab key currently
			if (event.which == 9){
				$rootScope.$broadcast("tabMonitor", event, event.which)
			}
		})
	}
})

// Register the directive with Angular
const SortItOut = angular.module("SortItOutEngine")
SortItOut.directive("keyboardShortcuts", ["$document", "$rootScope", keyboardShortcuts])

module.exports = {
	keyboardShortcuts
}

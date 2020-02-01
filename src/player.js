// create the Angular player module and establish dependencies
const SortItOut = angular.module("SortItOutEngine", ["hmTouchEvents", "ngAria"])

// require all the parts
require('./directives/dir-scroll')
require('./directives/dir-keyboard-shortcuts')
require('./controllers/controller-sort-it-out-engine')

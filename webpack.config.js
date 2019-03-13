const path = require('path')
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const rules = widgetWebpack.getDefaultRules()

const entries = {
	'creator.js': [
		'core-js/es6/array',
		'core-js/fn/array/includes',
		'core-js/fn/array/map',
		'core-js/es6/symbol',
		'core-js/es6/promise',
		'core-js/fn/set',
		'core-js/fn/object/assign',
		'core-js/fn/string/includes',
		'core-js/web/dom-collections',
		'./src/creator.js'
	],
	'player.js': [
		'core-js/es6/array',
		'core-js/fn/array/includes',
		'core-js/fn/array/map',
		'core-js/es6/symbol',
		'core-js/es6/promise',
		'core-js/fn/set',
		'core-js/fn/object/assign',
		'core-js/fn/string/includes',
		'core-js/web/dom-collections',
		'./src/player.js'
	],
	'scoreScreen.js': [
		'core-js/es6/array',
		'core-js/fn/array/includes',
		'core-js/fn/array/map',
		'core-js/es6/symbol',
		'core-js/es6/promise',
		'core-js/fn/set',
		'core-js/fn/object/assign',
		'core-js/fn/string/includes',
		'core-js/web/dom-collections',
		'./src/scoreScreen.js'
	],
	'creator.css': ['./src/creator.scss', './src/creator.html'],
	'player.css': ['./src/player.scss', './src/player.html'],
	'scoreScreen.css': ['./src/scoreScreen.scss', './src/scoreScreen.html'],
	'angular-hammer.js': ['./src/angular-hammer.js'],
	'hammer.min.js': ['./src/hammer.min.js']
}

const JSWithPolyfill = {
	test: /\.js$/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: [
				'es2015',
				['env', {
					targets: { browsers: ["last 2 versions", "ie >= 11"]},
					debug: true
				}]
			]
		}
	}
}

const customRules = [
	JSWithPolyfill,
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.copyImages
]

const options = {
	moduleRules: customRules,
	entries: entries
}

const config = widgetWebpack.getLegacyWidgetBuildConfig(options)

module.exports = config

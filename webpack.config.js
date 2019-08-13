const path = require('path')
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const outputPath = path.join(__dirname, 'build')
const rules = widgetWebpack.getDefaultRules()
const copy = widgetWebpack.getDefaultCopyList()

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
	'guides/player.temp.html': [ './src/_guides/player.md'],
	'guides/creator.temp.html': [ './src/_guides/creator.md']
}

const customCopy = copy.concat([
	{
		from: path.join(__dirname, 'node_modules', 'angular-hammer', 'angular.hammer.min.js'),
		to: path.join(outputPath, 'vendor'),
	},
	{
		from: path.join(__dirname,'node_modules', 'hammerjs', 'hammer.min.js'),
		to: path.join(outputPath, 'vendor')
	},
	{
		from: path.join(__dirname, 'src', '_guides', 'assets'),
		to: path.join(outputPath, 'guides', 'assets')
	}
])

const babelLoaderWithPolyfillRule = {
	test: /\.js$/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: [
				['@babel/preset-env', {
					targets: { browsers: ["last 2 versions", "ie >= 11"]},
					debug: true
				}]
			]
		}
	}
}

const customRules = [
	babelLoaderWithPolyfillRule,
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.copyImages,
	rules.loadAndCompileMarkdown
]

const options = {
	moduleRules: customRules,
	copyList: customCopy,
	entries: entries
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)

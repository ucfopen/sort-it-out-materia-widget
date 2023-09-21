const path = require('path')
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const outputPath = path.join(__dirname, 'build')
const srcPath = path.join(__dirname, 'src')
const rules = widgetWebpack.getDefaultRules()
const copy = widgetWebpack.getDefaultCopyList()

const entries = {
	'player': [
		path.join(srcPath, 'player.html'),
		path.join(srcPath, 'player.js'),
		path.join(srcPath, 'player.scss')
	],
	'creator': [
		path.join(srcPath, 'creator.html'),
		path.join(srcPath, 'creator.js'),
		path.join(srcPath, 'creator.scss'),
	],
	'scoreScreen': [
		path.join(srcPath, 'scoreScreen.html'),
		path.join(srcPath, 'scoreScreen.js'),
		path.join(srcPath, 'scoreScreen.scss'),
	]
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

// uses options from babel.config.js
// placed there so that jest and webpack find it
const babelLoaderWithPolyfillRule = {
	test: /\.js$/,
	use: {
		loader: 'babel-loader'
	}
}

const customRules = [
	babelLoaderWithPolyfillRule,
	rules.loadAndPrefixSASS,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.copyImages
]

const options = {
	moduleRules: customRules,
	copyList: customCopy,
	entries: entries
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)

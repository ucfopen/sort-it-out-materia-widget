const path = require('path')
const baseConfig = require('materia-widget-development-kit/webpack-widget').getLegacyWidgetBuildConfig()

baseConfig.entry = {
	'creator.js': ['core-js/es6/symbol','core-js/es6/promise', './src/creator.js'],
	'player.js': ['core-js/es6/symbol', 'core-js/es6/promise', './src/player.js'],
	'scoreScreen.js': ['./src/scoreScreen.js'],
	'creator.css': ['./src/creator.scss', './src/creator.html'],
	'player.css': ['./src/player.scss', './src/player.html'],
	'scoreScreen.css': ['./src/scoreScreen.scss', './src/scoreScreen.html'],
	'angular-hammer.js': ['./src/angular-hammer.js'],
	'hammer.min.js': ['./src/hammer.min.js']
}

baseConfig.module.rules.push({
	test: /\.js$/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: ['babel-preset-env']
		}
	},
	exclude: /(node_modules|bower_components)/,
})

module.exports = baseConfig

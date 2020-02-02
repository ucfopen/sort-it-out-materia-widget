module.exports = {
	ignore:['node_modules'],
	presets: [
		['@babel/preset-env', {
			targets: { browsers: [">0.25%, not ie 11, not op_mini all"]},
			useBuiltIns: 'usage',
			corejs: '2',
			debug: false
		}]
	]
}

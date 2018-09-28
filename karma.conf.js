module.exports = function(config) {
	config.set({

		basePath: './',

		browsers: ['PhantomJS'],

		files: [
			'node_modules/angular/angular.js',
			'node_modules/angular-mocks/angular-mocks.js',
			'node_modules/angular-animate/angular-animate.js',
			'node_modules/angular-aria/angular-aria.js',
			'node_modules/angular-messages/angular-messages.js',
			'node_modules/angular-material/angular-material.js',
			'node_modules/angular-sanitize/angular-sanitize.js',
			'node_modules/materia-server-client-assets/dist/js/materia.js',
			'node_modules/materia-server-client-assets/dist/js/student.js',
			'node_modules/materia-server-client-assets/dist/js/author.js',
			'node_modules/materia-server-client-assets/dist/js/materia.creatorcore.js',
			'node_modules/materia-server-client-assets/dist/js/materia.enginecore.js',
			'node_modules/materia-server-client-assets/dist/js/materia.scorecore.js',
			'build/demo.json',
			'build/hammer.min.js',
			'build/angular-hammer.js',
			'build/creator.js',
			'build/player.js',
			'build/scoreScreen.js',
			'tests/*.js'
		],

		frameworks: ['jasmine'],

		plugins: [
			'karma-coverage',
			'karma-jasmine',
			'karma-json-fixtures-preprocessor',
			'karma-mocha-reporter',
			'karma-phantomjs-launcher'
		],

		preprocessors: {
			'build/creator.js': ['coverage'],
			'build/player.js': ['coverage'],
			'build/scoreScreen.js': ['coverage'],
			'build/demo.json': ['json_fixtures']
		},

		jsonFixturesPreprocessor: {
			variableName: '__demo__'
		},

		reporters: ['coverage', 'mocha'],

		coverageReporter: {
			check: {
				global: {
					statements: 100,
					branches:   80,
					functions:  90,
					lines:      90
				},
				each: {
					statements: 100,
					branches:   80,
					functions:  90,
					lines:      90
				}
			},
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'cobertura', subdir: '.', file: 'coverage.xml' }
			]
		},

		mochaReporter: {
			output: 'autowatch'
		}

	});
};

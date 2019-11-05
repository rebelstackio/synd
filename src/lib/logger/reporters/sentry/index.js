/* src/lib/logger/reporters/sentry/index.js */
'use strict';

const SENTRY = require('@sentry/node');
const OS = require('os');

const DEFAULTS = require('./default.json');
const LoggerPrototypal = require('lib/logger/reporters/base');

const SentryReporter = {
	ready: false,
	error: null,
	init({ CONFIG, Sentry = SENTRY, os = OS }){
		if ( CONFIG.isReady() && CONFIG.has('sentry') ){
			try {
				let config = Object.assign(
					{},
					DEFAULTS,
					CONFIG.get('sentry'),
				);
				Sentry.init(config);
				// Set usefull tags for Sentry
				Sentry.configureScope((scope) => {
					scope.setTag('host', CONFIG.get('hostname'));
					scope.setTag('os_type', os.type());
					scope.setTag('os_platform', os.platform());
				});
				this.ready = true;
				this.engine = {
					error: (...args) => {
						if ( this.ready ){
							const [message, ...extras] = args;
							Sentry.withScope(scope => {
								scope.setLevel('error');
								extras.forEach((ex, ind) => {
									scope.setExtra(`args${ind}`, ex);
								});
								Sentry.captureMessage(message);
							});
						}
					},
					fatal: (...args) => {
						if ( this.ready ) {
							const [message, ...extras] = args;
							Sentry.withScope(scope => {
								scope.setLevel('fatal');
								extras.forEach((ex, ind) => {
									scope.setExtra(`args${ind}`, ex);
								});
								Sentry.captureMessage(message);
							});
						}
					}
				}
			} catch (error) {
				this.ready = false;
				this.error = error;
			}
		} else {
			this.ready = false;
			this.error = new Error(`Config is not valid. Unable to load Sentry Reporter for the logger`);
			this.engine = {};
		}

		// Return a wrapper based on LoggerPrototypal
		return Object.assign(
			Object.create(LoggerPrototypal),
			{
				engine:  this.engine,
				close: () => Promise.resolve()
				// getLevel
			}
		);
	},
};

module.exports = SentryReporter;

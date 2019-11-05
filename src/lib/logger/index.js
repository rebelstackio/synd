/* lib/logger/index.js */
'use strict';

/**
 * Handle all the message to the all the reporters
 */
const logger = function _logger() {

	var reporters = Array.prototype.slice.call(arguments);

	const debug = function _debug() {
		reporters.map( reporter => reporter.debug && reporter.debug.apply(reporter, arguments));
	};

	const info = function _info() {
		reporters.map( reporter => reporter.info  && reporter.info.apply(reporter, arguments));
	};

	const warn = function _warn() {
		reporters.map( reporter => reporter.warn  && reporter.warn.apply(reporter, arguments));
	};

	const error = function _error() {
		reporters.map( reporter => reporter.error && reporter.error.apply(reporter, arguments));
	};

	const fatal = function _fatal() {
		reporters.map( (reporter) => reporter.fatal && reporter.fatal.apply(reporter, arguments));
	};

	const addReporter = ( nreporter ) => {
		if ( nreporter.isReady() ){
			reporters.push(nreporter);
		}
	};

	/**
	 * Close all the reporter( all that can close like telegraf other will be return a resolve promise )
	 */
	const close = () => {
		return Promise.all( reporters.map( reporter => reporter.close && reporter.close.apply(reporter) ));
	};

	/**
	 * Change the level dinamically
	 * @param {string} level
	 */
	const setLevel = function _setLevel(){
		reporters.map( (reporter) => reporter.setLevel && reporter.setLevel.apply(reporter, arguments));
	};

	return {
		debug,
		info,
		warn,
		error,
		fatal,
		addReporter,
		close,
		setLevel
	};

};

module.exports = logger;

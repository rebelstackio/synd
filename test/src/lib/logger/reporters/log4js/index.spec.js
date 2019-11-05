/* test/src/lib/logger/reporters/log4js/index.spec.js */
'use strict';

const Logger = require('../../../../../../src/lib/logger/reporters/log4js');

const log4jsMock = {
	configure : () => {},
	getLogger: () => {
		return {
			level: 'debug'
		}
	}
};

describe('Log4js Reporter Factory', () => {

	test('getLevel function returns the default value for level: debug', () => {
		const log = Logger({ log4js: log4jsMock });
		expect(log.getLevel()).toBe('debug');
	});

	test('getLevel function returns the same level if the level provided is invalid', () => {
		const log = Logger({ log4js: log4jsMock });
		const oldlevel = log.getLevel();
		log.setLevel('random')
		expect(log.getLevel()).toBe(oldlevel);
	});

	test('setLevel function change the value of level to another allowed value', () => {
		const log = Logger({ log4js: log4jsMock });
		expect(log.getLevel()).toBe('debug');
		log.setLevel('info');
		expect(log.getLevel()).toBe('info');
		log.setLevel('error');
		expect(log.getLevel()).toBe('error');
		log.setLevel('debug');
		expect(log.getLevel()).toBe('debug');
	});

});

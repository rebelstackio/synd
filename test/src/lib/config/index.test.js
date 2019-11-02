/* test/src/lib/config/index.spec.js */
'use strict';

const DEFAULTS = require('../../../../src/lib/config/default.json');
const Config = require('../../../../src/lib/config');

describe('Config Test Suit', () => {

	test('init returns an object with the function isReady ', () => {
		const config = Config.init();
		expect(config).toHaveProperty('isReady');
	});

	test('init returns an object with the function getError', () => {
		const config = Config.init();
		expect(config).toHaveProperty('getError');
	});

	test('isReady returns false if there was a problem loading the configuration', () => {
		const loadfileMockFail = ( ) => {
			throw new Error(`Unable to read config file`);
		}
		const config = Config.init({ loadfile: loadfileMockFail });
		expect(config.isReady()).toBeFalsy();
	});

	test('getError returns the last error loding the configuration', () => {
		const loadfileMockFail = ( ) => {
			throw new Error(`Unable to read config file`);
		}
		const config = Config.init({ loadfile: loadfileMockFail });
		expect(config.getError()).toBeInstanceOf(Error);
	});

	test('configfile should be equal to the default value(default.json) if it was not provided', () => {
		const loadfileMockFail = jest.fn();
		Config.init({ loadfile: loadfileMockFail });
		expect(loadfileMockFail).toHaveBeenCalledWith(DEFAULTS.conf_file)
	});

	// TODO: Define config properties
});

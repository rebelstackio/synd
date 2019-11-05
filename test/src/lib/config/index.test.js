/* test/src/lib/config/index.spec.js */
'use strict';

const os = require('os');

const DEFAULTS = require('../../../../src/lib/config/default.json');
const Config = require('../../../../src/lib/config');

const loadfileMockOK = jest.fn(() => { });

const pathMock = {
	resolve: (s) => s
};

describe('Config Test Suit', () => {

	describe('getters', () => {

		test('isReady returns false if there was a problem loading the configuration', () => {
			const loadfileMockFail = ( ) => {
				throw new Error(`Unable to read config file`);
			}
			const config = Config.init({ loadfile: loadfileMockFail, path: pathMock });
			expect(config).toHaveProperty('isReady');
			expect(config.isReady()).toBeFalsy();
		});

		test('getError returns the last error loading the configuration', () => {
			const loadfileMockFail = ( ) => {
				throw new Error(`Unable to read config file`);
			}
			const config = Config.init({ loadfile: loadfileMockFail, path : pathMock });
			expect(config).toHaveProperty('getError');
			expect(config.getError()).toBeInstanceOf(Error);
		});

		test('getConfigFile returns the property configfile with default based on file src/lib/config/default.json', ()  => {
			const config = Config.init({ configfile: '/opt/random/syndb.json', loadfile: loadfileMockOK, env: 'production', path : pathMock });
			expect(config.getConfigFile()).toBe('/opt/random/syndb.json');
		});

		test('getEnv returns the env values based on the argument provided in the init', ()  => {
			const config = Config.init({ loadfile: loadfileMockOK, env: 'production', path : pathMock });
			expect(config.getEnv()).toBe('production');
		});

	});

	describe('Default values', () => {

		test('Default value for hostname property is equal to host hostname value', () => {
			const config = Config.init({ loadfile: loadfileMockOK, env: 'production', path : pathMock });
			const hostname = os.hostname();
			expect(config.get('hostname')).toBe(hostname);
		});

		test('Default value for conf_file property equal to /etc/watchtower/wt_conf.json', () => {
			const config = Config.init({ loadfile: loadfileMockOK, env: 'production', path : pathMock });
			expect(config.get('conf_file')).toBe(DEFAULTS.conf_file);
		});

	});

	describe('Overwrite values with a real testing config file', () => {

	});

});

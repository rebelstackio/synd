/* src/lib/config/index.js */
'use strict';

const DEFAULTS = require('./default.json');

const Config = {
	init({ configfile = DEFAULTS.conf_file, loadfile = require }={}) {
		var ready = true;
		var err = null;
		try {
			this.cfg = loadfile(configfile);
		} catch (error) {
			ready = false;
			err = error;
		} finally {
			return {
				getError: () => err,
				isReady: () => ready
			};
		}
	}
};

module.exports = Config;

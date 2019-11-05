/* src/lib/config/index.js */
'use strict';

const DEFAULTS = require('./default.json');
const os = require('os');
const pathmodule = require('path');

const Config = {
	ready: false,
	cfg: null,
	env: null,

	init({ configfile = DEFAULTS.conf_file, loadfile = require, env = process.env.NODE_ENV, path = pathmodule }={}) {
		try {
			this.cfg = Object.assign(
				{},
				{ 'hostname' : os.hostname() },
				DEFAULTS,
				loadfile(path.resolve(this.configfile)),
			);
			this.configfile = configfile;
			this.env = env;
		} catch (error) {
			this.ready = false;
			this.err = error;
		} finally {
			return {
				getError: () => this.err,
				isReady: () => this.ready,
				getConfigFile: () => this.configfile,
				getEnv: () => this.env,
				get: ( key ) => {
					return this.cfg.hasOwnProperty(key) ? this.cfg[key] : undefined;
				},
				has: ( key ) => {
					return this.cfg.hasOwnProperty(key) && Boolean(this.cfg[key])
				}
			};
		}
	}
};

module.exports = Config;

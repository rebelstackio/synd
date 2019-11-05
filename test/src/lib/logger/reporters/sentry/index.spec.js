/* test/src/lib/logger/reporters/sentry/index.spec.js */
'use strict';

const Sentry = require('../../../../../../src/lib/logger/reporters/sentry');

const ConfigMock = {
	get: ( key ) => {
		if (key == 'hostname') return 'test'
	},
	has: ( key ) => true,
	isReady: () => true
}

let SentryMock;

describe('Sentry Reporter Factory', () => {

	beforeEach(() => {
		SentryMock = {
			init: jest.fn(),
			configureScope: jest.fn(),
			captureMessage: jest.fn(),
			withScope: jest.fn((cb) => {
				let obj = {
					setLevel: () => true,
					setExtra: () => true
				}
				cb(obj);
			})
		}
	});

	test('init function returns a object with the engines property', () => {
		const sentry = Sentry.init({ CONFIG:ConfigMock, Sentry:SentryMock });
		expect(sentry).toBeObject();
		expect(sentry).toHaveProperty('engine');
	});

	test('init function calls Sentry init and configureScope methods based on the config', () => {
		Sentry.init({CONFIG:ConfigMock, Sentry:SentryMock});
		expect(SentryMock.init).toBeCalled();
		expect(SentryMock.configureScope).toBeCalled();
	});

	test('engine.error function calls the sentry withScope and captureMessage methods', () => {
		SentryMock = {
			init: jest.fn(),
			configureScope: jest.fn(),
			captureMessage: jest.fn(),
			withScope: jest.fn((cb) => {
				let obj = {
					setLevel: (level) => {
						expect(level).toBe('error')
						return true
					},
					setExtra: () => true
				}
				cb(obj);
			})
		}
		const sentry = Sentry.init({CONFIG:ConfigMock, Sentry:SentryMock});
		sentry.engine.error('test');
		expect(SentryMock.withScope).toHaveBeenCalledTimes(1);
		expect(SentryMock.captureMessage).toHaveBeenCalledTimes(1);
	});

	test('engine.fatal call the sentry withScope and captureMessage methods', () => {
		SentryMock = {
			init: jest.fn(),
			configureScope: jest.fn(),
			captureMessage: jest.fn(),
			withScope: jest.fn((cb) => {
				let obj = {
					setLevel: (level) => {
						expect(level).toBe('fatal')
						return true
					},
					setExtra: () => true
				}
				cb(obj);
			})
		}
		const sentry = Sentry.init({CONFIG:ConfigMock, Sentry:SentryMock});
		sentry.engine.fatal('test');
		expect(SentryMock.withScope).toHaveBeenCalledTimes(1);
		expect(SentryMock.captureMessage).toHaveBeenCalledTimes(1);
	});

});

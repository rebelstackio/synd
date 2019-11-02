/* src/index.js */
'use strict'

require('app-module-path').addPath(__dirname);

// Graceful shutdown - For ctrl + C command
// Allow to turn off all the synd's components first
process.on('SIGINT', () => {
	// TODO: Stop deamon components
	process.exit(0);
});

// Graceful shutdown - For init.d service restart or systemd reload
process.on('SIGTERM', () => {
	// TODO: Handle this signal
});

// Uncaught exception - Capture exception in a high level
process.on('uncaughtException', (e) => {
	// Add fatal log entry
	LOGGER.fatal(`Uncaught Exception:`, e);
	// Stop LOGGER
	LOGGER.close();
	// Exit main process with 1
	process.exit(1);
});

// Just start synd only in development or production.
if ( process.env !== 'testing' ) {
	// TODO: Start deamon
}

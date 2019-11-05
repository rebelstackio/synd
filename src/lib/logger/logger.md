# Logger

Based on custom `reporters`. The Logger instance(`LOGGER`) is available in any level of watchtower.

## Methods

- `debug`
- `info`
- `warn`
- `error`
- `fatal`

All the methods allows to pass extra parameters like object or custom variables:

```js
LOGGER.info(`This is a info message`, { custom: true });
```
## Reporters

- [log4js](https://log4js-node.github.io/log4js-node/)

	Redirect all kind of messages to the `stdout` and a custom file(`/var/log/wt/wt.log` by default)

- [Sentry](https://docs.sentry.io/error-reporting/quickstart/?platform=node)

	Redirect only the `error` and `fatal` messages to Sentry dashboard. A valid sentry account is required and configured in the watchtower's configuration file:

	```json
	"sentry": {
		"dsn": "https://XXXXXXXXXX@sentry.io/YYYYYY",
		"debug": true,
		"environment": "staging"
	}
	```

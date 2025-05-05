const IS_PRODUCTION = process.env.RENDER === 'true' || process.env.HOST?.includes('render');
const LOG_LEVEL = IS_PRODUCTION ? 'warn' : 'debug';

const loggerConfig = {
  level: LOG_LEVEL,
    file: './src/logs/server.log',
  serializers: {
    err: ({ name, message, code, statusCode }) => ({ name, message, code, statusCode }),
    req: ({ method, url, id }) => ({ method, url, requestId: id })
  },
  formatters: {
    level: label => ({ level: label.toUpperCase() }),
    bindings: () => ({}),
    log: ({ msg, err }) => ({
      message: msg,
      ...(err && {
        error: `${err.name || 'Error'} (${err.statusCode || err.code || ''}): ${err.message}`
      })
    })
  }
};

module.exports = { loggerConfig, LOG_LEVEL };

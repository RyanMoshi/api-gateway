'use strict';
const start = Date.now();

function healthCheck() {
  return {
    status: 'ok',
    uptime: Math.floor((Date.now() - start) / 1000) + 's',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
  };
}

module.exports = healthCheck;

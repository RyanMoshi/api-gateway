'use strict';
// Lightweight API gateway — route requests to upstream services

class ApiGateway {
  constructor(options) {
    options = options || {};
    this.routes = new Map();
    this.middlewares = [];
    this.timeout = options.timeout || 5000;
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be a function');
    this.middlewares.push(fn);
    return this;
  }

  register(method, path, upstream) {
    if (!method || !path || !upstream) throw new Error('method, path, and upstream are required');
    this.routes.set(method.toUpperCase() + ':' + path, { upstream: upstream, addedAt: Date.now() });
    return this;
  }

  async handle(req) {
    req = req || {};
    const method = req.method || 'GET';
    const path = req.path || '/';
    for (const mw of this.middlewares) {
      const result = await mw({ method, path, headers: req.headers || {} });
      if (result && result.abort) {
        return { status: result.status || 403, body: result.message || 'Forbidden' };
      }
    }
    const route = this.routes.get(method.toUpperCase() + ':' + path);
    if (!route) return { status: 404, body: 'No route for ' + method + ' ' + path };
    return { status: 200, upstream: route.upstream, latency: Math.floor(Math.random() * 50) + 'ms' };
  }

  listRoutes() {
    return [...this.routes.entries()].map(([k, v]) => ({ route: k, upstream: v.upstream }));
  }

  remove(method, path) {
    return this.routes.delete(method.toUpperCase() + ':' + path);
  }
}

module.exports = ApiGateway;

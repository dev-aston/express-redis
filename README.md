

@empy/express-redis
===
# Install

    npm install @empy/express-redis

# Usage

## Redis Client

This module is not meant to manage the redis connection. It is expected that the app using it to manage the redis configuration.

It is written to work with the [node-redis](https://github.com/redis/node-redis) client. See the documentation for the [client-configuration](https://github.com/redis/node-redis/blob/HEAD/docs/client-configuration.md).

## Express app
```js
  const redis = require('redis')

  const client = redis.createClient(config)

  await client.connect()

  const { cacheMiddleware } = cacheMiddlewares(config, redisClient)

```

## Routing

### General routing

It can be used to cache all matching express routes, identified by a `path` or a `regexp`.

```js
  const app = express()

  app.use('/path/to/cache', cacheMiddleware)
  app.use('/regexp_to_match/', cacheMiddleware)
```

### Specific caching

It can also be used route by route, by chaining the middleware in the route declaration.

```js
  const app = express()

  app.get('/route_to_cache', cacheMiddleware, (req, res, next) => {...})
```

# Test

We use Mocha and Should for the tests. You can invoke tests like this:

    npm run test

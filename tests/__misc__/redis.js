const redis = require('redis')

const DEFAULT_CONFIG = {
  socket: {
    // host: 'localhost',
    // port: 6379,
  },
}

const connect = async (config = DEFAULT_CONFIG) => {
  const client = redis.createClient(config)

  await client.connect()

  client.on('error', (err) => console.error('Redis Client Error', err))

  return client
}

module.exports = connect

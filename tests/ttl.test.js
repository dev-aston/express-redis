const request = require('supertest')
const redis = require('./__misc__/redis')
const server = require('./__misc__/server')
const { sleep } = require('./__misc__/tools')

const { LARGE_PAYLOAD } = require('./__misc__/payloads')

let agent
let client

beforeAll(async () => {
  const config = { ttl: 1, debug: true }
  client = await redis({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
    database: 2,
  })
  await client.FLUSHALL()

  const app = server(config, client)

  agent = request(app)
})

afterAll(async () => {
  await client.quit()
})

describe('Express - General routing', () => {
  test('GET - Response in cache with expiry', async () => {
    const url = '/cache/get'
    // 1st call, the endpoint returns its json, and is supposed to be cached.
    const res = await agent.get(url)

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    const cache = await client.get(url)
    expect(JSON.parse(cache)).toMatchObject(LARGE_PAYLOAD)

    await sleep(2000)

    const expiredCache = await client.get(url)
    expect(expiredCache).toBeNull()
  })
})

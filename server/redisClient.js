const { createClient } = require('redis');

const client = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

client.on('error', err => console.error('❌ Redis Client Error:', err));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log('✅ Redis (for caching) connected');
  }
}

module.exports = { client, connectRedis };

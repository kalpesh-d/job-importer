import { createClient } from 'redis';

const client = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD, // safer via env
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

client.on('error', err => console.error('❌ Redis Client Error:', err));

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log('✅ Redis connected');
  }
}

export default client;

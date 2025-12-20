/**
 * Simple Redis Test Script
 * Run with: npx ts-node src/test-redis.ts
 * 
 * This script tests Redis connection and basic operations
 */

import { Redis } from 'ioredis';

async function testRedis() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  });

  try {
    console.log('🔍 Testing Redis connection...\n');

    // Test 1: Ping
    const pingResult = await redis.ping();
    console.log(`✅ Ping: ${pingResult}`);

    // Test 2: Set/Get
    await redis.set('test:key', 'test-value', 'EX', 60);
    const value = await redis.get('test:key');
    console.log(`✅ Set/Get: ${value}`);

    // Test 3: Exists
    const exists = await redis.exists('test:key');
    console.log(`✅ Exists: ${exists === 1}`);

    // Test 4: TTL
    const ttl = await redis.ttl('test:key');
    console.log(`✅ TTL: ${ttl} seconds`);

    // Test 5: Increment
    await redis.set('test:counter', '0');
    const incr = await redis.incr('test:counter');
    console.log(`✅ Increment: ${incr}`);

    // Test 6: Delete
    await redis.del('test:key', 'test:counter');
    const existsAfter = await redis.exists('test:key');
    console.log(`✅ Delete: ${!existsAfter}`);

    // Test 7: Check BullMQ keys
    const bullKeys = await redis.keys('bull:publish-posts:*');
    console.log(`✅ BullMQ queue keys found: ${bullKeys.length}`);

    console.log('\n🎉 All Redis tests passed!');
  } catch (error: any) {
    console.error('\n❌ Redis test failed:', error.message);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

testRedis();


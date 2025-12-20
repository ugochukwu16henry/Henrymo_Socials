# Testing Guide - Verifying Redis & Publishing Engine

## 🧪 How to Verify Everything is Working

### Prerequisites

1. **Start Redis** (if using Docker):

   ```bash
   docker-compose up -d redis
   ```

2. **Start the Backend**:

   ```bash
   npm run dev:backend
   ```

3. **Check Environment Variables**:
   Ensure `backend/.env` has:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

---

## 1. ✅ Testing Redis Connection

### Method 1: Check Startup Logs

When the backend starts, look for:

```
✅ Redis connected
```

If you see connection errors, Redis might not be running.

### Method 2: Health Check Endpoint

Visit the health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "message": "HenryMo Socials API is running!",
  "timestamp": "2025-12-20T...",
  "redis": "connected"
}
```

**Status values:**

- `"redis": "connected"` ✅ Redis is working
- `"redis": "disconnected"` ⚠️ Redis connection failed
- `"redis": "error"` ❌ Redis error occurred
- No `redis` field = RedisModule not loaded

### Method 3: Test Redis Directly

```bash
# Open Redis CLI
docker exec -it henrymo_redis redis-cli

# Test commands
PING  # Should return PONG
SET test "hello"
GET test  # Should return "hello"
DEL test
```

---

## 2. ✅ Testing Caching Functionality

### Test RedisService in Code

You can test caching by adding this to any service:

```typescript
// Example: backend/src/users/users.service.ts
import { RedisService } from "../redis/redis.service";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService // Inject RedisService
  ) {}

  async testCache() {
    // Set a value
    await this.redisService.set("test:key", "test value", 60);

    // Get it back
    const value = await this.redisService.get("test:key");
    console.log("Cached value:", value); // Should print "test value"

    // Check if exists
    const exists = await this.redisService.exists("test:key");
    console.log("Key exists:", exists); // Should be true

    // Delete it
    await this.redisService.delete("test:key");

    // Check again
    const existsAfter = await this.redisService.exists("test:key");
    console.log("Key exists after delete:", existsAfter); // Should be false
  }
}
```

### Test Cache Decorator

```typescript
import { Cache, CacheInvalidate } from "../redis/cache.decorator";

@Injectable()
export class UsersService {
  constructor(private redisService: RedisService) {}

  @Cache({ ttl: 300, keyPrefix: "user" })
  async getUser(id: string) {
    console.log("Fetching user from database..."); // Should only log once per cache
    return this.prisma.user.findUnique({ where: { id } });
  }

  @CacheInvalidate({ keyPattern: "user:*" })
  async updateUser(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
```

---

## 3. ✅ Testing Publishing Engine

### Step 1: Check Queue is Registered

Look for in startup logs:

```
[Nest] LOG [BullModule] Queue "publish-posts" registered
```

### Step 2: Create a Scheduled Post

**Using API:**

```bash
# First, get auth token (login)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'

# Use the token to create a post
curl -X POST http://localhost:3000/api/teams/{teamId}/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentText": "Test scheduled post",
    "scheduledAt": "2025-12-20T18:00:00Z",
    "platformIds": ["social-account-id-1"],
    "status": "scheduled"
  }'
```

**Expected Behavior:**

1. Post is created with status `"scheduled"`
2. Job is added to BullMQ queue
3. Log shows: `Scheduled post {postId} for platform {platform} at {time}`

### Step 3: Check Queue Status

**In Logs:**
Look for messages like:

```
[PublishingService] Scheduled 1 publishing jobs for post {postId}
[PublishingProcessor] Processing publish job for post {postId}...
```

**In Database:**
Check `posts` table - status should be `"scheduled"`

### Step 4: Test Immediate Publishing

Create a post without `scheduledAt` and manually publish:

```bash
# Create post with status "published"
curl -X POST http://localhost:3000/api/teams/{teamId}/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentText": "Test immediate post",
    "platformIds": ["social-account-id-1"],
    "status": "published"
  }'
```

**Expected:**

- Job is immediately added to queue
- Processor picks it up right away
- Post status updates to `"published"`

### Step 5: Monitor Queue Processing

Watch the logs for:

**Success:**

```
[PublishingProcessor] Successfully published post {postId} to {platform}
[PublishingProcessor] Job {jobId} completed successfully
```

**Failure:**

```
[PublishingProcessor] Job {jobId} failed: {error message}
```

### Step 6: Verify Database Updates

Check the database:

```sql
-- Check post status
SELECT id, status, scheduled_at, published_at
FROM posts
WHERE status = 'scheduled' OR status = 'published';

-- Check post platform status
SELECT pp.id, pp.status, pp.platform_post_id, pp.error_message, sa.platform
FROM post_platforms pp
JOIN social_accounts sa ON pp.social_account_id = sa.id
WHERE pp.status IN ('published', 'failed');
```

---

## 4. 🔍 Debugging & Verification

### Check Redis Keys

```bash
docker exec -it henrymo_redis redis-cli

# List all keys
KEYS *

# Check BullMQ queue keys
KEYS bull:publish-posts:*

# Get queue info
LLEN bull:publish-posts:wait
LLEN bull:publish-posts:delayed
LLEN bull:publish-posts:active
```

### Check BullMQ Queue Dashboard (Optional)

Install BullMQ Board for visual queue monitoring:

```bash
npm install @bull-board/api @bull-board/express
```

### Verify Publishing Service is Available

Check if PublishingService is injected:

```typescript
// In ContentService logs, you should see:
// "Scheduled post {id} for publishing" (if working)
// Or no errors when creating scheduled posts
```

### Test Redis Connection Manually

Create a simple test endpoint:

```typescript
// backend/src/app.controller.ts
import { RedisService } from "./redis/redis.service";

@Controller("test")
export class TestController {
  constructor(private redisService: RedisService) {}

  @Get("redis")
  async testRedis() {
    const ping = await this.redisService.ping();
    await this.redisService.set("test:key", "test-value", 60);
    const value = await this.redisService.get("test:key");

    return {
      ping,
      setGet: value,
      status: ping ? "working" : "failed",
    };
  }
}
```

Then test:

```bash
curl http://localhost:3000/api/test/redis
```

Expected:

```json
{
  "ping": true,
  "setGet": "test-value",
  "status": "working"
}
```

---

## 5. ⚠️ Common Issues & Solutions

### Issue: Redis not connecting

**Symptoms:**

- Logs show: `❌ Redis connection error`
- Health check shows: `"redis": "disconnected"`

**Solutions:**

1. Check Redis is running: `docker ps | grep redis`
2. Check port: `netstat -an | findstr 6379` (Windows)
3. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`
4. Restart Redis: `docker-compose restart redis`

### Issue: Publishing jobs not processing

**Symptoms:**

- Jobs are scheduled but never execute
- No logs from PublishingProcessor

**Solutions:**

1. Check Redis connection (jobs are stored in Redis)
2. Verify PublishingProcessor is registered in module
3. Check logs for BullMQ errors
4. Verify post has `scheduledAt` in the future
5. Check if `platformIds` are provided

### Issue: Cache not working

**Symptoms:**

- Values not cached
- Decorators not working

**Solutions:**

1. Ensure RedisService is injected in your service
2. Check Redis connection is working
3. Verify decorator syntax is correct
4. Check service has `redisService` property if using decorators

---

## 6. ✅ Quick Verification Checklist

- [ ] Redis container is running (`docker ps`)
- [ ] Backend starts without Redis errors
- [ ] Health check shows `"redis": "connected"`
- [ ] Can create scheduled post via API
- [ ] Logs show "Scheduled X publishing jobs"
- [ ] Posts table has status "scheduled"
- [ ] Jobs appear in Redis (using `redis-cli`)
- [ ] Processor logs appear when job executes
- [ ] Post status updates after processing

---

## 📊 Monitoring in Production

### Railway Logs

Check Railway deployment logs for:

- Redis connection status
- Queue job processing
- Publishing success/failure messages

### Database Queries

Monitor:

```sql
-- Scheduled posts waiting
SELECT COUNT(*) FROM posts WHERE status = 'scheduled';

-- Failed posts
SELECT COUNT(*) FROM posts WHERE status = 'failed';

-- Successfully published
SELECT COUNT(*) FROM posts WHERE status = 'published';
```

### Metrics to Track

1. **Queue size** - Number of jobs waiting
2. **Processing time** - How long jobs take
3. **Success rate** - Published vs Failed
4. **Cache hit rate** - Cached vs Database queries

---

## 🎯 Summary

**To verify Redis:**

1. ✅ Check health endpoint shows `"redis": "connected"`
2. ✅ Test caching operations work
3. ✅ Check logs for "Redis connected" message

**To verify Publishing Engine:**

1. ✅ Create a scheduled post
2. ✅ Check logs show "Scheduled X publishing jobs"
3. ✅ Verify job appears in Redis queue
4. ✅ Watch processor logs when job executes
5. ✅ Verify post status updates in database

Both systems are working if you see successful logs and database updates! 🎉

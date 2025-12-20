# Publishing Engine

The Publishing Engine handles scheduled and immediate post publishing to various social media platforms using BullMQ for job queue management.

## Architecture

### Core Components

1. **PublishingService** - Manages job scheduling and queue operations
2. **PublishingProcessor** - Processes jobs from the queue (BullMQ worker)
3. **Platform Publishers** - Platform-specific publishing logic
   - BasePublisher - Abstract base class with common functionality
   - Platform-specific implementations (Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube)

### How It Works

1. **Scheduling Posts:**
   - When a post is created/updated with a `scheduledAt` date, it's automatically added to the queue
   - Jobs are scheduled to run at the specified time
   - Each platform gets its own job in the queue

2. **Processing Jobs:**
   - BullMQ processor picks up jobs when they're due
   - Fetches post and social account data
   - Calls the appropriate platform publisher
   - Updates database with results

3. **Platform Publishers:**
   - Each platform has its own publisher class extending `BasePublisher`
   - Currently stubs - ready for API integration
   - Handle platform-specific logic (media upload, API calls, etc.)

## Usage

### Automatic Scheduling

Posts with `scheduledAt` are automatically scheduled when created/updated:

```typescript
// In ContentService - automatically called
if (post.scheduledAt && post.status === 'scheduled') {
  await publishingService.schedulePost(post.id);
}
```

### Manual Publishing

Publish a post immediately:

```typescript
await publishingService.publishNow(postId);
```

### Cancel Scheduled Post

Cancel scheduled jobs for a post:

```typescript
await publishingService.cancelScheduledPost(postId);
```

## Configuration

### Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
```

### Queue Configuration

- **Queue Name:** `publish-posts`
- **Retry Attempts:** 3
- **Backoff:** Exponential (starts at 5 seconds)
- **Job Retention:**
  - Completed: 24 hours or last 1000 jobs
  - Failed: 7 days

## Database Updates

The processor automatically updates:

1. **PostPlatform** status:
   - `pending` → `published` (on success)
   - `pending` → `failed` (on failure)
   - Stores `platformPostId` and `errorMessage`

2. **Post** status:
   - `scheduled` → `published` (when all platforms succeed)
   - `scheduled` → `failed` (if any platform fails)

## Platform Integration

Each platform publisher needs to implement:

```typescript
async publish(
  accessToken: string,
  contentText: string,
  mediaUrls?: string[],
  options?: Record<string, any>,
): Promise<PublishResult>
```

### Current Status

All platform publishers are **stubs** ready for API integration:
- Instagram - Graph API
- Facebook - Graph API
- Twitter - API v2
- LinkedIn - LinkedIn API
- TikTok - TikTok API
- YouTube - Data API v3

## Error Handling

- Jobs automatically retry up to 3 times with exponential backoff
- Failed jobs are logged and stored in database
- Post status is updated to reflect failures
- Error messages are stored in `PostPlatform.errorMessage`

## Future Enhancements

- [ ] Implement actual API integrations for each platform
- [ ] Add webhook support for platform callbacks
- [ ] Media upload handling
- [ ] Batch publishing optimization
- [ ] Queue monitoring dashboard
- [ ] Rate limiting per platform


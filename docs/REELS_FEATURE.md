# Reels/Stories Feature - Automated Social Media Aggregation

## Overview

The Reels feature automatically aggregates vendor content from TikTok and Instagram, creating a dynamic, engaging feed without requiring vendors to post separately on the Makeriess platform. This leverages vendors' existing social media presence while providing customers with authentic, engaging content.

## Key Benefits

✅ **Zero vendor effort** - Vendors post once on their existing platforms
✅ **Authentic content** - Real vendor content, not staged for marketplace
✅ **Cross-promotion** - Vendors get exposure on TikTok/IG AND Makeriess
✅ **Fresh content** - Automatic updates as vendors post
✅ **Attribution** - Links back to original posts, drives social follows
✅ **Engagement metrics** - Track which vendors' content performs best
✅ **Discovery** - Customers find new vendors through engaging content

## Content Sources

### 1. Vendor Social Posts
- **Auto-import** posts tagged with `@makeries` or `#makeries`
- **Optional**: Import ALL posts from verified vendor accounts
- **Platforms**: TikTok, Instagram Reels
- **Frequency**: Synced every 15 minutes

### 2. Makeriess Official Content
- Auto-import from @makeries TikTok/Instagram
- Curated marketplace highlights
- Featured vendor spotlights
- Community events and announcements

## Data Model

### Story Model

```typescript
Story: a.model({
  vendorId: a.id(),
  vendor: a.belongsTo('Vendor', 'vendorId'),
  
  // Source tracking
  platform: a.enum(['TIKTOK', 'INSTAGRAM', 'MAKERIES_OFFICIAL']),
  externalPostId: a.string().required(),  // Original post ID
  externalUrl: a.string().required(),  // Link to original post
  
  // Content
  videoUrl: a.string().required(),
  thumbnailUrl: a.string(),
  caption: a.string(),
  hashtags: a.string().array(),
  mentions: a.string().array(),
  
  // Metadata
  postedAt: a.datetime().required(),
  expiresAt: a.datetime().required(),  // 24 hours from import
  viewCount: a.integer().default(0),
  likeCount: a.integer().default(0),
  shareCount: a.integer().default(0),
  completionRate: a.float().default(0),  // % who watched to end
  
  // Moderation
  isApproved: a.boolean().default(false),
  isFeatured: a.boolean().default(false),
  moderationNotes: a.string(),
  moderatedBy: a.string(),
  moderatedAt: a.datetime(),
})
.secondaryIndexes((index) => [
  index('vendorId'),
  index('platform'),
  index('expiresAt'),
])
.authorization((allow) => [
  allow.authenticated().to(['read']),
  allow.owner().to(['create', 'update', 'delete']),
]);
```

### Vendor Model Additions

```typescript
Vendor: a.model({
  // ... existing fields
  
  // Social media integration
  socialHandles: a.json(),  // { tiktok: '@vendor', instagram: '@vendor' }
  autoImportAllPosts: a.boolean().default(false),  // Import all or just tagged?
  socialSyncEnabled: a.boolean().default(true),
  lastSocialSync: a.datetime(),
  isVerifiedVendor: a.boolean().default(false),  // Auto-approve content
})
```

## Implementation Architecture

### Lambda Functions

#### 1. syncSocialContent (Scheduled)

**Trigger**: EventBridge cron (every 15 minutes)
**Purpose**: Fetch and import recent posts from vendor social accounts

```typescript
// amplify/data/functions/syncSocialContent/handler.ts

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async () => {
  console.log('Starting social content sync...');
  
  // Get vendors with social sync enabled
  const vendors = await getVendorsWithSocialSync();
  
  let totalImported = 0;
  let totalSkipped = 0;
  let errors = [];
  
  for (const vendor of vendors) {
    try {
      const { tiktok, instagram } = vendor.socialHandles || {};
      
      // Fetch recent posts (last 24 hours)
      const posts = [];
      
      if (tiktok) {
        const tiktokPosts = await fetchTikTokPosts(tiktok);
        posts.push(...tiktokPosts);
      }
      
      if (instagram) {
        const instagramPosts = await fetchInstagramPosts(instagram);
        posts.push(...instagramPosts);
      }
      
      // Process each post
      for (const post of posts) {
        // Check if already imported
        const exists = await checkStoryExists(post.externalPostId);
        if (exists) {
          totalSkipped++;
          continue;
        }
        
        // Determine if should import
        const hasMention = 
          post.caption?.includes('@makeries') ||
          post.caption?.includes('#makeries');
        
        const shouldImport = hasMention || vendor.autoImportAllPosts;
        
        if (shouldImport) {
          await createStory({
            vendorId: vendor.id,
            platform: post.platform,
            externalPostId: post.id,
            externalUrl: post.url,
            videoUrl: post.videoUrl,
            thumbnailUrl: post.thumbnailUrl,
            caption: post.caption,
            hashtags: extractHashtags(post.caption),
            mentions: extractMentions(post.caption),
            postedAt: post.createdAt,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isApproved: vendor.isVerifiedVendor || hasMention,
          });
          
          totalImported++;
          
          // Track analytics
          await trackUserInteraction({
            eventType: 'StoryCreated',
            vendorId: vendor.id,
            metadata: { 
              platform: post.platform,
              hasMention,
            },
          });
        }
      }
      
      // Update last sync timestamp
      await updateVendor(vendor.id, {
        lastSocialSync: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error(`Error syncing vendor ${vendor.id}:`, error);
      errors.push({ vendorId: vendor.id, error: error.message });
    }
  }
  
  console.log(`Sync complete: ${totalImported} imported, ${totalSkipped} skipped, ${errors.length} errors`);
  
  return {
    success: true,
    totalImported,
    totalSkipped,
    errors,
  };
};

async function getVendorsWithSocialSync() {
  // Query vendors with socialSyncEnabled = true
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.VENDOR_TABLE,
      IndexName: 'socialSyncEnabled-index',
      KeyConditionExpression: 'socialSyncEnabled = :enabled',
      ExpressionAttributeValues: {
        ':enabled': true,
      },
    })
  );
  
  return result.Items || [];
}

async function fetchTikTokPosts(username: string) {
  // Implementation depends on TikTok API access
  // Options:
  // 1. Official TikTok API (requires approval)
  // 2. Third-party API services (e.g., RapidAPI)
  // 3. Web scraping (less reliable)
  
  // Example using hypothetical API:
  const response = await fetch(`https://api.tiktok.com/v1/user/${username}/videos`, {
    headers: {
      'Authorization': `Bearer ${process.env.TIKTOK_API_KEY}`,
    },
  });
  
  const data = await response.json();
  
  return data.videos.map(video => ({
    platform: 'TIKTOK',
    id: video.id,
    url: video.share_url,
    videoUrl: video.video_url,
    thumbnailUrl: video.cover_url,
    caption: video.desc,
    createdAt: new Date(video.create_time * 1000).toISOString(),
  }));
}

async function fetchInstagramPosts(username: string) {
  // Implementation depends on Instagram API access
  // Requires Instagram Graph API with proper permissions
  
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${username}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
  );
  
  const data = await response.json();
  
  return data.data
    .filter(media => media.media_type === 'VIDEO' || media.media_type === 'REELS')
    .map(media => ({
      platform: 'INSTAGRAM',
      id: media.id,
      url: media.permalink,
      videoUrl: media.media_url,
      thumbnailUrl: media.thumbnail_url,
      caption: media.caption,
      createdAt: media.timestamp,
    }));
}

async function checkStoryExists(externalPostId: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.STORY_TABLE,
      IndexName: 'externalPostId-index',
      KeyConditionExpression: 'externalPostId = :postId',
      ExpressionAttributeValues: {
        ':postId': externalPostId,
      },
      Limit: 1,
    })
  );
  
  return result.Items && result.Items.length > 0;
}

async function createStory(story: any) {
  await docClient.send(
    new PutCommand({
      TableName: process.env.STORY_TABLE,
      Item: {
        id: generateId(),
        ...story,
        createdAt: new Date().toISOString(),
      },
    })
  );
}

function extractHashtags(text: string): string[] {
  const regex = /#(\w+)/g;
  const matches = text?.match(regex) || [];
  return matches.map(tag => tag.substring(1));
}

function extractMentions(text: string): string[] {
  const regex = /@(\w+)/g;
  const matches = text?.match(regex) || [];
  return matches.map(mention => mention.substring(1));
}
```

#### 2. getReels (Query)

**Trigger**: GraphQL query from frontend
**Purpose**: Retrieve reels feed with smart sorting

```typescript
// amplify/data/functions/getReels/handler.ts

export const handler = async (event: { arguments: GetReelsInput; identity: any }) => {
  const { latitude, longitude, radiusMiles, vendorId, limit = 20, nextToken } = event.arguments;
  const userId = event.identity?.sub;
  
  // Get user context for personalization
  const userContext = await getUserContext(userId);
  
  // Query stories
  let stories = await queryStories({
    vendorId,
    limit: limit * 2,  // Fetch more for filtering
    nextToken,
  });
  
  // Filter expired stories
  const now = new Date();
  stories = stories.filter(story => new Date(story.expiresAt) > now);
  
  // Filter by location if provided
  if (latitude && longitude && radiusMiles) {
    stories = await filterByLocation(stories, { latitude, longitude, radiusMiles });
  }
  
  // Calculate scores and sort
  stories = stories.map(story => ({
    ...story,
    score: calculateStoryScore(story, userContext),
  })).sort((a, b) => b.score - a.score);
  
  // Take top N
  const results = stories.slice(0, limit);
  
  return {
    stories: results,
    nextToken: stories.length > limit ? encodeNextToken(stories[limit]) : null,
  };
};

function calculateStoryScore(story: any, userContext: any) {
  let score = 0;
  
  // Featured content gets highest priority
  if (story.isFeatured) {
    return 1000;
  }
  
  // Recency (0-100 points)
  const hoursOld = (Date.now() - new Date(story.postedAt).getTime()) / (1000 * 60 * 60);
  score += Math.max(0, 100 - (hoursOld * 4));
  
  // Engagement (0-100 points)
  const engagementRate = (story.likeCount + story.shareCount) / Math.max(1, story.viewCount);
  score += engagementRate * 100;
  
  // Completion rate (0-50 points)
  score += story.completionRate * 50;
  
  // Proximity (0-100 points)
  if (userContext.location && story.vendor?.location) {
    const distance = calculateDistance(userContext.location, story.vendor.location);
    score += Math.max(0, 100 - (distance * 10));
  }
  
  // Personalization (0-100 points)
  if (userContext.favoriteVendors?.includes(story.vendorId)) {
    score += 100;
  }
  
  // Category match (0-50 points)
  if (userContext.favoriteCategories?.some(cat => story.vendor?.categories?.includes(cat))) {
    score += 50;
  }
  
  return score;
}
```

#### 3. trackStoryView (Mutation)

**Trigger**: GraphQL mutation from frontend
**Purpose**: Track story analytics

```typescript
// amplify/data/functions/trackStoryView/handler.ts

export const handler = async (event: { arguments: TrackStoryViewInput }) => {
  const { storyId, watchDuration, completed } = event.arguments;
  
  // Update story metrics
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.STORY_TABLE,
      Key: { id: storyId },
      UpdateExpression: 'SET viewCount = viewCount + :one, completionRate = :rate',
      ExpressionAttributeValues: {
        ':one': 1,
        ':rate': completed ? 1.0 : watchDuration / totalDuration,
      },
    })
  );
  
  // Track in analytics
  await trackUserInteraction({
    eventType: 'StoryView',
    metadata: {
      storyId,
      watchDuration,
      completed,
    },
  });
  
  return { success: true };
};
```

### GraphQL Schema

```typescript
// amplify/data/resource.ts additions

Story: a.model({
  vendorId: a.id(),
  vendor: a.belongsTo('Vendor', 'vendorId'),
  platform: a.enum(['TIKTOK', 'INSTAGRAM', 'MAKERIES_OFFICIAL']),
  externalPostId: a.string().required(),
  externalUrl: a.string().required(),
  videoUrl: a.string().required(),
  thumbnailUrl: a.string(),
  caption: a.string(),
  hashtags: a.string().array(),
  mentions: a.string().array(),
  postedAt: a.datetime().required(),
  expiresAt: a.datetime().required(),
  viewCount: a.integer().default(0),
  likeCount: a.integer().default(0),
  shareCount: a.integer().default(0),
  completionRate: a.float().default(0),
  isApproved: a.boolean().default(false),
  isFeatured: a.boolean().default(false),
  moderationNotes: a.string(),
})
.secondaryIndexes((index) => [
  index('vendorId'),
  index('platform'),
  index('expiresAt'),
])
.authorization((allow) => [
  allow.authenticated().to(['read']),
  allow.owner().to(['create', 'update', 'delete']),
]),

// Queries
getReels: a.query()
  .arguments({
    latitude: a.float(),
    longitude: a.float(),
    radiusMiles: a.float(),
    vendorId: a.id(),
    limit: a.integer(),
    nextToken: a.string(),
  })
  .returns(a.customType({
    stories: a.json().array(),
    nextToken: a.string(),
  }))
  .authorization((allow) => [allow.authenticated()])
  .handler(a.handler.function('getReels')),

// Mutations
trackStoryView: a.mutation()
  .arguments({
    storyId: a.id().required(),
    watchDuration: a.integer(),
    completed: a.boolean(),
  })
  .returns(a.customType({
    success: a.boolean(),
  }))
  .authorization((allow) => [allow.authenticated()])
  .handler(a.handler.function('trackStoryView')),

interactWithStory: a.mutation()
  .arguments({
    storyId: a.id().required(),
    action: a.enum(['LIKE', 'SHARE', 'SHOP_NOW', 'VISIT_VENDOR']),
  })
  .returns(a.customType({
    success: a.boolean(),
    redirectUrl: a.string(),
  }))
  .authorization((allow) => [allow.authenticated()])
  .handler(a.handler.function('interactWithStory')),
```

## Frontend Implementation

### Reels Page Component

```typescript
// app/reels/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useInView } from 'react-intersection-observer';

const client = generateClient();

export default function ReelsPage() {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStories();
  }, []);
  
  async function loadStories() {
    const result = await client.graphql({
      query: queries.getReels,
      variables: {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radiusMiles: 10,
        limit: 20,
      },
    });
    
    setStories(result.data.getReels.stories);
    setLoading(false);
  }
  
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {stories.map((story, index) => (
        <StoryCard
          key={story.id}
          story={story}
          isActive={index === currentIndex}
          onView={() => handleStoryView(story)}
        />
      ))}
    </div>
  );
}

function StoryCard({ story, isActive, onView }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ref, inView] = useInView({ threshold: 0.5 });
  const [watchStart, setWatchStart] = useState<number | null>(null);
  
  useEffect(() => {
    if (inView && isActive) {
      videoRef.current?.play();
      setWatchStart(Date.now());
      onView();
    } else {
      videoRef.current?.pause();
      if (watchStart) {
        trackView(story.id, Date.now() - watchStart);
        setWatchStart(null);
      }
    }
  }, [inView, isActive]);
  
  async function trackView(storyId: string, duration: number) {
    await client.graphql({
      query: mutations.trackStoryView,
      variables: {
        storyId,
        watchDuration: Math.floor(duration / 1000),
        completed: duration >= videoRef.current?.duration * 1000,
      },
    });
  }
  
  async function handleAction(action: string) {
    const result = await client.graphql({
      query: mutations.interactWithStory,
      variables: { storyId: story.id, action },
    });
    
    if (result.data.interactWithStory.redirectUrl) {
      window.location.href = result.data.interactWithStory.redirectUrl;
    }
  }
  
  return (
    <div ref={ref} className="h-screen snap-start relative">
      <video
        ref={videoRef}
        src={story.videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50">
        {/* Vendor info */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <img
            src={story.vendor.logo}
            className="w-10 h-10 rounded-full"
          />
          <span className="text-white font-medium">{story.vendor.businessName}</span>
        </div>
        
        {/* Caption */}
        <div className="absolute bottom-20 left-4 right-20">
          <p className="text-white text-sm">{story.caption}</p>
          <a
            href={story.externalUrl}
            target="_blank"
            className="text-white/70 text-xs"
          >
            View on {story.platform}
          </a>
        </div>
        
        {/* Action buttons */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-4">
          <button
            onClick={() => handleAction('SHOP_NOW')}
            className="bg-white rounded-full p-3"
          >
            🛒
          </button>
          <button
            onClick={() => handleAction('VISIT_VENDOR')}
            className="bg-white rounded-full p-3"
          >
            🏪
          </button>
          <button
            onClick={() => handleAction('SHARE')}
            className="bg-white rounded-full p-3"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Content Moderation

### Moderation Dashboard

Admin interface to review and approve stories:

```typescript
// app/admin/moderation/page.tsx

export default function ModerationDashboard() {
  const [pendingStories, setPendingStories] = useState([]);
  
  async function approveStory(storyId: string) {
    await client.graphql({
      query: mutations.updateStory,
      variables: {
        id: storyId,
        isApproved: true,
        moderatedAt: new Date().toISOString(),
      },
    });
    
    loadPendingStories();
  }
  
  async function rejectStory(storyId: string, reason: string) {
    await client.graphql({
      query: mutations.deleteStory,
      variables: { id: storyId },
    });
    
    // Optionally notify vendor
    await sendNotification(story.vendorId, {
      type: 'STORY_REJECTED',
      reason,
    });
    
    loadPendingStories();
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Story Moderation</h1>
      
      <div className="grid md:grid-cols-3 gap-4">
        {pendingStories.map(story => (
          <div key={story.id} className="border rounded-lg p-4">
            <video src={story.videoUrl} className="w-full rounded" controls />
            <p className="mt-2 text-sm">{story.caption}</p>
            <p className="text-xs text-gray-500">
              by {story.vendor.businessName} • {story.platform}
            </p>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => approveStory(story.id)}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => rejectStory(story.id, 'Inappropriate content')}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Analytics & Insights

### Story Performance Metrics

Track and display story performance for vendors:

- **View count**: Total views
- **Completion rate**: % who watched to end
- **Engagement rate**: (likes + shares) / views
- **Click-through rate**: % who clicked action buttons
- **Conversion rate**: % who made a purchase after viewing

### Vendor Dashboard Integration

```typescript
// Show story performance in vendor dashboard
const storyMetrics = await client.graphql({
  query: queries.getVendorStoryMetrics,
  variables: { vendorId: currentVendor.id },
});

// Display:
// - Total story views this week
// - Top performing stories
// - Average completion rate
// - Conversion attribution
```

## Implementation Phases

### Phase 1: MVP (Manual Upload)
- Manual story uploads by Makeriess team
- Basic video player with 24-hour expiration
- Simple chronological feed
- Basic analytics (views only)

**Timeline**: 2 weeks
**Effort**: Low

### Phase 2: Automated Sync
- TikTok/Instagram polling integration
- Hashtag/mention detection
- Auto-import for verified vendors
- Moderation queue
- Enhanced analytics

**Timeline**: 4-6 weeks
**Effort**: Medium

### Phase 3: Advanced Features
- Real-time webhooks
- Interactive action buttons
- Advanced feed algorithm
- Story analytics dashboard
- A/B testing for content
- Vendor story insights

**Timeline**: 6-8 weeks
**Effort**: High

## Technical Considerations

### API Access

**TikTok**:
- Requires TikTok for Developers account
- Apply for Content Posting API access
- Rate limits: 100 requests/day (free tier)

**Instagram**:
- Requires Facebook Developer account
- Instagram Graph API with proper permissions
- Rate limits: 200 calls/hour per user

### Video Storage

**Option 1**: Store in S3
- Download videos and upload to S3
- Use CloudFront for CDN delivery
- Cost: ~$0.023/GB storage + $0.085/GB transfer

**Option 2**: Link to original
- Store only video URLs
- Rely on platform CDNs
- Risk: Videos may be deleted/made private

**Recommendation**: Hybrid approach
- Link to original for first 24 hours
- Download and store popular content

### Performance Optimization

- **Lazy loading**: Load videos as user scrolls
- **Preloading**: Preload next 2-3 videos
- **Compression**: Use H.264 codec, optimize bitrate
- **Adaptive streaming**: Use HLS for variable quality
- **Caching**: Cache video metadata in Redis

### Legal & Compliance

- **Attribution**: Always link to original post
- **Copyright**: Respect platform terms of service
- **Privacy**: Don't store user data from platforms
- **DMCA**: Implement takedown process
- **Terms**: Update Makeriess terms to cover reposted content

## Cost Estimates

### Monthly Costs (1000 vendors, 10k stories/month)

- **Lambda executions**: ~$5
- **S3 storage** (if storing videos): ~$50
- **CloudFront**: ~$100
- **DynamoDB**: ~$10
- **API calls** (TikTok/Instagram): ~$50
- **Total**: ~$215/month

### Scaling Considerations

- Use SQS for async processing at scale
- Implement caching layer (Redis/ElastiCache)
- Consider video transcoding for optimization
- Monitor API rate limits closely

## Success Metrics

### Engagement
- Daily active users viewing reels
- Average watch time per session
- Story completion rate
- Interaction rate (clicks on action buttons)

### Business Impact
- Vendor discovery rate (new vendors found via reels)
- Conversion rate (reels → orders)
- Vendor retention (vendors with active stories)
- Customer retention (users who engage with reels)

### Content Quality
- Average story approval rate
- Moderation queue size
- Vendor participation rate
- Content freshness (avg age of stories in feed)

## Future Enhancements

- **Live streaming**: Real-time vendor broadcasts
- **Story replies**: Customer comments on stories
- **Story creation**: In-app story creation tools
- **Duets/Stitches**: Collaborative content
- **AR filters**: Branded filters for vendors
- **Story ads**: Sponsored content opportunities
- **Analytics API**: Vendor access to detailed metrics
- **Multi-language**: Automatic caption translation

## Support & Documentation

### Vendor Onboarding
- Guide on connecting social accounts
- Best practices for tagging content
- Tips for engaging content
- Analytics interpretation

### Customer Education
- How to discover vendors via reels
- How to interact with stories
- Privacy and data usage

### Admin Training
- Moderation guidelines
- Content policy enforcement
- Handling vendor disputes
- Performance monitoring

---

**Status**: Design Complete, Ready for Implementation
**Priority**: Phase 2 Feature
**Dependencies**: Core marketplace features (Tasks 1-10)
**Estimated Effort**: 6-8 weeks for full implementation

// Twitter Sentiment Scraper
// Analyzes Twitter sentiment for crypto tokens

const { TwitterApi } = require('twitter-api-v2')

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!)

async function analyzeSentiment(tokenSymbol: string) {
  try {
    const tweets = await twitterClient.v2.search(`$${tokenSymbol} -is:retweet`, {
      max_results: 100,
      'tweet.fields': ['created_at', 'public_metrics'],
    })
    
    let totalEngagement = 0
    let tweetCount = 0
    
    for (const tweet of tweets.data?.data || []) {
      const metrics = tweet.public_metrics
      totalEngagement += (metrics?.like_count || 0) + (metrics?.retweet_count || 0)
      tweetCount++
    }
    
    const avgEngagement = tweetCount > 0 ? totalEngagement / tweetCount : 0
    
    return {
      mentions: tweetCount,
      avgEngagement,
      sentimentScore: Math.min(100, avgEngagement * 2), // Simplified scoring
    }
  } catch (error) {
    console.error('Twitter analysis error:', error)
    return { mentions: 0, avgEngagement: 0, sentimentScore: 0 }
  }
}

module.exports = { analyzeSentiment }

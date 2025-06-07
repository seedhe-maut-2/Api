// index.js for Cloudflare Workers
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const videoUrl = url.searchParams.get('url');

      if (!videoUrl) {
        return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Parse the input URL to determine the domain
      let parsedVideoUrl;
      try {
        parsedVideoUrl = new URL(videoUrl);
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid URL provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const domain = parsedVideoUrl.hostname.replace('www.', '');

      // Supported domains and their handlers
      const handlers = {
        'maut.com': handleMautRequest,
        'tubeninja.net': handleTubeninjaRequest,
        'xhamster.net': handleXhamsterRequest,
        'xhcdn.com': handleDirectLink,
        'ahcdn.com': handleDirectLink,
        // Add more domains as needed
      };

      const handler = handlers[domain] || handleGenericRequest;
      const result = await handler(videoUrl);

      return new Response(JSON.stringify({
        originalUrl: videoUrl,
        availableSources: result
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch video sources', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// Domain-specific handlers
async function handleMautRequest(url) {
  const response = await fetch(url);
  const html = await response.text();
  
  // Simple regex to find video sources
  const mp4Matches = html.match(/https?:\/\/[^\s'"]+\.mp4/g) || [];
  const m3u8Matches = html.match(/https?:\/\/[^\s'"]+\.m3u8/g) || [];
  
  const allMatches = [...mp4Matches, ...m3u8Matches];
  
  return allMatches.map(match => ({
    url: match,
    quality: match.match(/(\d+p)\./)?.[1] || 'unknown'
  }));
}

async function handleTubeninjaRequest(url) {
  const response = await fetch(url);
  const html = await response.text();
  
  // Look for direct video links in the page
  const regex = /<a[^>]+href=["'](https?:\/\/[^"']+\.(mp4|m3u8))["']/gi;
  const matches = [...html.matchAll(regex)];
  
  return matches.map(match => ({
    url: match[1],
    quality: match[1].match(/(\d+p)\./)?.[1] || 'unknown'
  }));
}

function handleDirectLink(url) {
  return [{
    url: url,
    quality: url.match(/(\d+p)\./)?.[1] || 'unknown'
  }];
}

async function handleGenericRequest(url) {
  // If it's already a direct video link
  if (url.match(/\.(mp4|m3u8)$/)) {
    return [{
      url: url,
      quality: url.match(/(\d+p)\./)?.[1] || 'unknown'
    }];
  }
  
  // Otherwise try to fetch the page
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Look for video sources in the HTML
    const sources = [];
    const videoSrcMatches = html.match(/<source[^>]+src=["']([^"']+)["']/gi) || [];
    
    for (const match of videoSrcMatches) {
      const srcMatch = match.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        sources.push({
          url: srcMatch[1],
          quality: srcMatch[1].match(/(\d+p)\./)?.[1] || 'unknown'
        });
      }
    }
    
    return sources;
  } catch (error) {
    return [];
  }
          }

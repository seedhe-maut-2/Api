const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

// Supported domains and their extraction methods
const SUPPORTED_DOMAINS = {
    'maut.com': extractMautLinks,
    'tubeninja.net': extractTubeninjaLinks,
    'xhcdn.com': extractXhcdnLinks,
    'xhamster.com': extractXhamsterLinks,
    // Add more domains as needed
};

// Domain-specific extractors
async function extractMautLinks(url) {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const sources = [];
    $('script').each((i, el) => {
        const scriptContent = $(el).html() || '';
        const regex = /(https?:\/\/[^\s'"]+\.(mp4|m3u8))/g;
        const matches = scriptContent.match(regex);
        if (matches) {
            matches.forEach(match => {
                sources.push({
                    url: match,
                    quality: match.match(/(\d+p)\./)?.[1] || 'unknown'
                });
            });
        }
    });
    return sources;
}

async function extractTubeninjaLinks(url) {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const sources = [];
    $('a[href*=".mp4"], source[src*=".mp4"]').each((i, el) => {
        const src = $(el).attr('href') || $(el).attr('src');
        sources.push({
            url: src,
            quality: src.match(/(\d+p)\./)?.[1] || 'unknown'
        });
    });
    return sources;
}

async function extractXhcdnLinks(url) {
    // Direct link - just return it with quality
    return [{
        url: url,
        quality: url.match(/(\d+p)\./)?.[1] || 'unknown'
    }];
}

async function extractAhcdnLinks(url) {
    // Direct link - just return it with quality
    return [{
        url: url,
        quality: url.match(/(\d+p)\./)?.[1] || 'unknown'
    }];
}

// Main API endpoint
app.get('/api/get-video', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Parse URL to get domain
        let domain;
        try {
            const parsedUrl = new URL(url);
            domain = parsedUrl.hostname.replace('www.', '');
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }

        // Find appropriate extractor
        const extractor = SUPPORTED_DOMAINS[domain] || extractGenericLinks;
        
        const sources = await extractor(url);
        
        if (sources.length === 0) {
            return res.status(404).json({ error: 'No video sources found' });
        }

        res.json({
            originalUrl: url,
            availableSources: sources
        });
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Failed to fetch video sources', details: error.message });
    }
});

// Generic extractor as fallback
async function extractGenericLinks(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        const sources = [];
        
        // Check for direct video tags
        $('video source').each((i, el) => {
            const src = $(el).attr('src');
            if (src && (src.endsWith('.mp4') || src.includes('.m3u8'))) {
                sources.push({
                    url: src,
                    quality: $(el).attr('data-quality') || src.match(/(\d+p)\./)?.[1] || 'unknown'
                });
            }
        });
        
        // Check for iframes that might contain videos
        $('iframe').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('youtube.com') || src.includes('vimeo.com')) {
                sources.push({
                    url: src,
                    quality: 'embedded',
                    type: 'iframe'
                });
            }
        });
        
        return sources;
    } catch (error) {
        // If we can't fetch the page, assume it's a direct video link
        if (url.match(/\.(mp4|m3u8)$/)) {
            return [{
                url: url,
                quality: url.match(/(\d+p)\./)?.[1] || 'unknown'
            }];
        }
        return [];
    }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/get-video?url=YOUR_VIDEO_URL`);
});

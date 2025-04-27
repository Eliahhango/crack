const express = require('express');
const router = express.Router();
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Proxy checker endpoint
router.post('/check', async (req, res) => {
  try {
    const { proxy } = req.body;
    if (!proxy) {
      return res.status(400).json({ error: 'Proxy is required' });
    }

    const [ip, port] = proxy.split(':');
    if (!ip || !port) {
      return res.status(400).json({ error: 'Invalid proxy format' });
    }

    // Test proxy with a request to a reliable service
    const startTime = Date.now();
    const response = await axios.get('https://api.ipify.org?format=json', {
      proxy: {
        host: ip,
        port: parseInt(port),
        protocol: 'http'
      },
      timeout: 10000
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    res.json({
      status: 'active',
      ip: response.data.ip,
      responseTime: `${responseTime}ms`,
      country: await getCountryFromIP(response.data.ip)
    });
  } catch (error) {
    res.json({
      status: 'inactive',
      error: error.message
    });
  }
});

// Proxy generator endpoint
router.post('/generate', async (req, res) => {
  try {
    const { count, country, protocol } = req.body;
    
    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ error: 'Invalid proxy count' });
    }

    const proxies = await generateProxies(count, country, protocol);
    res.json({ proxies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get country from IP
async function getCountryFromIP(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return response.data.country_name;
  } catch (error) {
    return 'Unknown';
  }
}

// Helper function to generate proxies
async function generateProxies(count, country, protocol) {
  const proxies = [];
  const proxySources = [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
    'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt'
  ];

  for (const source of proxySources) {
    if (proxies.length >= count) break;
    
    try {
      const response = await axios.get(source);
      const proxyList = response.data.split('\n')
        .filter(proxy => proxy.trim())
        .map(proxy => proxy.trim());

      for (const proxy of proxyList) {
        if (proxies.length >= count) break;
        
        try {
          const [ip, port] = proxy.split(':');
          const countryInfo = await getCountryFromIP(ip);
          
          if (!country || countryInfo.toLowerCase() === country.toLowerCase()) {
            proxies.push({
              ip,
              port,
              protocol: protocol || 'http',
              country: countryInfo
            });
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      continue;
    }
  }

  return proxies;
}

module.exports = router; 
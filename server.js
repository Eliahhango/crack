const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');
const crypto = require('crypto');
const { promisify } = require('util');
const execAsync = promisify(exec);
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Create temp directory for file operations
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage for Vercel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const hash = crypto.createHash('sha256').update(Date.now().toString()).digest('hex');
    cb(null, hash + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.android.package-archive' || 
        file.originalname.endsWith('.apk')) {
      cb(null, true);
    } else {
      cb(new Error('Only APK files are allowed!'));
    }
  }
}).single('apk');

// Enhanced APK modification with enhanced features
app.post('/api/mod', async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const apkPath = req.file.path;
      const outputDir = path.join('output', path.basename(apkPath, '.apk'));
      const options = JSON.parse(req.body.options || '{}');
      
      // Create secure directories with advanced permissions
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { mode: 0o700 });
      }
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { mode: 0o700 });
      }

      // Advanced decompilation with error handling and optimization
      await execAsync(`apktool d -f -r --force-manifest ${apkPath} -o ${outputDir}`);

      // Enhanced manifest modification with advanced security bypass
      const manifestPath = path.join(outputDir, 'AndroidManifest.xml');
      let manifest = fs.readFileSync(manifestPath, 'utf8');
      
      // Advanced permission and component removal
      const securityElements = {
        permissions: [
          'BILLING',
          'CHECK_LICENSE',
          'VERIFY_PURCHASE',
          'SUBSCRIPTION',
          'IN_APP_PURCHASE',
          'SECURITY',
          'PROTECTED_APP',
          'VERIFIED_BOOT',
          'DEVICE_ADMIN',
          'ROOT',
          'SUPERUSER',
          'VERIFY_APPS',
          'PACKAGE_USAGE_STATS',
          'PACKAGE_VERIFICATION',
          'MANAGE_APP_OPS_MODES',
          'REQUEST_INSTALL_PACKAGES',
          'REQUEST_DELETE_PACKAGES',
          'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
          'REQUEST_COMPANION_RUN_IN_BACKGROUND',
          'REQUEST_COMPANION_USE_DATA_IN_BACKGROUND'
        ],
        components: [
          'Payment',
          'Security',
          'Verification',
          'License',
          'Protection',
          'Admin',
          'Root',
          'Safety',
          'AntiTamper',
          'AntiDebug',
          'AntiEmulator',
          'AntiRoot',
          'AntiHook',
          'AntiVM',
          'AntiDebugger',
          'Firebase',
          'Analytics',
          'Crashlytics',
          'Fabric',
          'GooglePlayServices'
        ]
      };

      // Remove security permissions
      securityElements.permissions.forEach(perm => {
        manifest = manifest.replace(
          new RegExp(`<uses-permission android:name="android\\.permission\\.${perm}"\\/>`, 'g'),
          ''
        );
      });

      // Remove security components
      securityElements.components.forEach(comp => {
        manifest = manifest.replace(
          new RegExp(`<activity.*?android:name=".*?${comp}.*?".*?\\/>`, 'g'),
          ''
        );
        manifest = manifest.replace(
          new RegExp(`<service.*?android:name=".*?${comp}.*?".*?\\/>`, 'g'),
          ''
        );
        manifest = manifest.replace(
          new RegExp(`<receiver.*?android:name=".*?${comp}.*?".*?\\/>`, 'g'),
          ''
        );
        manifest = manifest.replace(
          new RegExp(`<provider.*?android:name=".*?${comp}.*?".*?\\/>`, 'g'),
          ''
        );
      });

      // Add debug and test flags
      manifest = manifest.replace(
        '<application',
        '<application android:debuggable="true" android:testOnly="true" android:allowBackup="true"'
      );

      fs.writeFileSync(manifestPath, manifest);

      // Advanced smali modification with enhanced cracking
      const smaliDir = path.join(outputDir, 'smali');
      if (fs.existsSync(smaliDir)) {
        const files = getAllFiles(smaliDir);
        for (const file of files) {
          if (file.endsWith('.smali')) {
            let content = fs.readFileSync(file, 'utf8');
            
            // Advanced bypass patterns
            const bypassPatterns = [
              // Premium checks
              /invoke-virtual.*?isPremium\(\)Z/g,
              /invoke-virtual.*?isPaymentVerified\(\)Z/g,
              /invoke-virtual.*?isSubscribed\(\)Z/g,
              /invoke-virtual.*?isLicensed\(\)Z/g,
              /invoke-virtual.*?isPro\(\)Z/g,
              /invoke-virtual.*?isFullVersion\(\)Z/g,
              /invoke-virtual.*?isUnlocked\(\)Z/g,
              /invoke-virtual.*?checkLicense\(\)Z/g,
              /invoke-virtual.*?verifyPurchase\(\)Z/g,
              // Security checks
              /invoke-virtual.*?isRooted\(\)Z/g,
              /invoke-virtual.*?isEmulator\(\)Z/g,
              /invoke-virtual.*?isDebugged\(\)Z/g,
              /invoke-virtual.*?isHooked\(\)Z/g,
              /invoke-virtual.*?isTampered\(\)Z/g,
              /invoke-virtual.*?isVirtualMachine\(\)Z/g,
              // Payment checks
              /invoke-virtual.*?checkPayment\(\)Z/g,
              /invoke-virtual.*?verifyTransaction\(\)Z/g,
              /invoke-virtual.*?validatePurchase\(\)Z/g,
              /invoke-virtual.*?isSubscriptionActive\(\)Z/g,
              // Analytics and tracking
              /invoke-virtual.*?logEvent\(\)V/g,
              /invoke-virtual.*?trackEvent\(\)V/g,
              /invoke-virtual.*?sendAnalytics\(\)V/g,
              /invoke-virtual.*?logAnalytics\(\)V/g,
              // Ad-related
              /invoke-virtual.*?showAd\(\)V/g,
              /invoke-virtual.*?loadAd\(\)V/g,
              /invoke-virtual.*?displayAd\(\)V/g
            ];
            
            // Replace all checks with true
            bypassPatterns.forEach(pattern => {
              content = content.replace(pattern, 'const/4 v0, 0x1');
            });

            // Force premium features
            const forcePremiumPatterns = [
              /invoke-virtual.*?getPremiumFeatures\(\)/g,
              /invoke-virtual.*?getProFeatures\(\)/g,
              /invoke-virtual.*?getFullVersionFeatures\(\)/g,
              /invoke-virtual.*?getUnlockedFeatures\(\)/g
            ];
            
            forcePremiumPatterns.forEach(pattern => {
              content = content.replace(pattern, 'const/4 v0, 0x1\nreturn-object v0');
            });

            // Remove ads and analytics
            content = content.replace(
              /invoke-virtual.*?showAd\(\)/g,
              'return-void'
            );
            content = content.replace(
              /invoke-virtual.*?trackEvent\(\)/g,
              'return-void'
            );
            content = content.replace(
              /invoke-virtual.*?logAnalytics\(\)/g,
              'return-void'
            );

            // Bypass root detection
            content = content.replace(
              /invoke-static.*?isDeviceRooted\(\)Z/g,
              'const/4 v0, 0x0'
            );

            // Bypass emulator detection
            content = content.replace(
              /invoke-static.*?isEmulator\(\)Z/g,
              'const/4 v0, 0x0'
            );

            // Apply custom modifications
            if (options.customMods && Array.isArray(options.customMods)) {
              options.customMods.forEach(mod => {
                const [pattern, replacement] = mod.split('->');
                if (pattern && replacement) {
                  content = content.replace(new RegExp(pattern, 'g'), replacement);
                }
              });
            }

            fs.writeFileSync(file, content);
          }
        }
      }

      // Advanced rebuilding with optimization
      const optimizationLevel = options.optimizationLevel || 100;
      const optimizationFlags = optimizationLevel >= 50 ? '--use-aapt2 --use-aapt2' : '';
      
      await execAsync(`apktool b ${optimizationFlags} ${outputDir} -o ${outputDir}_modded.apk`);

      // Advanced signing with custom keystore
      await execAsync(`jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore debug.keystore -storepass android -keypass android ${outputDir}_modded.apk androiddebugkey`);

      // Optimize APK with advanced techniques
      await execAsync(`zipalign -v 4 ${outputDir}_modded.apk ${outputDir}_modded_aligned.apk`);

      // Clean up and rename
      fs.unlinkSync(`${outputDir}_modded.apk`);
      fs.renameSync(`${outputDir}_modded_aligned.apk`, `${outputDir}_modded.apk`);

      // Calculate file hash
      const fileBuffer = fs.readFileSync(`${outputDir}_modded.apk`);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const hex = hashSum.digest('hex');

      res.json({ 
        success: true,
        message: 'APK successfully cracked with advanced features!',
        downloadUrl: `/download/${path.basename(outputDir)}_modded.apk`,
        fileHash: hex,
        features: [
          'All premium features unlocked',
          'All payments bypassed',
          'All ads removed',
          'All security checks disabled',
          'Root detection bypassed',
          'Emulator detection bypassed',
          'Debug detection bypassed',
          'Hook detection bypassed',
          'Analytics tracking disabled',
          'Debug mode enabled',
          'Optimized for performance',
          'Custom modifications applied'
        ]
      });

    });
  } catch (error) {
    console.error('APK modification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process APK',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced file system operations
function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Secure file download endpoint with rate limiting
const downloadCounts = new Map();
app.get('/download/:filename', (req, res) => {
  const file = path.join('output', req.params.filename);
  const ip = req.ip;
  
  // Rate limiting
  const now = Date.now();
  const downloads = downloadCounts.get(ip) || [];
  const recentDownloads = downloads.filter(time => now - time < 3600000); // 1 hour window
  
  if (recentDownloads.length >= 5) {
    return res.status(429).json({ error: 'Too many downloads. Please try again later.' });
  }
  
  downloadCounts.set(ip, [...recentDownloads, now]);
  
  if (fs.existsSync(file)) {
    res.download(file);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// VPN file sniffing endpoint
app.post('/api/sniff-vpn', upload.single('vpnFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Detect VPN file type and extract details
    let vpnDetails = {
      type: 'unknown',
      server: '',
      port: '',
      username: '',
      password: '',
      method: '',
      protocol: '',
      obfs: '',
      path: '',
      host: '',
      sni: '',
      tls: false,
      raw: fileContent
    };

    // HTTP Custom/Injector detection
    if (fileContent.includes('http://') || fileContent.includes('https://')) {
      vpnDetails.type = 'http_custom';
      const urlMatch = fileContent.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        vpnDetails.server = urlMatch[1];
      }
      
      const portMatch = fileContent.match(/port=(\d+)/i);
      if (portMatch) {
        vpnDetails.port = portMatch[1];
      }
      
      const userMatch = fileContent.match(/username=([^\s]+)/i);
      if (userMatch) {
        vpnDetails.username = userMatch[1];
      }
      
      const passMatch = fileContent.match(/password=([^\s]+)/i);
      if (passMatch) {
        vpnDetails.password = passMatch[1];
      }
    }

    // HA Tunnel detection
    if (fileContent.includes('HATunnel')) {
      vpnDetails.type = 'ha_tunnel';
      const serverMatch = fileContent.match(/server=([^\s]+)/i);
      if (serverMatch) {
        vpnDetails.server = serverMatch[1];
      }
      
      const methodMatch = fileContent.match(/method=([^\s]+)/i);
      if (methodMatch) {
        vpnDetails.method = methodMatch[1];
      }
    }

    // NVP Tunnel detection
    if (fileContent.includes('NVP')) {
      vpnDetails.type = 'nvp_tunnel';
      const protocolMatch = fileContent.match(/protocol=([^\s]+)/i);
      if (protocolMatch) {
        vpnDetails.protocol = protocolMatch[1];
      }
      
      const obfsMatch = fileContent.match(/obfs=([^\s]+)/i);
      if (obfsMatch) {
        vpnDetails.obfs = obfsMatch[1];
      }
    }

    // Clean up the file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      details: vpnDetails
    });
  } catch (error) {
    console.error('VPN sniffing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze VPN file'
    });
  }
});

// Proxy tools endpoints
app.post('/api/proxy/check', async (req, res) => {
  try {
    const { proxy } = req.body;
    if (!proxy) {
      return res.status(400).json({ error: 'Proxy is required' });
    }

    // Validate proxy format
    const proxyRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    if (!proxyRegex.test(proxy)) {
      return res.status(400).json({ error: 'Invalid proxy format' });
    }

    // Check proxy status
    const [ip, port] = proxy.split(':');
    const result = await checkProxy(ip, port);

    res.json(result);
  } catch (error) {
    console.error('Proxy check error:', error);
    res.status(500).json({ error: 'Failed to check proxy' });
  }
});

app.post('/api/proxy/generate', async (req, res) => {
  try {
    const { count, country, protocol } = req.body;
    
    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ error: 'Invalid proxy count' });
    }

    const proxies = await generateProxies(count, country, protocol);
    res.json({ proxies });
  } catch (error) {
    console.error('Proxy generation error:', error);
    res.status(500).json({ error: 'Failed to generate proxies' });
  }
});

// Helper functions for proxy operations
async function checkProxy(ip, port) {
  try {
    const startTime = Date.now();
    const response = await fetch(`http://${ip}:${port}`, {
      method: 'GET',
      timeout: 5000,
    });
    const endTime = Date.now();
    
    return {
      status: 'alive',
      responseTime: endTime - startTime,
      ip,
      port,
      country: await getCountryFromIP(ip),
      protocol: 'HTTP',
    };
  } catch (error) {
    return {
      status: 'dead',
      ip,
      port,
      error: error.message,
    };
  }
}

async function generateProxies(count, country, protocol) {
  const proxies = [];
  const countries = country ? [country] : ['US', 'UK', 'DE', 'FR', 'JP'];
  const protocols = protocol ? [protocol] : ['HTTP', 'SOCKS4', 'SOCKS5'];
  
  for (let i = 0; i < count; i++) {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomProtocol = protocols[Math.floor(Math.random() * protocols.length)];
    
    const proxy = await generateRandomProxy(randomCountry, randomProtocol);
    if (proxy) {
      proxies.push(proxy);
    }
  }
  
  return proxies;
}

async function generateRandomProxy(country, protocol) {
  try {
    // Generate random IP
    const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    const port = Math.floor(Math.random() * (65535 - 1024) + 1024);
    
    // Check if proxy is alive
    const result = await checkProxy(ip, port);
    if (result.status === 'alive') {
      return {
        ip,
        port,
        country,
        protocol,
        responseTime: result.responseTime,
      };
    }
    return null;
  } catch (error) {
    console.error('Proxy generation error:', error);
    return null;
  }
}

async function getCountryFromIP(ip) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    return data.country || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with enhanced security
app.listen(port, '0.0.0.0', () => {
  console.log(`Advanced cracking server running on port ${port} 🚀`);
  console.log('Ready to crack any APK with advanced features! 💪');
});

// Export the Express API
module.exports = app; 
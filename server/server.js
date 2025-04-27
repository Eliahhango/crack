const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const proxyRouter = require('./proxy');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const hash = crypto.createHash('sha256').update(Date.now().toString()).digest('hex');
    cb(null, `${hash}.apk`);
  }
});

const upload = multer({ storage });

// Routes
app.use('/api/proxy', proxyRouter);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
}); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'chatFile') {
      uploadPath = path.join(uploadsDir, 'chat-files');
    } else if (file.fieldname === 'housingImage') {
      uploadPath = path.join(uploadsDir, 'housing-images');
    } else {
      uploadPath = path.join(uploadsDir, 'general');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, extension);
    
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = {
    'chatFile': ['.txt', '.csv'],
    'housingImage': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'document': ['.pdf', '.doc', '.docx', '.txt']
  };
  
  const fieldName = file.fieldname;
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes[fieldName] && allowedTypes[fieldName].includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${fieldName}. Allowed types: ${allowedTypes[fieldName]?.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Specific upload configurations
const chatFileUpload = upload.single('chatFile');
const housingImageUpload = upload.array('housingImages', 5);
const documentUpload = upload.single('document');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Maximum is 5 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: error.message
    });
  }
  
  console.error('Upload error:', error);
  res.status(500).json({
    error: 'File upload failed.'
  });
};

// Process uploaded chat file
const processChatFile = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded.'
    });
  }
  
  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Add file content to request for processing
    req.fileContent = fileContent;
    req.fileInfo = {
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename
    };
    
    next();
  } catch (error) {
    console.error('Error processing chat file:', error);
    res.status(500).json({
      error: 'Failed to process uploaded file.'
    });
  }
};

// Clean up uploaded files (for testing/development)
const cleanupUploads = () => {
  const cleanupDir = (dirPath) => {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          cleanupUploads(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
    }
  };
  
  cleanupDir(uploadsDir);
};

module.exports = {
  upload,
  chatFileUpload,
  housingImageUpload,
  documentUpload,
  handleUploadError,
  processChatFile,
  cleanupUploads
}; 
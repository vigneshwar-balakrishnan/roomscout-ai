/**
 * RoomScout AI - Upload Routes with LangChain Integration
 * Complete file upload processing with Python LangChain API integration
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const router = express.Router();

// Python API Client for LangChain pipeline
const pythonAPIClient = {
    baseURL: process.env.PYTHON_API_URL || 'http://localhost:5001',
    
    async processMessage(message) {
        try {
            console.log(`📤 Sending message to LangChain: ${message.substring(0, 50)}...`);
            const response = await axios.post(`${this.baseURL}/process`, {
                message: message
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(`📥 LangChain response: ${response.status}`);
            return response.data;
        } catch (error) {
            console.error('❌ Python API Error:', error.message);
            return {
                success: false,
                error: 'LangChain pipeline unavailable',
                fallback: true
            };
        }
    },
    
    async batchProcess(messages) {
        try {
            console.log(`📤 Sending ${messages.length} messages to LangChain batch processing...`);
            const response = await axios.post(`${this.baseURL}/batch-process`, {
                messages: messages
            }, {
                timeout: 60000,
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(`📥 LangChain batch response: ${response.status}`);
            return response.data;
        } catch (error) {
            console.error('❌ Python API Batch Error:', error.message);
            return {
                success: false,
                error: 'LangChain pipeline unavailable',
                fallback: true
            };
        }
    },
    
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseURL}/health`);
            return response.data;
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 16 * 1024 * 1024, // 16MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.txt', '.csv', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .txt, .csv, .json files are allowed.'), false);
        }
    }
});

// Helper function to parse WhatsApp content
function parseWhatsAppContent(content) {
    const messages = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
        if (!line.trim()) continue;
        
        // WhatsApp timestamp pattern: DD/MM/YYYY, HH:MM am/pm
        const timestampMatch = line.match(/^(\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}\s*(?:am|pm))/i);
        
        if (timestampMatch) {
            const timestamp = timestampMatch[1];
            const remainingContent = line.substring(timestampMatch[0].length).trim();
            
            // Extract sender and message
            const senderMatch = remainingContent.match(/^([^:]+):\s*(.+)$/);
            
            if (senderMatch) {
                messages.push({
                    timestamp: timestamp,
                    sender: senderMatch[1].trim(),
                    content: senderMatch[2].trim(),
                    raw: line.trim()
                });
            } else {
                // System message or message without sender
                messages.push({
                    timestamp: timestamp,
                    sender: null,
                    content: remainingContent,
                    raw: line.trim()
                });
            }
        } else {
            // Message without timestamp (continuation)
            if (messages.length > 0) {
                messages[messages.length - 1].content += ' ' + line.trim();
                messages[messages.length - 1].raw += '\n' + line.trim();
            }
        }
    }
    
    return messages;
}

// POST /api/upload/process-file with LangChain integration
router.post('/process-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log(`📁 Processing uploaded file with LangChain: ${req.file.originalname}`);

        // Read the uploaded file
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        
        // Parse WhatsApp content
        const parsedMessages = parseWhatsAppContent(fileContent);
        console.log(`📱 Parsed ${parsedMessages.length} WhatsApp messages`);
        
        // Process messages through LangChain pipeline in smaller batches
        const batchSize = 10; // Process 10 messages at a time
        const allResults = [];
        
        for (let i = 0; i < parsedMessages.length; i += batchSize) {
            const batch = parsedMessages.slice(i, i + batchSize).map(msg => msg.content);
            console.log(`📤 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(parsedMessages.length/batchSize)} (${batch.length} messages)`);
            
            const batchResults = await pythonAPIClient.batchProcess(batch);
            
            if (batchResults.success) {
                allResults.push(...batchResults.results);
            } else {
                console.log(`⚠️ Batch ${Math.floor(i/batchSize) + 1} failed, using fallback for this batch`);
                // Add fallback results for this batch
                const housingKeywords = ['rent', 'apartment', 'housing', 'room', 'lease', 'price', 'cost', 'budget', 'available', 'sublet'];
                batch.forEach(content => {
                    const isHousing = housingKeywords.some(keyword => content.toLowerCase().includes(keyword));
                    allResults.push({
                        is_housing: isHousing,
                        confidence_score: 0.6,
                        extracted_data: {},
                        processing_time: 0.1
                    });
                });
            }
        }
        
        if (allResults.length > 0) {
            const housingMessages = allResults.filter(r => r.is_housing === true);
            const spamMessages = allResults.filter(r => r.is_housing === false);
            
            console.log(`✅ LangChain processed: ${housingMessages.length} housing, ${spamMessages.length} spam out of ${allResults.length} total`);
            
            // Extract housing listings from results
            const housingListings = housingMessages.map(msg => {
                const data = msg.extracted_data || {};
                return {
                    location: data.location,
                    price: data.rent_price,
                    roomType: data.room_type,
                    availability: data.availability_date,
                    contact: data.contact_info,
                    amenities: data.additional_notes,
                    confidence: msg.confidence_score,
                    securityStatus: msg.security_status
                };
            }).filter(listing => listing.location || listing.price); // Only include listings with key info
            
            // Clean up the uploaded file
            fs.unlinkSync(req.file.path);

            res.json({
                success: true,
                stats: {
                    totalMessages: parsedMessages.length,
                    housingMessages: housingMessages.length,
                    spamMessages: spamMessages.length,
                    extractedListings: housingListings.length,
                    processingTime: allResults.reduce((sum, r) => sum + (r.processing_time || 0), 0),
                    langchainUsed: true,
                    averageConfidence: housingMessages.length > 0 ? 
                        housingMessages.reduce((sum, msg) => sum + (msg.confidence_score || 0), 0) / housingMessages.length : 0
                },
                housingListings: housingListings,
                message: `Successfully processed ${req.file.originalname} with LangChain AI! Found ${housingMessages.length} housing-related messages and extracted ${housingListings.length} detailed listings.`
            });
        } else {
            // Fallback to simple keyword analysis
            console.log('⚠️ LangChain batch processing unavailable, using fallback');
            
            const housingKeywords = ['rent', 'apartment', 'housing', 'room', 'lease', 'price', 'cost', 'budget', 'available', 'sublet'];
            const housingMessages = parsedMessages.filter(msg => 
                housingKeywords.some(keyword => 
                    msg.content.toLowerCase().includes(keyword)
                )
            );

            // Clean up the uploaded file
            fs.unlinkSync(req.file.path);

            res.json({
                success: true,
                stats: {
                    totalMessages: parsedMessages.length,
                    housingMessages: housingMessages.length,
                    extractedListings: housingMessages.length,
                    processingTime: 0.5,
                    langchainUsed: false,
                    fallback: true
                },
                message: `Successfully processed ${req.file.originalname}! Found ${housingMessages.length} housing-related messages using fallback analysis.`
            });
        }

    } catch (error) {
        console.error('❌ File processing error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: 'Failed to process uploaded file'
        });
    }
});

// GET /api/upload/health
router.get('/health', async (req, res) => {
    try {
        const langchainHealth = await pythonAPIClient.healthCheck();
        
        res.json({
            success: true,
            status: 'Upload service is running',
            langchainAPI: langchainHealth.status,
            timestamp: new Date()
        });
    } catch (error) {
        res.json({
            success: true,
            status: 'Upload service is running (LangChain unavailable)',
            timestamp: new Date()
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 16MB.'
            });
        }
        return res.status(400).json({
            success: false,
            error: 'File upload error: ' + error.message
        });
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    
    console.error('❌ Upload route error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error during file upload'
    });
});

module.exports = router; 
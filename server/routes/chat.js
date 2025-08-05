const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Test route to debug
router.get('/test', (req, res) => {
    res.json({ message: 'Chat routes working' });
});

// Simple health check
router.get('/health', (req, res) => {
    res.json({ status: 'Chat API is running' });
});

// Enhanced send message endpoint with LangChain pipeline
router.post('/send-message', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log(`🤖 Processing message with LangChain: ${message.substring(0, 50)}...`);
        
        // Use LangChain pipeline for processing
        const langchainResult = await pythonAPIClient.processMessage(message);
        
        if (langchainResult.success) {
            // LangChain pipeline worked
            const result = langchainResult.result;
            console.log(`✅ LangChain classification: ${result.is_housing}, confidence: ${result.confidence_score}`);
            
            // Build response based on LangChain results
            let responseContent = '';
            
            if (result.is_housing === true) {
                const extractedData = result.extracted_data || {};
                responseContent = `I found housing information in your message! `;
                
                if (extractedData.location) responseContent += `Location: ${extractedData.location}. `;
                if (extractedData.rent_price) responseContent += `Price: ${extractedData.rent_price}. `;
                if (extractedData.room_type) responseContent += `Type: ${extractedData.room_type}. `;
                if (extractedData.availability_date) responseContent += `Available: ${extractedData.availability_date}. `;
                if (extractedData.contact_info) responseContent += `Contact: ${extractedData.contact_info}. `;
                
                if (!extractedData.location && !extractedData.rent_price) {
                    responseContent += `This appears to be a housing-related message. I can help you find housing options in the Boston area.`;
                }
            } else if (result.is_housing === false) {
                responseContent = `I detected this message as spam or irrelevant content. Please provide housing-related information.`;
            } else {
                responseContent = `This doesn't appear to be housing-related. I can help you with housing questions about Boston neighborhoods, rental prices, or roommate searches.`;
            }
            
            res.json({
                success: true,
                result: {
                    content: responseContent,
                    housingResults: result.is_housing === true ? [result] : [],
                    metadata: {
                        confidence: result.confidence_score || 0.8,
                        processingTime: result.processing_time || 0.5,
                        queryType: result.is_housing === true ? 'housing' : 'general',
                        langchainUsed: true,
                        classification: result.is_housing === true ? 'HOUSING' : 'GENERAL',
                        extractionMethod: result.extraction_method,
                        securityStatus: result.security_status
                    },
                    sessionId: `langchain_${Date.now()}`
                }
            });
        } else {
            // Fallback to simple keyword matching if LangChain is unavailable
            console.log('⚠️ LangChain pipeline unavailable, using fallback');
            
            const housingKeywords = ['rent', 'apartment', 'housing', 'room', 'lease', 'price', 'cost', 'budget', 'available', 'sublet'];
            const isHousingQuery = housingKeywords.some(keyword => 
                message.toLowerCase().includes(keyword)
            );
            
            let responseContent = `I received your message: "${message}". This is a fallback response.`;
            
            if (isHousingQuery) {
                responseContent = `I understand you're asking about housing! "${message}" - I can help you find housing options in the Boston area. Try asking about specific neighborhoods like Back Bay, Mission Hill, or Fenway.`;
            }
            
            res.json({
                success: true,
                result: {
                    content: responseContent,
                    housingResults: [],
                    metadata: {
                        confidence: 0.6,
                        processingTime: 0.1,
                        queryType: isHousingQuery ? 'housing' : 'general',
                        langchainUsed: false,
                        fallback: true
                    },
                    sessionId: `fallback_${Date.now()}`
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Chat message error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});

// Enhanced file upload endpoint with LangChain pipeline
router.post('/upload-file', upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded.'
            });
        }
        
        const filePath = file.path;
        const fileName = file.filename;
        
        console.log(`📁 Processing file with LangChain: ${fileName}`);
        
        // Read the uploaded file content
        const fileContent = fs.readFileSync(filePath, 'utf8');
        fs.unlinkSync(filePath); // Clean up the uploaded file
        
        // Parse WhatsApp content
        const parsedMessages = parseWhatsAppContent(fileContent);
        console.log(`📱 Parsed ${parsedMessages.length} WhatsApp messages`);
        
        // Process messages through LangChain pipeline in smaller batches
        const batchSize = 5; // Process 5 messages at a time
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
                    confidence: msg.confidence_score
                };
            }).filter(listing => listing.location || listing.price); // Only include listings with key info
            
            res.json({
                success: true,
                result: {
                    content: `Successfully processed ${file.originalname} with LangChain AI! Found ${housingMessages.length} housing-related messages out of ${parsedMessages.length} total messages. ${housingListings.length} listings were extracted with detailed information.`,
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
                    sessionId: `langchain_upload_${Date.now()}`
                }
            });
        } else {
            // Fallback processing
            console.log('⚠️ LangChain batch processing unavailable, using fallback');
            
            const housingKeywords = ['rent', 'apartment', 'housing', 'room', 'lease', 'price', 'cost', 'budget', 'available', 'sublet'];
            const housingMessages = parsedMessages.filter(msg => 
                housingKeywords.some(keyword => 
                    msg.content.toLowerCase().includes(keyword)
                )
            );
            
            res.json({
                success: true,
                result: {
                    content: `I received your file: "${file.originalname}". This is a fallback response for file upload.`,
                    stats: {
                        housingMessages: housingMessages.length,
                        extractedListings: housingMessages.length,
                        processingTime: 0.1,
                        langchainUsed: false,
                        fallback: true
                    },
                    sessionId: `fallback_upload_${Date.now()}`
                }
            });
        }
        
    } catch (error) {
        console.error('❌ File upload error:', error);
        
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

// Helper function to parse WhatsApp content
function parseWhatsAppContent(content) {
    if (!content || typeof content !== 'string') {
        console.warn('⚠️ Invalid content provided to parseWhatsAppContent:', content);
        return [];
    }
    
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

module.exports = { router };

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
    
    console.error('❌ Chat route error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error during file upload'
    });
}); 
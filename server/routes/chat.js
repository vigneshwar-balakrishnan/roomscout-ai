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
                timeout: 300000,
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

// ADD THIS NEW ENDPOINT - Pagination for housing search results
router.post('/housing-pagination', async (req, res) => {
    try {
        const { searchCriteria, page, limit = 3 } = req.body;
        
        if (!searchCriteria) {
            return res.status(400).json({ 
                success: false, 
                error: 'Search criteria is required' 
            });
        }

        // Build query parameters for housing search
        const params = {
            limit: parseInt(limit),
            page: parseInt(page) || 1,
            status: 'active'
        };

        // Handle budget criteria
        if (searchCriteria.budget) {
            if (searchCriteria.budget.min) params.priceMin = searchCriteria.budget.min;
            if (searchCriteria.budget.max) params.priceMax = searchCriteria.budget.max;
        }

        // Handle location criteria
        if (searchCriteria.location && searchCriteria.location.neighborhoods) {
            const searchTerms = searchCriteria.location.neighborhoods;
            if (Array.isArray(searchTerms)) {
                params.search = searchTerms.join(' ');
            } else {
                params.search = String(searchTerms);
            }
        }

        // Handle room type criteria
        if (searchCriteria.room_type) {
            if (searchCriteria.room_type.bedroom_count) {
                params.bedrooms = searchCriteria.room_type.bedroom_count;
            }
            if (searchCriteria.room_type.property_types) {
                params.propertyType = searchCriteria.room_type.property_types;
            }
        }

        // Handle amenities
        if (searchCriteria.amenities && searchCriteria.amenities.length > 0) {
            params.amenities = searchCriteria.amenities;
        }

        // Make request to housing API
        const housingResponse = await axios.get(`${process.env.BASE_URL || 'http://localhost:5000'}/api/housing`, {
            params,
            timeout: 30000
        });

        if (housingResponse.status === 200) {
            const data = housingResponse.data;
            
            // Generate response text for the current page
            const responseText = `🏠 **Housing Search Results - Page ${data.page} of ${data.totalPages}**\n\n`;
            
            // Format listings
            let formattedListings = '';
            data.listings.forEach((listing, index) => {
                formattedListings += `**${index + 1}. ${listing.title || 'Housing Listing'}**\n`;
                formattedListings += `   💰 $${listing.price || 0}/month\n`;
                formattedListings += `   📍 ${listing.location?.neighborhood || 'Boston'}\n`;
                formattedListings += `   🏘️ ${listing.propertyType || 'apartment'} • ${listing.bedrooms || 1}BR • ${listing.bathrooms || 1}BA\n`;
                if (listing.amenities && listing.amenities.length > 0) {
                    const amenities = listing.amenities.slice(0, 2);
                    formattedListings += `   ✨ ${amenities.join(', ')}\n`;
                }
                formattedListings += '\n';
            });

            // Add pagination controls
            let paginationText = '📱 **Navigation:**\n';
            if (data.page > 1) {
                paginationText += `   ⬅️ **Previous Page** (Page ${data.page - 1})\n`;
            }
            if (data.page < data.totalPages) {
                paginationText += `   ➡️ **Next Page** (Page ${data.page + 1})\n`;
            }

            const fullResponse = responseText + formattedListings + paginationText + 
                `\n💡 **Showing ${data.listings.length} of ${data.total} listings**\n` +
                'Use the navigation above or ask me to show specific pages!';

            // Generate suggestions based on current page
            const suggestions = [];
            if (data.page > 1) {
                suggestions.push('Show previous page');
            }
            if (data.page < data.totalPages) {
                suggestions.push('Show next page');
            }
            if (data.totalPages > 1) {
                suggestions.push(`Go to page ${Math.min(data.page + 1, data.totalPages)}`);
            }

            res.json({
                success: true,
                response: fullResponse,
                type: 'housing_search_results',
                data: {
                    listings: data.listings,
                    count: data.listings.length,
                    total: data.total,
                    page: data.page,
                    totalPages: data.totalPages,
                    hasNextPage: data.page < data.totalPages,
                    hasPrevPage: data.page > 1,
                    search_criteria: searchCriteria
                },
                suggestions: suggestions,
                ai_generated: false
            });

        } else {
            res.status(housingResponse.status).json({
                success: false,
                error: 'Failed to fetch housing listings'
            });
        }

    } catch (error) {
        console.error('Error in housing pagination:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during pagination'
        });
    }
});

// ADD THIS NEW ENDPOINT - Chat query for conversational responses
router.post('/chat-query', async (req, res) => {
    try {
        const { message, context = '', user_id } = req.body;
        
        console.log('🤖 Chat query received:', message.substring(0, 50) + '...');
        
        if (!message?.trim()) {
            return res.status(400).json({
                response: "I didn't receive a message. Please try again.",
                type: 'error',
                suggestions: ['Ask about housing', 'Upload WhatsApp file', 'Get neighborhood info']
            });
        }

        // Try to get response from Python API first
        try {
            const pythonResponse = await axios.post(`${pythonAPIClient.baseURL}/chat-query`, {
                message: message.trim(),
                context: context,
                user_id: user_id
            }, {
                timeout: 60000, // Increased from 30000 to 60000 (60 seconds)
                headers: { 'Content-Type': 'application/json' }
            });

            const result = pythonResponse.data;
            console.log('✅ Python API chat response received');
            
            // Return structured response that matches frontend expectations
            res.json({
                response: result.response,
                type: result.type || 'conversation',
                data: result.data || null,
                suggestions: result.suggestions || [],
                ai_generated: result.ai_generated || false,  // Add this line
                timestamp: new Date().toISOString()
            });

        } catch (pythonError) {
            console.log('⚠️ Python API unavailable, using Express fallback');
            
            // Fallback to Express-based response
            const fallbackResponse = await generateFallbackChatResponse(message, context);
            res.json(fallbackResponse);
        }

    } catch (error) {
        console.error('❌ Chat query error:', error);
        res.status(500).json({
            response: "I'm having trouble right now. Please try asking about NEU housing options or upload a WhatsApp file.",
            type: 'error',
            suggestions: ['Ask about Mission Hill', 'Upload housing file', 'Get budget tips'],
            error: error.message
        });
    }
});

// ADD THIS HELPER FUNCTION - Fallback chat responses when Python API is down
async function generateFallbackChatResponse(message, context) {
    const messageLower = message.toLowerCase();
    
    // Housing-related responses
    if (messageLower.includes('housing') || messageLower.includes('apartment') || messageLower.includes('room')) {
        try {
            const Housing = require('../models/Housing');
            const listings = await Housing.find({ status: 'active' })
                .limit(3)
                .select('title price location propertyType bedrooms')
                .sort({ createdAt: -1 })
                .lean();

            let response = `🏠 I can help you find housing! Here are some current listings:\n\n`;
            
            if (listings.length > 0) {
                listings.forEach((listing, index) => {
                    response += `${index + 1}. **${listing.title}**\n`;
                    response += `   💰 $${listing.price}/month\n`;
                    response += `   📍 ${listing.location?.neighborhood || 'Boston'}\n`;
                    response += `   🏠 ${listing.propertyType} • ${listing.bedrooms}BR\n\n`;
                });
            } else {
                response += `I don't have current listings in the database, but I can help you search for housing in Boston neighborhoods like Mission Hill, Back Bay, or Fenway.`;
            }

            return {
                response: response,
                type: 'housing_search',
                data: { listings: listings },
                suggestions: ['Show more listings', 'Search Mission Hill', 'Find roommates']
            };
        } catch (error) {
            console.error('Database error in fallback:', error);
        }
    }
    
    // Neighborhood queries
    else if (messageLower.includes('mission hill') || messageLower.includes('back bay') || messageLower.includes('fenway')) {
        const neighborhoods = {
            'mission hill': {
                info: 'Mission Hill is the closest neighborhood to NEU campus, about a 10-minute walk. Popular with students, rent ranges from $600-1200 for shared spaces.',
                pros: ['Walking distance to NEU', 'Student-friendly', 'Affordable options'],
                cons: ['Can be noisy', 'Limited parking']
            },
            'back bay': {
                info: 'Back Bay is upscale with Victorian architecture. Great restaurants and shopping, but more expensive. Rent typically $1200-2500.',
                pros: ['Beautiful architecture', 'Great dining', 'T accessibility'],
                cons: ['More expensive', 'Tourist area']
            },
            'fenway': {
                info: 'Home to Fenway Park, vibrant nightlife and good T access. Mix of students and young professionals. Rent $800-1800.',
                pros: ['Vibrant area', 'Good transportation', 'Mix of housing types'],
                cons: ['Game day crowds', 'Can be busy']
            }
        };

        const neighborhood = Object.keys(neighborhoods).find(n => messageLower.includes(n));
        if (neighborhood) {
            const info = neighborhoods[neighborhood];
            let response = `📍 **${neighborhood.charAt(0).toUpperCase() + neighborhood.slice(1)} Neighborhood Info:**\n\n`;
            response += `${info.info}\n\n`;
            response += `✅ **Pros:** ${info.pros.join(', ')}\n`;
            response += `⚠️ **Considerations:** ${info.cons.join(', ')}`;

            return {
                response: response,
                type: 'neighborhood_info',
                suggestions: ['Find listings here', 'Compare neighborhoods', 'Get roommate tips']
            };
        }
    }
    
    // Budget queries
    else if (messageLower.includes('budget') || messageLower.includes('cheap') || messageLower.includes('affordable')) {
        return {
            response: `💰 **Budget Housing Tips for NEU Students:**\n\n• **Shared rooms:** $500-800/month\n• **Studio/1BR:** $1200-1800/month\n• **Best budget areas:** Mission Hill, Roxbury, JP\n• **Money-saving tips:** Look for utilities included, consider fall/spring availability\n\nMission Hill and Roxbury tend to be the most affordable options near NEU!`,
            type: 'budget_advice',
            suggestions: ['Find budget listings', 'Search Mission Hill', 'Roommate matching']
        };
    }
    
    // Roommate queries
    else if (messageLower.includes('roommate') || messageLower.includes('roommates')) {
        return {
            response: `👥 **Finding Good Roommates:**\n\n• Use NEU housing Facebook groups\n• Ask about lifestyle preferences (study habits, cleanliness, guests)\n• Meet in person before committing\n• Discuss financial responsibilities upfront\n• Check references if possible\n\n**Red flags:** Unwilling to video chat, no references, unrealistic expectations about rent/location.`,
            type: 'roommate_advice',
            suggestions: ['Join housing groups', 'Create roommate profile', 'Get lease advice']
        };
    }
    
    // General greeting or help
    else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('help')) {
        return {
            response: `👋 Hi! I'm RoomScout AI, your housing assistant for NEU students. I can help you:\n\n🏠 Find apartment listings\n📍 Learn about Boston neighborhoods\n💰 Get budget advice\n👥 Find roommates\n📱 Analyze WhatsApp housing messages\n\nWhat would you like help with today?`,
            type: 'greeting',
            suggestions: ['Find housing near NEU', 'Compare neighborhoods', 'Upload WhatsApp file']
        };
    }
    
    // Default response
    else {
        return {
            response: `I understand you're asking: "${message}"\n\nI'm RoomScout AI, specializing in NEU student housing. I can help you find apartments, analyze housing messages, or provide neighborhood information. What housing question can I help with?`,
            type: 'general',
            suggestions: ['Find apartments', 'Neighborhood info', 'Budget advice']
        };
    }
}

// MODIFY YOUR EXISTING /send-message endpoint to be simpler
router.post('/send-message', async (req, res) => {
    try {
        const { message, context = '' } = req.body;
        
        // Just redirect to chat-query for consistency
        const chatResponse = await axios.post(`${req.protocol}://${req.get('host')}/api/chat/chat-query`, {
            message,
            context,
            user_id: req.user?.id
        });
        
        res.json(chatResponse.data);
        
    } catch (error) {
        console.error('❌ Send message error:', error);
        res.status(500).json({
            response: "I'm having trouble processing your message. Please try again.",
            type: 'error',
            suggestions: ['Try again', 'Ask simpler question', 'Upload file instead']
        });
    }
});

// ADD THIS - Health check that tests Python API connection
router.get('/python-health', async (req, res) => {
    try {
        const health = await pythonAPIClient.healthCheck();
        res.json({
            express_api: 'healthy',
            python_api: health.status || 'unknown',
            python_details: health
        });
    } catch (error) {
        res.json({
            express_api: 'healthy',
            python_api: 'unhealthy',
            error: error.message
        });
    }
});

// ADD THIS NEW ENDPOINT - Extract and save to database
router.post('/extract-and-save', async (req, res) => {
    try {
        const { message, user_id } = req.body;
        
        console.log('🔍 Extract and save request:', message.substring(0, 50) + '...');
        
        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                error: "No message provided"
            });
        }

        // Try to get response from Python API with increased timeout
        try {
            console.log('🔍 Attempting to connect to Python API at:', `${pythonAPIClient.baseURL}/extract-and-save`);
            const pythonResponse = await axios.post(`${pythonAPIClient.baseURL}/extract-and-save`, {
                message: message.trim(),
                user_id: user_id
            }, {
                timeout: 60000, // Increased to 60 seconds for extraction
                headers: { 'Content-Type': 'application/json' }
            });

            const result = pythonResponse.data;
            console.log('✅ Python API extraction completed');
            
            res.json({
                success: true,
                extraction_result: result.extraction_result,
                saved_to_database: result.saved_to_database,
                timestamp: result.timestamp
            });

        } catch (pythonError) {
            console.log('⚠️ Python API unavailable, using fallback extraction');
            console.log('❌ Python API error details:', pythonError.message);
            console.log('❌ Python API error code:', pythonError.code);
            console.log('❌ Python API error response:', pythonError.response?.data);
            
            // Fallback to basic extraction without database save
            const fallbackResult = {
                success: false,
                error: 'Python API unavailable',
                extraction_result: {
                    input_text: message,
                    is_housing: false,
                    extracted_data: {},
                    confidence_score: 0.0,
                    extraction_method: 'fallback'
                },
                saved_to_database: false
            };
            
            res.json(fallbackResult);
        }

    } catch (error) {
        console.error('❌ Extract and save error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Test route to debug
router.get('/test', (req, res) => {
    res.json({ message: 'Chat routes working' });
});

// Simple health check
router.get('/health', (req, res) => {
    res.json({ status: 'Chat API is running' });
});

// Enhanced send message endpoint with LangChain pipeline
router.post('/send-message-old', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log(`🤖 Processing message with LangChain: ${message.substring(0, 50)}...`);
        
        // Use LangChain pipeline for processing
        const langchainResult = await pythonAPIClient.processMessage(message);
        
        if (langchainResult.success) {
            // LangChain pipeline worked
            const result = langchainResult.result;
            console.log(`✅ LangChain classification: ${result.is_housing}, confidence: ${result.confidence_score}`);
            
            // Check if LangChain had an error in classification or low confidence
            if ((result.reasoning && result.reasoning.includes('Error')) || result.confidence_score < 0.5) {
                console.log('⚠️ LangChain classification error or low confidence, using fallback');
                // Force fallback to keyword matching
                langchainResult.success = false;
            } else {
                // Check if it might still be a housing query despite AI classification
                const housingEmojis = ['🏠', '🏡', '🛏️'];
                const strictHousingKeywords = ['rent', 'apartment', 'housing', 'room', 'lease', 'month', 'available', 'sublet', 'northeastern', 'neu', 'boston', 'spot', 'spots', 'hall', 'private', 'shared', 'temp', 'temporary', 'accommodation', 'walk', 'mins', 'line', 'dm', 'contact', 'phone', 'number', 'address', 'street', 'ave', 'st', 'rd', 'court', 'ct', 'way', 'park', 'square', 'sq', 'apartments', 'apts', 'building', 'complex', 'studio', '1br', '2br', '3br', '1b', '2b', '3b', 'bedroom', 'bathroom', 'bath', 'br', 'ba', 'utilities', 'included', 'deposit', 'lease', 'rental', 'sublet', 'sublease', 'furnished', 'unfurnished', 'pet', 'friendly', 'no', 'pets', 'smoking', 'non', 'smoker', 'female', 'male', 'girls', 'boys', 'mixed', 'gender', 'all', 'girls', 'all', 'boys', 'coed', 'co-ed', 'immediate', 'move', 'in', 'ready', 'available', 'now', 'asap', 'urgent', 'quick', 'fast', 'deal', 'offer', 'discount', 'reduced', 'price', 'cheap', 'affordable', 'budget', 'friendly', 'student', 'friendly', 'near', 'close', 'proximity', 'distance', 'walking', 'distance', 'transit', 'transportation', 'bus', 'train', 'subway', 'metro', 'shuttle', 'bike', 'bicycle', 'parking', 'garage', 'laundry', 'washer', 'dryer', 'kitchen', 'bathroom', 'bath', 'shower', 'balcony', 'patio', 'deck', 'garden', 'yard', 'backyard', 'front', 'porch', 'entrance', 'elevator', 'stairs', 'floor', 'level', 'basement', 'attic', 'loft', 'penthouse', 'duplex', 'townhouse', 'house', 'home', 'residence', 'dwelling', 'unit', 'suite', 'flat', 'condo', 'condominium', 'coop', 'cooperative', 'landlord', 'tenant', 'leaseholder', 'renter', 'owner', 'property', 'management', 'company', 'real', 'estate', 'agent', 'broker', 'realtor', 'listing', 'advertisement', 'ad', 'post', 'announcement', 'notice', 'available', 'vacant', 'empty', 'unoccupied', 'ready', 'move', 'in', 'immediate', 'occupancy', 'possession', 'available', 'date', 'start', 'beginning', 'commencement', 'duration', 'period', 'term', 'length', 'time', 'temporary', 'short', 'term', 'long', 'term', 'permanent', 'flexible', 'negotiable', 'reasonable', 'fair', 'market', 'rate', 'competitive', 'pricing', 'cost', 'effective', 'economical', 'inexpensive', 'cheap', 'affordable', 'budget', 'friendly', 'student', 'discount', 'deal', 'offer', 'special', 'promotion', 'reduced', 'price', 'discount', 'savings', 'value', 'worth', 'quality', 'standard', 'premium', 'luxury', 'high', 'end', 'upscale', 'modern', 'contemporary', 'traditional', 'classic', 'vintage', 'antique', 'new', 'old', 'renovated', 'updated', 'remodeled', 'refurbished', 'maintained', 'clean', 'tidy', 'neat', 'organized', 'spacious', 'roomy', 'large', 'small', 'compact', 'cozy', 'comfortable', 'convenient', 'accessible', 'easy', 'reach', 'access', 'entry', 'exit', 'entrance', 'door', 'window', 'view', 'scenic', 'panoramic', 'city', 'skyline', 'downtown', 'uptown', 'midtown', 'suburban', 'urban', 'rural', 'residential', 'commercial', 'industrial', 'mixed', 'use', 'development', 'community', 'neighborhood', 'area', 'district', 'zone', 'region', 'section', 'part', 'side', 'corner', 'block', 'street', 'avenue', 'road', 'drive', 'lane', 'way', 'path', 'trail', 'walk', 'plaza', 'square', 'circle', 'loop', 'crescent', 'terrace', 'place', 'court', 'alley', 'passage', 'thoroughfare', 'highway', 'freeway', 'expressway', 'parkway', 'boulevard', 'promenade', 'esplanade', 'boardwalk', 'pier', 'dock', 'wharf', 'marina', 'harbor', 'port', 'terminal', 'station', 'stop', 'hub', 'center', 'central'];
                
                // Check for housing emojis first (strong indicator)
                const hasHousingEmoji = housingEmojis.some(emoji => message.includes(emoji));
                
                // Check for strict housing keywords (more specific)
                const hasStrictHousingKeyword = strictHousingKeywords.some(keyword => 
                    message.toLowerCase().includes(keyword)
                );
                
                // Require either housing emoji OR strict housing keywords for better accuracy
                const mightBeHousing = hasHousingEmoji || hasStrictHousingKeyword;
                
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
                    // Check if it might still be a housing query despite AI classification
                    if (mightBeHousing) {
                        responseContent = `I understand you're asking about housing! "${message}" - I can help you find housing options in the Boston area.`;
                        
                        // Try to fetch relevant listings based on the query
                        let listings = [];
                        try {
                            const Housing = require('../models/Housing');
                            
                            // Build a more dynamic query based on the message content
                            let query = { status: 'active' };
                            let sortOptions = { createdAt: -1 };
                            
                            // Check for specific keywords in the message
                            const messageLower = message.toLowerCase();
                            
                            if (messageLower.includes('budget') || messageLower.includes('affordable') || messageLower.includes('cheap') || messageLower.includes('under')) {
                                query.price = { $lte: 2500 };
                                sortOptions = { price: 1 }; // Sort by price ascending
                                responseContent += ` Here are some affordable options under $2500:`;
                            } else if (messageLower.includes('back bay') || messageLower.includes('fenway') || messageLower.includes('mission hill')) {
                                // Search for specific neighborhoods
                                const neighborhoods = [];
                                if (messageLower.includes('back bay')) neighborhoods.push('Back Bay');
                                if (messageLower.includes('fenway')) neighborhoods.push('Fenway');
                                if (messageLower.includes('mission hill')) neighborhoods.push('Mission Hill');
                                if (neighborhoods.length > 0) {
                                    query['location.neighborhood'] = { $in: neighborhoods };
                                    responseContent += ` Here are listings in ${neighborhoods.join(', ')}:`;
                                }
                            } else if (messageLower.includes('studio') || messageLower.includes('1br') || messageLower.includes('1 bedroom')) {
                                query.$or = [
                                    { roomType: 'studio' },
                                    { roomType: '1BR' },
                                    { bedrooms: 1 }
                                ];
                                responseContent += ` Here are some studio and 1-bedroom options:`;
                            } else if (messageLower.includes('2br') || messageLower.includes('2 bedroom')) {
                                query.$or = [
                                    { roomType: '2BR' },
                                    { bedrooms: 2 }
                                ];
                                responseContent += ` Here are some 2-bedroom options:`;
                            } else {
                                responseContent += ` Here are some current listings that might interest you:`;
                            }
                            
                            listings = await Housing.find(query)
                                .limit(3)
                                .select('title price location propertyType bedrooms bathrooms')
                                .sort(sortOptions)
                                .lean();
                            
                            if (listings.length > 0) {
                                responseContent += `\n\n🏠 **Current Listings:**\n`;
                                listings.forEach((listing, index) => {
                                    const propertyType = listing.propertyType || 'apartment';
                                    const bedrooms = listing.bedrooms || 1;
                                    const bathrooms = listing.bathrooms || 1;
                                    const neighborhood = listing.location?.neighborhood || listing.location?.address || 'Boston';
                                    
                                    responseContent += `\n${index + 1}. **${listing.title}**\n`;
                                    responseContent += `   💰 $${listing.price}/month\n`;
                                    responseContent += `   🏘️ ${propertyType} • ${bedrooms}BR • ${bathrooms}BA\n`;
                                    responseContent += `   📍 ${neighborhood}\n`;
                                });
                                responseContent += `\nYou can view all listings on the dashboard or ask me about specific neighborhoods like Back Bay, Mission Hill, or Fenway.`;
                            } else {
                                responseContent += `\n\nI can help you search for housing in different Boston neighborhoods. Try asking about specific areas like Back Bay, Mission Hill, or Fenway.`;
                            }
                        } catch (error) {
                            console.error('Error fetching listings for chat response:', error);
                            responseContent += `\n\nI can help you search for housing in different Boston neighborhoods. Try asking about specific areas like Back Bay, Mission Hill, or Fenway.`;
                        }
                    } else {
                        responseContent = `I detected this message as spam or irrelevant content. Please provide housing-related information.`;
                    }
                } else {
                    responseContent = `This doesn't appear to be housing-related. I can help you with housing questions about Boston neighborhoods, rental prices, or roommate searches.`;
                }
                
                res.json({
                    success: true,
                    result: {
                        content: responseContent,
                        housingResults: result.is_housing === true ? [result] : (mightBeHousing ? listings || [] : []),
                        metadata: {
                            confidence: result.confidence_score || 0.8,
                            processingTime: result.processing_time || 0.5,
                            queryType: result.is_housing === true || mightBeHousing ? 'housing' : 'general',
                            langchainUsed: true,
                            classification: result.is_housing === true || mightBeHousing ? 'HOUSING' : 'GENERAL',
                            extractionMethod: result.extraction_method,
                            securityStatus: result.security_status
                        },
                        sessionId: `langchain_${Date.now()}`
                    }
                });
                return; // Exit early if LangChain worked
            }
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
            
            if (batchResults.results) {
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
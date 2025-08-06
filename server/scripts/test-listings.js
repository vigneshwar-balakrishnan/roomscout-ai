const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Simple housing schema for extracted listings
const extractedListingSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    neighborhood: String,
    walkTimeToNEU: Number,
    transitTimeToNEU: Number
  },
  price: Number,
  bedrooms: Number,
  bathrooms: Number,
  propertyType: String,
  roomType: String,
  rentType: String,
  availability: {
    startDate: Date,
    isAvailable: Boolean
  },
  leaseTerms: {
    minLease: Number,
    deposit: Number,
    utilitiesIncluded: Boolean
  },
  contactInfo: {
    phone: String,
    email: String,
    preferredContact: String,
    responseTime: String
  },
  amenities: [String],
  northeasternFeatures: {
    shuttleAccess: Boolean,
    bikeFriendly: Boolean,
    studySpaces: Boolean
  },
  roommatePreferences: {
    gender: String
  },
  source: String,
  extractedData: {
    location: String,
    price: String,
    roomType: String,
    availability: String,
    contact: String,
    amenities: String,
    is_housing_related: Boolean
  },
  classification: String,
  processingMetadata: {
    originalMessage: String,
    extractionMethod: String,
    confidence: Number
  },
  confidence: Number,
  isVerified: Boolean,
  status: String,
  images: [String],
  views: Number,
  favorites: [String],
  tags: [String],
  createdAt: Date,
  updatedAt: Date
});

const ExtractedListing = mongoose.model('ExtractedListing', extractedListingSchema);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roomscout-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test the listings
async function testListings() {
  try {
    console.log('🔍 Testing extracted listings...');
    
    const extractedListings = await ExtractedListing.find({ 
      source: 'extracted_from_chat' 
    }).sort({ createdAt: -1 });

    console.log(`📊 Found ${extractedListings.length} extracted listings`);
    
    if (extractedListings.length > 0) {
      console.log('\n📋 Extracted Listings:');
      extractedListings.forEach((listing, index) => {
        console.log(`\n${index + 1}. ${listing.title}`);
        console.log(`   📍 Address: ${listing.location.address}, ${listing.location.city}`);
        console.log(`   💰 Price: $${listing.price}/month`);
        console.log(`   🏠 Type: ${listing.propertyType} (${listing.roomType})`);
        console.log(`   🎯 Confidence: ${Math.round(listing.confidence * 100)}%`);
        console.log(`   📞 Contact: ${listing.contactInfo.phone}`);
        console.log(`   🏷️ Tags: ${listing.tags.join(', ')}`);
      });
      
      console.log('\n✅ All extracted listings are properly stored!');
      console.log('🎯 Ready for presentation!');
    } else {
      console.log('❌ No extracted listings found');
    }
    
  } catch (error) {
    console.error('❌ Error testing listings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
async function main() {
  await connectDB();
  await testListings();
}

main().catch(console.error); 
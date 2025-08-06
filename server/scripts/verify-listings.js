const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Housing } = require('../models');

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

// Verify extracted listings
async function verifyListings() {
  try {
    console.log('🔍 Verifying extracted listings...');
    
    const extractedListings = await Housing.find({ 
      source: 'extracted_from_chat' 
    }).sort({ createdAt: -1 });

    console.log(`📊 Found ${extractedListings.length} extracted listings`);
    
    if (extractedListings.length > 0) {
      console.log('\n📋 Extracted Listings Details:');
      extractedListings.forEach((listing, index) => {
        console.log(`\n${index + 1}. ${listing.title}`);
        console.log(`   📍 Address: ${listing.location.address}, ${listing.location.city}, ${listing.location.state} ${listing.location.zipCode}`);
        console.log(`   🏘️ Neighborhood: ${listing.location.neighborhood}`);
        console.log(`   💰 Price: $${listing.price}/month`);
        console.log(`   🏠 Type: ${listing.propertyType} (${listing.roomType})`);
        console.log(`   🛏️ Bedrooms: ${listing.bedrooms}, Bathrooms: ${listing.bathrooms}`);
        console.log(`   🎯 AI Confidence: ${Math.round(listing.confidence * 100)}%`);
        console.log(`   📞 Contact: ${listing.contactInfo.phone}`);
        console.log(`   📧 Email: ${listing.contactInfo.email}`);
        console.log(`   🏷️ Tags: ${listing.tags.join(', ')}`);
        console.log(`   ✨ Amenities: ${listing.amenities.join(', ')}`);
        console.log(`   🚶 Walk to NEU: ${listing.location.walkTimeToNEU} minutes`);
        console.log(`   🚌 Transit to NEU: ${listing.location.transitTimeToNEU} minutes`);
        console.log(`   📅 Available: ${listing.availability.startDate.toLocaleDateString()}`);
        console.log(`   💳 Deposit: $${listing.leaseTerms.deposit}`);
        console.log(`   🔌 Utilities Included: ${listing.leaseTerms.utilitiesIncluded ? 'Yes' : 'No'}`);
      });
      
      console.log('\n✅ All extracted listings are properly stored and accessible!');
      console.log('💡 These listings will appear in the Dashboard under "AI-Extracted Listings"');
      console.log('🎯 Perfect for your presentation!');
    } else {
      console.log('❌ No extracted listings found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error verifying listings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the verification
async function main() {
  await connectDB();
  await verifyListings();
}

main().catch(console.error); 
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

// Sample housing listings extracted from WhatsApp messages
const sampleListings = [
  {
    title: "2BR Apartment in Back Bay",
    description: "Beautiful 2-bedroom apartment in the heart of Back Bay. Recently renovated with modern amenities. Perfect for Northeastern students.",
    location: {
      address: "123 Newbury Street",
      city: "Boston",
      state: "MA",
      zipCode: "02116",
      neighborhood: "Back Bay",
      walkTimeToNEU: 15,
      transitTimeToNEU: 8
    },
    price: 2800,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: "apartment",
    roomType: "2BR",
    rentType: "monthly",
    availability: {
      startDate: new Date("2024-09-01"),
      isAvailable: true
    },
    leaseTerms: {
      minLease: 12,
      deposit: 2800,
      utilitiesIncluded: false
    },
    contactInfo: {
      phone: "(617) 555-0123",
      email: "john.smith@email.com",
      preferredContact: "phone",
      responseTime: "within_day"
    },
    amenities: ["wifi", "laundry", "kitchen", "ac", "dishwasher"],
    northeasternFeatures: {
      shuttleAccess: true,
      bikeFriendly: true,
      studySpaces: true
    },
    roommatePreferences: {
      gender: "any"
    },
    source: "extracted_from_chat",
    extractedData: {
      location: "Back Bay, Boston",
      price: "$2,800/month",
      roomType: "2BR Apartment",
      availability: "September 1st, 2024",
      contact: "John Smith - (617) 555-0123",
      amenities: "In-unit laundry, dishwasher, central AC",
      is_housing_related: true
    },
    classification: "HOUSING",
    processingMetadata: {
      originalMessage: "2BR apartment available in Back Bay, $2800/month, contact John at (617) 555-0123",
      extractionMethod: "few_shot",
      confidence: 0.92
    },
    confidence: 0.92,
    isVerified: false,
    status: "active",
    images: [],
    views: 0,
    favorites: [],
    tags: ["student-friendly", "back-bay", "2-bedroom"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Studio near Mission Hill",
    description: "Cozy studio apartment in Mission Hill area. Great location for students, close to restaurants and shops. Recently updated kitchen and bathroom.",
    location: {
      address: "456 Tremont Street",
      city: "Boston",
      state: "MA",
      zipCode: "02120",
      neighborhood: "Roxbury",
      walkTimeToNEU: 12,
      transitTimeToNEU: 6
    },
    price: 1800,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "studio",
    roomType: "studio",
    rentType: "monthly",
    availability: {
      startDate: new Date("2024-08-15"),
      isAvailable: true
    },
    leaseTerms: {
      minLease: 12,
      deposit: 1800,
      utilitiesIncluded: false
    },
    contactInfo: {
      phone: "(617) 555-0456",
      email: "sarah.johnson@email.com",
      preferredContact: "email",
      responseTime: "within_hour"
    },
    amenities: ["wifi", "kitchen", "ac", "pet_friendly"],
    northeasternFeatures: {
      shuttleAccess: true,
      bikeFriendly: true
    },
    roommatePreferences: {
      gender: "any"
    },
    source: "extracted_from_chat",
    extractedData: {
      location: "Mission Hill, Boston",
      price: "$1,800/month",
      roomType: "Studio",
      availability: "August 15th, 2024",
      contact: "Sarah Johnson - (617) 555-0456",
      amenities: "Updated kitchen, new bathroom, pet friendly",
      is_housing_related: true
    },
    classification: "HOUSING",
    processingMetadata: {
      originalMessage: "Studio available in Mission Hill, $1800/month, updated kitchen, contact Sarah at (617) 555-0456",
      extractionMethod: "few_shot",
      confidence: 0.88
    },
    confidence: 0.88,
    isVerified: false,
    status: "active",
    images: [],
    views: 0,
    favorites: [],
    tags: ["studio", "mission-hill", "pet-friendly"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "3BR House in Fenway",
    description: "Spacious 3-bedroom house in Fenway area. Perfect for a group of students. Large living room, updated kitchen, and backyard. Near Fenway Park and many restaurants.",
    location: {
      address: "789 Boylston Street",
      city: "Boston",
      state: "MA",
      zipCode: "02115",
      neighborhood: "Fenway",
      walkTimeToNEU: 18,
      transitTimeToNEU: 10
    },
    price: 4200,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "house",
    roomType: "3BR+",
    rentType: "monthly",
    availability: {
      startDate: new Date("2024-09-01"),
      isAvailable: true
    },
    leaseTerms: {
      minLease: 12,
      deposit: 4200,
      utilitiesIncluded: false
    },
    contactInfo: {
      phone: "(617) 555-0789",
      email: "mike.davis@email.com",
      preferredContact: "both",
      responseTime: "within_day"
    },
    amenities: ["wifi", "kitchen", "parking", "ac", "heating"],
    northeasternFeatures: {
      shuttleAccess: true,
      bikeFriendly: true,
      studySpaces: true
    },
    roommatePreferences: {
      gender: "any"
    },
    source: "extracted_from_chat",
    extractedData: {
      location: "Fenway, Boston",
      price: "$4,200/month",
      roomType: "3BR House",
      availability: "September 1st, 2024",
      contact: "Mike Davis - (617) 555-0789",
      amenities: "Large living room, updated kitchen, backyard, parking",
      is_housing_related: true
    },
    classification: "HOUSING",
    processingMetadata: {
      originalMessage: "3BR house in Fenway, $4200/month, large living room, contact Mike at (617) 555-0789",
      extractionMethod: "few_shot",
      confidence: 0.95
    },
    confidence: 0.95,
    isVerified: false,
    status: "active",
    images: [],
    views: 0,
    favorites: [],
    tags: ["house", "fenway", "3-bedroom"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

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

// Populate database with sample listings
async function populateListings() {
  try {
    console.log('🗑️ Clearing existing extracted listings...');
    await ExtractedListing.deleteMany({ source: 'extracted_from_chat' });
    
    console.log('📝 Adding sample housing listings...');
    const createdListings = await ExtractedListing.insertMany(sampleListings);
    
    console.log(`✅ Successfully added ${createdListings.length} housing listings`);
    
    // Display the created listings
    console.log('\n📋 Created Listings:');
    createdListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   Location: ${listing.location.address}, ${listing.location.city}`);
      console.log(`   Price: $${listing.price}/month`);
      console.log(`   Type: ${listing.propertyType}`);
      console.log(`   Confidence: ${Math.round(listing.confidence * 100)}%`);
      console.log(`   Contact: ${listing.contactInfo.phone}`);
      console.log('');
    });
    
    console.log('🎉 Database populated successfully!');
    console.log('💡 You can now view these listings in the Dashboard under "AI-Extracted Listings"');
    
  } catch (error) {
    console.error('❌ Error populating listings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
async function main() {
  await connectDB();
  await populateListings();
}

main().catch(console.error); 
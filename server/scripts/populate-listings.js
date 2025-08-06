const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Housing } = require('../models');

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
    owner: "507f1f77bcf86cd799439011", // Placeholder ObjectId
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
    owner: "507f1f77bcf86cd799439011", // Placeholder ObjectId
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
    owner: "507f1f77bcf86cd799439011", // Placeholder ObjectId
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
  },
  {
    title: "1BR Apartment in Roxbury",
    description: "Affordable 1-bedroom apartment in Roxbury. Great for students on a budget. Close to public transportation and grocery stores.",
    location: {
      address: "321 Dudley Street",
      city: "Boston",
      state: "MA",
      zipCode: "02119",
      neighborhood: "Roxbury",
      walkTimeToNEU: 25,
      transitTimeToNEU: 15
    },
    price: 1400,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "apartment",
    roomType: "1BR",
    rentType: "monthly",
    availability: {
      startDate: new Date("2024-08-01"),
      isAvailable: true
    },
    leaseTerms: {
      minLease: 12,
      deposit: 1400,
      utilitiesIncluded: true
    },
    contactInfo: {
      phone: "(617) 555-0321",
      email: "lisa.chen@email.com",
      preferredContact: "email",
      responseTime: "within_day"
    },
    amenities: ["wifi", "laundry", "heating", "utilities_included"],
    northeasternFeatures: {
      shuttleAccess: true,
      bikeFriendly: true
    },
    roommatePreferences: {
      gender: "any"
    },
    owner: "507f1f77bcf86cd799439011", // Placeholder ObjectId
    source: "extracted_from_chat",
    extractedData: {
      location: "Roxbury, Boston",
      price: "$1,400/month",
      roomType: "1BR Apartment",
      availability: "August 1st, 2024",
      contact: "Lisa Chen - (617) 555-0321",
      amenities: "Heat included, hot water included, laundry in building",
      is_housing_related: true
    },
    classification: "HOUSING",
    processingMetadata: {
      originalMessage: "1BR apartment in Roxbury, $1400/month, heat included, contact Lisa at (617) 555-0321",
      extractionMethod: "few_shot",
      confidence: 0.87
    },
    confidence: 0.87,
    isVerified: false,
    status: "active",
    images: [],
    views: 0,
    favorites: [],
    tags: ["affordable", "roxbury", "1-bedroom"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "2BR Condo in South End",
    description: "Modern 2-bedroom condo in South End. High-end finishes, stainless steel appliances, and rooftop deck. Perfect for students who want luxury living.",
    location: {
      address: "654 Washington Street",
      city: "Boston",
      state: "MA",
      zipCode: "02118",
      neighborhood: "South End",
      walkTimeToNEU: 20,
      transitTimeToNEU: 12
    },
    price: 3200,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "condo",
    roomType: "2BR",
    rentType: "monthly",
    availability: {
      startDate: new Date("2024-09-01"),
      isAvailable: true
    },
    leaseTerms: {
      minLease: 12,
      deposit: 3200,
      utilitiesIncluded: false
    },
    contactInfo: {
      phone: "(617) 555-0654",
      email: "david.wilson@email.com",
      preferredContact: "both",
      responseTime: "within_day"
    },
    amenities: ["wifi", "kitchen", "ac", "dishwasher", "doorman", "gym"],
    northeasternFeatures: {
      shuttleAccess: true,
      bikeFriendly: true,
      studySpaces: true
    },
    roommatePreferences: {
      gender: "any"
    },
    owner: "507f1f77bcf86cd799439011", // Placeholder ObjectId
    source: "extracted_from_chat",
    extractedData: {
      location: "South End, Boston",
      price: "$3,200/month",
      roomType: "2BR Condo",
      availability: "September 1st, 2024",
      contact: "David Wilson - (617) 555-0654",
      amenities: "Stainless steel appliances, granite countertops, rooftop deck",
      is_housing_related: true
    },
    classification: "HOUSING",
    processingMetadata: {
      originalMessage: "2BR condo in South End, $3200/month, luxury finishes, contact David at (617) 555-0654",
      extractionMethod: "few_shot",
      confidence: 0.91
    },
    confidence: 0.91,
    isVerified: false,
    status: "active",
    images: [],
    views: 0,
    favorites: [],
    tags: ["luxury", "south-end", "2-bedroom"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Studio in Allston",
    description: "Bright studio apartment in Allston. Great for students who want to be near Harvard and BU. Many restaurants and shops nearby.",
    location: {
      address: "987 Harvard Avenue",
      city: "Boston",
      state: "MA",
      zipCode: "02134",
      neighborhood: "Allston",
      walkTimeToNEU: 30,
      transitTimeToNEU: 20
    },
    price: 1600,
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
      deposit: 1600,
      utilitiesIncluded: false
    },
    contactInfo: {
      phone: "(617) 555-0987",
      email: "emma.rodriguez@email.com",
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
    owner: "507f1f77bcf86cd799439011", // Placeholder ObjectId
    source: "extracted_from_chat",
    extractedData: {
      location: "Allston, Boston",
      price: "$1,600/month",
      roomType: "Studio",
      availability: "August 15th, 2024",
      contact: "Emma Rodriguez - (617) 555-0987",
      amenities: "Large windows, updated bathroom, kitchenette, pet friendly",
      is_housing_related: true
    },
    classification: "HOUSING",
    processingMetadata: {
      originalMessage: "Studio in Allston, $1600/month, bright apartment, contact Emma at (617) 555-0987",
      extractionMethod: "few_shot",
      confidence: 0.89
    },
    confidence: 0.89,
    isVerified: false,
    status: "active",
    images: [],
    views: 0,
    favorites: [],
    tags: ["studio", "allston", "pet-friendly"],
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
    await Housing.deleteMany({ source: 'extracted_from_chat' });
    
    console.log('📝 Adding sample housing listings...');
    const createdListings = await Housing.insertMany(sampleListings);
    
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
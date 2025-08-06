const mongoose = require('mongoose');

const extractedListingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        min: 0
    },
    location: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'condo', 'studio', 'room', 'other'],
        default: 'apartment'
    },
    bedrooms: {
        type: Number,
        min: 0
    },
    bathrooms: {
        type: Number,
        min: 0
    },
    squareFootage: {
        type: Number,
        min: 0
    },
    amenities: [{
        type: String,
        trim: true
    }],
    images: [{
        url: String,
        caption: String
    }],
    contactInfo: {
        name: String,
        phone: String,
        email: String,
        website: String
    },
    availability: {
        type: String,
        enum: ['available', 'pending', 'rented', 'unavailable'],
        default: 'available'
    },
    leaseTerms: {
        type: String,
        enum: ['monthly', 'yearly', 'flexible', 'other'],
        default: 'monthly'
    },
    utilities: {
        included: [String],
        notIncluded: [String]
    },
    petPolicy: {
        type: String,
        enum: ['allowed', 'not_allowed', 'case_by_case', 'deposit_required'],
        default: 'case_by_case'
    },
    parking: {
        type: String,
        enum: ['included', 'available', 'not_available'],
        default: 'not_available'
    },
    source: {
        type: String,
        required: true,
        enum: ['extracted_from_chat', 'manual_entry', 'api_import'],
        default: 'extracted_from_chat'
    },
    sourceUrl: String,
    extractedFrom: {
        chatSessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatSession'
        },
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'archived'],
        default: 'pending'
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
extractedListingSchema.index({ source: 1, createdAt: -1 });
extractedListingSchema.index({ location: 1 });
extractedListingSchema.index({ price: 1 });
extractedListingSchema.index({ propertyType: 1 });
extractedListingSchema.index({ status: 1 });

// Virtual for full address
extractedListingSchema.virtual('fullAddress').get(function() {
    const addr = this.address;
    if (!addr) return this.location || '';
    
    const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean);
    return parts.join(', ');
});

// Virtual for price display
extractedListingSchema.virtual('priceDisplay').get(function() {
    if (!this.price) return 'Price not specified';
    return `$${this.price.toLocaleString()}`;
});

// Method to get formatted location
extractedListingSchema.methods.getLocationDisplay = function() {
    if (this.fullAddress) return this.fullAddress;
    return this.location || 'Location not specified';
};

// Method to get amenities display
extractedListingSchema.methods.getAmenitiesDisplay = function() {
    if (!this.amenities || this.amenities.length === 0) {
        return 'No amenities listed';
    }
    return this.amenities.join(', ');
};

// Static method to find by price range
extractedListingSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
    const query = {};
    if (minPrice !== undefined) query.price = { $gte: minPrice };
    if (maxPrice !== undefined) {
        if (query.price) {
            query.price.$lte = maxPrice;
        } else {
            query.price = { $lte: maxPrice };
        }
    }
    return this.find(query);
};

// Static method to find by location
extractedListingSchema.statics.findByLocation = function(location) {
    return this.find({
        $or: [
            { location: { $regex: location, $options: 'i' } },
            { 'address.city': { $regex: location, $options: 'i' } },
            { 'address.state': { $regex: location, $options: 'i' } }
        ]
    });
};

module.exports = mongoose.model('ExtractedListing', extractedListingSchema); 
const express = require('express');
const { body, validationResult } = require('express-validator');
const Housing = require('../models/Housing');
const User = require('../models/User');
const { auth, requireVerified } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/housing/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation rules
const createListingValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('propertyType').isIn(['Apartment', 'House', 'Condo', 'Studio', 'Townhouse', 'Loft', 'Duplex', 'Penthouse', 'Dorm', 'Shared Room']).withMessage('Invalid property type'),
  body('roomType').isIn(['Single', 'Double', 'Triple', 'Studio', '1BR', '2BR', '3BR', '4BR+']).withMessage('Invalid room type'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('location.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
];

const updateListingValidation = [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
];

// @route   GET /api/housing
// @desc    Get all housing listings with search and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      priceMin,
      priceMax,
      location = [],
      propertyType = [],
      roomType = [],
      bedrooms = [],
      bathrooms = [],
      amenities = [],
      northeasternFeatures = [],
      rentType = [],
      genderPreference,
      moveInDate,
      userId
    } = req.query;

    // Build query object
    const query = { status: 'active' };

    // Search functionality
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { 'location.address': searchRegex },
        { 'location.neighborhood': searchRegex },
        { 'location.city': searchRegex },
        { description: searchRegex },
        { amenities: searchRegex },
        { propertyType: searchRegex },
        { roomType: searchRegex }
      ];
      
      // Handle special search patterns
      if (search.toLowerCase().includes('near') || search.toLowerCase().includes('close')) {
        // Search for listings near NEU
        query['location.walkTimeToNEU'] = { $lte: 20 }; // Within 20 min walk
      }
      
      if (search.toLowerCase().includes('studio')) {
        query.bedrooms = 0;
      }
      
      if (search.toLowerCase().includes('1br') || search.toLowerCase().includes('1 bedroom')) {
        query.bedrooms = 1;
      }
      
      if (search.toLowerCase().includes('2br') || search.toLowerCase().includes('2 bedroom')) {
        query.bedrooms = 2;
      }
      
      if (search.toLowerCase().includes('3br') || search.toLowerCase().includes('3 bedroom')) {
        query.bedrooms = 3;
      }
      
      if (search.toLowerCase().includes('furnished')) {
        query.amenities = { $in: ['furnished'] };
      }
      
      if (search.toLowerCase().includes('pet') || search.toLowerCase().includes('dog') || search.toLowerCase().includes('cat')) {
        query.amenities = { $in: ['pet_friendly'] };
      }
      
      if (search.toLowerCase().includes('wifi') || search.toLowerCase().includes('internet')) {
        query.amenities = { $in: ['wifi'] };
      }
      
      if (search.toLowerCase().includes('parking')) {
        query.amenities = { $in: ['parking'] };
      }
      
      if (search.toLowerCase().includes('gym')) {
        query.amenities = { $in: ['gym'] };
      }
      
      if (search.toLowerCase().includes('laundry')) {
        query.amenities = { $in: ['laundry'] };
      }
    }

    // Price filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseInt(priceMin);
      if (priceMax) query.price.$lte = parseInt(priceMax);
    }

    // Location filter
    if (location.length > 0) {
      query['location.neighborhood'] = { $in: location };
    }

    // Property type filter
    if (propertyType.length > 0) {
      query.propertyType = { $in: propertyType };
    }

    // Room type filter
    if (roomType.length > 0) {
      query.roomType = { $in: roomType };
    }

    // Bedrooms filter
    if (bedrooms.length > 0) {
      query.bedrooms = { $in: bedrooms.map(b => parseInt(b)) };
    }

    // Bathrooms filter
    if (bathrooms.length > 0) {
      query.bathrooms = { $in: bathrooms.map(b => parseInt(b)) };
    }

    // Amenities filter
    if (amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    // Northeastern features filter
    if (northeasternFeatures.length > 0) {
      northeasternFeatures.forEach(feature => {
        query[`northeasternFeatures.${feature}`] = true;
      });
    }

    // Rent type filter
    if (rentType.length > 0) {
      query.rentType = { $in: rentType };
    }

    // Gender preference filter
    if (genderPreference && genderPreference !== 'any') {
      query.genderPreference = genderPreference;
    }

    // Move-in date filter
    if (moveInDate) {
      query.availabilityDate = { $lte: new Date(moveInDate) };
    }

    // User filter (for user's own listings)
    if (userId) {
      query.owner = userId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [listings, total] = await Promise.all([
      Housing.find(query)
        .populate('owner', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Housing.countDocuments(query)
    ]);

    // Get saved listings for authenticated user
    let savedListings = [];
    if (req.user) {
      const user = await User.findById(req.user._id).select('savedListings');
      savedListings = user?.savedListings || [];
    }

    // Add isSaved flag to listings
    const listingsWithSavedFlag = listings.map(listing => ({
      ...listing,
      isSaved: savedListings.includes(listing._id.toString())
    }));

    res.json({
      success: true,
      listings: listingsWithSavedFlag,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      savedListings
    });

  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// @route   GET /api/housing/stats
// @desc    Get housing statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Housing.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgBedrooms: { $avg: '$bedrooms' },
          avgBathrooms: { $avg: '$bathrooms' }
        }
      }
    ]);

    const propertyTypeStats = await Housing.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      overall: stats[0] || {},
      propertyTypes: propertyTypeStats
    });

  } catch (error) {
    console.error('Error fetching housing stats:', error);
    res.status(500).json({ error: 'Failed to fetch housing stats' });
  }
});

// @route   GET /api/housing/popular-searches
// @desc    Get popular search terms
// @access  Public
router.get('/popular-searches', async (req, res) => {
  try {
    // Get popular neighborhoods
    const popularNeighborhoods = await Housing.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$location.neighborhood',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get popular property types
    const popularPropertyTypes = await Housing.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Get popular amenities
    const popularAmenities = await Housing.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $unwind: '$amenities'
      },
      {
        $group: {
          _id: '$amenities',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Combine popular searches
    const popularSearches = [
      ...popularNeighborhoods.map(n => n._id),
      ...popularPropertyTypes.map(p => p._id),
      ...popularAmenities.map(a => a._id),
      'Studio near NEU',
      '2 bedroom apartment',
      'Pet friendly',
      'Under $2000',
      'Furnished apartment'
    ];

    // Remove duplicates and limit
    const uniqueSearches = [...new Set(popularSearches)].slice(0, 10);

    res.json({ popularSearches: uniqueSearches });

  } catch (error) {
    console.error('Error fetching popular searches:', error);
    // Fallback to default searches
    res.json({ 
      popularSearches: [
        'Studio near NEU',
        '2 bedroom apartment',
        'Fenway area',
        'Pet friendly',
        'Under $2000',
        'Furnished apartment',
        'Back Bay',
        'Beacon Hill',
        'Wifi included',
        'Parking available'
      ]
    });
  }
});

// @route   GET /api/housing/search-suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchQuery = q.toLowerCase();
    
    // Get neighborhood suggestions
    const neighborhoodSuggestions = await Housing.aggregate([
      {
        $match: {
          'location.neighborhood': { $regex: searchQuery, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$location.neighborhood',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Get property type suggestions
    const propertyTypeSuggestions = await Housing.aggregate([
      {
        $match: {
          propertyType: { $regex: searchQuery, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 2 }
    ]);

    // Get amenity suggestions
    const amenitySuggestions = await Housing.aggregate([
      {
        $match: {
          amenities: { $regex: searchQuery, $options: 'i' }
        }
      },
      {
        $unwind: '$amenities'
      },
      {
        $match: {
          amenities: { $regex: searchQuery, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$amenities',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 2 }
    ]);

    // Get price range suggestions
    let priceSuggestions = [];
    if (searchQuery.includes('under') || searchQuery.includes('less') || searchQuery.includes('cheap')) {
      priceSuggestions = ['Under $1500', 'Under $2000', 'Under $2500'];
    } else if (searchQuery.includes('over') || searchQuery.includes('more') || searchQuery.includes('luxury')) {
      priceSuggestions = ['Over $3000', 'Over $4000', 'Over $5000'];
    }

    // Combine all suggestions
    const allSuggestions = [
      ...neighborhoodSuggestions.map(s => s._id),
      ...propertyTypeSuggestions.map(s => s._id),
      ...amenitySuggestions.map(s => s._id),
      ...priceSuggestions
    ];

    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 8);

    res.json({ suggestions: uniqueSuggestions });

  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
});

// @route   GET /api/housing/saved
// @desc    Get user's saved listings
// @access  Private
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const savedListings = await Housing.find({
      _id: { $in: user.savedListings || [] },
      status: 'active'
    }).populate('owner', 'firstName lastName email');

    res.json({ savedListings });

  } catch (error) {
    console.error('Error fetching saved listings:', error);
    res.status(500).json({ error: 'Failed to fetch saved listings' });
  }
});

// @route   GET /api/housing/my-listings
// @desc    Get user's created listings
// @access  Private
router.get('/my-listings', auth, async (req, res) => {
  try {
    const myListings = await Housing.find({ owner: req.user._id })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ myListings });

  } catch (error) {
    console.error('Error fetching my listings:', error);
    res.status(500).json({ error: 'Failed to fetch my listings' });
  }
});

// @route   GET /api/housing/:id
// @desc    Get single housing listing
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Housing.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Track view if user is authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          interactions: {
            listingId: listing._id,
            interactionType: 'view',
            timestamp: new Date()
          }
        }
      });
    }

    res.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// @route   POST /api/housing
// @desc    Create new housing listing
// @access  Private
router.post('/', auth, createListingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const listingData = {
      ...req.body,
      owner: req.user._id,
      status: 'active',
      createdAt: new Date()
    };

    const listing = new Housing(listingData);
    await listing.save();

    // Populate owner info
    await listing.populate('owner', 'firstName lastName email');

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });

  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// @route   PUT /api/housing/:id
// @desc    Update housing listing
// @access  Private (owner only)
router.put('/:id', auth, updateListingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const listing = await Housing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const updatedListing = await Housing.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });

  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// @route   DELETE /api/housing/:id
// @desc    Delete housing listing
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Housing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await Housing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });

  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// @route   POST /api/housing/:id/save
// @desc    Save listing to favorites
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const listing = await Housing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedListings: listing._id }
    });

    res.json({ message: 'Listing saved to favorites' });

  } catch (error) {
    console.error('Error saving listing:', error);
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

// @route   DELETE /api/housing/:id/save
// @desc    Remove listing from favorites
// @access  Private
router.delete('/:id/save', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedListings: req.params.id }
    });

    res.json({ message: 'Listing removed from favorites' });

  } catch (error) {
    console.error('Error removing listing:', error);
    res.status(500).json({ error: 'Failed to remove listing' });
  }
});

// @route   POST /api/housing/:id/contact
// @desc    Contact listing owner
// @access  Private
router.post('/:id/contact', auth, [
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const listing = await Housing.findById(req.params.id).populate('owner');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // TODO: Send email/notification to listing owner
    // For now, just return success
    res.json({ 
      message: 'Contact message sent successfully',
      listingOwner: listing.owner.email
    });

  } catch (error) {
    console.error('Error contacting listing:', error);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

// @route   POST /api/housing/:id/interaction
// @desc    Add interaction (view, like, etc.)
// @access  Private
router.post('/:id/interaction', auth, [
  body('interactionType').isIn(['view', 'save', 'contact', 'like', 'dislike']).withMessage('Invalid interaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { interactionType } = req.body;

    // Add interaction to user's history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        interactions: {
          listingId: req.params.id,
          interactionType,
          timestamp: new Date()
        }
      }
    });

    // Update listing stats if needed
    if (interactionType === 'like' || interactionType === 'dislike') {
      await Housing.findByIdAndUpdate(req.params.id, {
        $inc: { [`stats.${interactionType}s`]: 1 }
      });
    }

    res.json({ message: 'Interaction recorded successfully' });

  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

// @route   GET /api/housing/:id/stats
// @desc    Get listing statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const listing = await Housing.findById(req.params.id).select('stats views');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ stats: listing.stats, views: listing.views });

  } catch (error) {
    console.error('Error fetching listing stats:', error);
    res.status(500).json({ error: 'Failed to fetch listing stats' });
  }
});

// @route   POST /api/housing/:id/images
// @desc    Upload listing images
// @access  Private (owner only)
router.post('/:id/images', auth, upload.array('images', 10), async (req, res) => {
  try {
    const listing = await Housing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload images for this listing' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => ({
      url: `/uploads/housing/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname
    }));

    listing.images.push(...imageUrls);
    await listing.save();

    res.json({
      message: 'Images uploaded successfully',
      images: imageUrls
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// @route   DELETE /api/housing/:id/images/:imageId
// @desc    Delete listing image
// @access  Private (owner only)
router.delete('/:id/images/:imageId', auth, async (req, res) => {
  try {
    const listing = await Housing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete images for this listing' });
    }

    listing.images = listing.images.filter(img => img._id.toString() !== req.params.imageId);
    await listing.save();

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// @route   POST /api/housing/ai-extracted
// @desc    Create housing listing from AI extraction (no auth required)
// @access  Public
router.post('/ai-extracted', async (req, res) => {
  try {
    // Find or create a system user for AI-extracted listings
    let systemUser = await User.findOne({ email: 'system@roomscout.ai' });
    
    if (!systemUser) {
      systemUser = new User({
        firstName: 'System',
        lastName: 'AI',
        email: 'system@roomscout.ai',
        password: 'system-password-hash', // This should be properly hashed
        isVerified: true,
        role: 'admin'
      });
      await systemUser.save();
    }

    const listingData = {
      ...req.body,
      owner: systemUser._id, // Set the system user as owner
      source: 'extracted_from_chat',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const listing = new Housing(listingData);
    await listing.save();

    res.status(201).json({
      message: 'AI-extracted listing created successfully',
      listing: listing._id,
      success: true
    });

  } catch (error) {
    console.error('Error creating AI-extracted listing:', error);
    res.status(500).json({ 
      error: 'Failed to create AI-extracted listing',
      details: error.message 
    });
  }
});

// @route   GET /api/housing/recently-viewed
// @desc    Get user's recently viewed listings
// @access  Private
router.get('/recently-viewed', auth, async (req, res) => {
  try {
    // Get the user's interactions
    const user = await User.findById(req.user._id).select('interactions');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const interactions = user.interactions || [];

    // If no interactions, return empty array
    if (interactions.length === 0) {
      return res.json({
        success: true,
        recentlyViewed: [],
        count: 0
      });
    }

    // Filter for view interactions only
    const viewInteractions = interactions.filter(
      interaction => interaction.interactionType === 'view' && interaction.listingId
    );

    // If no view interactions, return empty array
    if (viewInteractions.length === 0) {
      return res.json({
        success: true,
        recentlyViewed: [],
        count: 0
      });
    }

    // Extract unique listing IDs from view interactions
    const recentlyViewedListingIds = [...new Set(viewInteractions.map(i => i.listingId))];

    // Fetch the listings
    const recentlyViewedListings = await Housing.find({
      _id: { $in: recentlyViewedListingIds },
      status: 'active'
    }).populate('owner', 'firstName lastName email');

    res.json({
      success: true,
      recentlyViewed: recentlyViewedListings,
      count: recentlyViewedListings.length
    });

  } catch (error) {
    console.error('Error fetching recently viewed listings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recently viewed listings',
      details: error.message 
    });
  }
});

module.exports = router; 
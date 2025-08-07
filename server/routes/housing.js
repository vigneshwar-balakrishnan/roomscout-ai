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
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.neighborhood': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { amenities: { $regex: search, $options: 'i' } }
      ];
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
    // For now, return static popular searches
    // TODO: Implement actual search analytics
    const popularSearches = [
      'Studio near NEU',
      '2 bedroom apartment',
      'Fenway area',
      'Pet friendly',
      'Under $2000',
      'Furnished apartment'
    ];

    res.json({ 
      success: true,
      popularSearches 
    });

  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Failed to fetch popular searches' });
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

    const suggestions = await Housing.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { 'location.neighborhood': { $regex: q, $options: 'i' } },
            { 'location.address': { $regex: q, $options: 'i' } }
          ]
        }
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

    res.json({ suggestions: suggestions.map(s => s._id) });

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

module.exports = router; 
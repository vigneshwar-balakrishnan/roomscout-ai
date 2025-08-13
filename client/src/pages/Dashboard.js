import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Card,
  message,
  Select,
  Tooltip,
  Tag,
  Spin,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  BellOutlined,
  HeartOutlined,
  EyeOutlined,
  RobotOutlined,
  HeartFilled,
  HomeOutlined,
  EnvironmentOutlined,
  UserOutlined
} from '@ant-design/icons';
import HousingList from '../components/housing/HousingList';
import HousingFilters from '../components/housing/HousingFilters';
import { useAuth } from '../contexts/AuthContext';
import { housingAPI, analyticsAPI, chatAPI } from '../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalListings, setTotalListings] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [extractedListings, setExtractedListings] = useState([]);
  const [showSavedListings, setShowSavedListings] = useState(false);
  const [savedListings, setSavedListings] = useState([]);
  const [savedListingsLoading, setSavedListingsLoading] = useState(false);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Load extracted listings from chat uploads
  const loadExtractedListings = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getExtractedListings();
      if (response.data.success) {
        setExtractedListings(response.data.listings);
      }
    } catch (error) {
      console.error('Error loading extracted listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load saved listings
  const loadSavedListings = async () => {
    try {
      setSavedListingsLoading(true);
      const response = await housingAPI.getSavedListings();
      setSavedListings(response.data.savedListings || []);
    } catch (error) {
      console.error('Error loading saved listings:', error);
      message.error('Failed to load saved listings');
    } finally {
      setSavedListingsLoading(false);
    }
  };

  // Load recently viewed listings
  const loadRecentlyViewed = async () => {
    try {
      setRecentlyViewedLoading(true);
      const response = await housingAPI.getRecentlyViewed();
      
      if (response.data.success) {
        setRecentlyViewed(response.data.recentlyViewed || []);
      } else {
        message.error('Failed to load recently viewed listings');
      }
    } catch (error) {
      console.error('Error loading recently viewed listings:', error);
      message.error('Failed to load recently viewed listings');
    } finally {
      setRecentlyViewedLoading(false);
    }
  };

  // Handle showing recently viewed listings
  const handleShowRecentlyViewed = async () => {
    setShowRecentlyViewed(true);
    setShowSavedListings(false);
    await loadRecentlyViewed();
  };

  // Load saved listings count
  const loadSavedListingsCount = async () => {
    try {
      const response = await housingAPI.getSavedListings();
      setSavedListings(response.data.savedListings || []);
    } catch (error) {
      console.error('Error loading saved listings count:', error);
    }
  };

  // Load popular searches on component mount
  useEffect(() => {
    loadPopularSearches();
    loadHousingStats();
    loadExtractedListings();
    loadSavedListingsCount();
  }, []);

  // Load popular searches from API
  const loadPopularSearches = async () => {
    try {
      const response = await housingAPI.getPopularSearches();
      if (response.data?.popularSearches) {
        setPopularSearches(response.data.popularSearches);
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
      // Fallback to default searches
      setPopularSearches([
        'Studio near NEU',
        '2 bedroom apartment',
        'Fenway area',
        'Pet friendly',
        'Under $2000',
        'Furnished apartment'
      ]);
    }
  };

  // Load housing statistics
  const loadHousingStats = async () => {
    try {
      const response = await housingAPI.getHousingStats();
      if (response.data?.overall) {
        setTotalListings(response.data.overall.totalListings || 0);
      }
    } catch (error) {
      console.error('Error loading housing stats:', error);
    }
  };

  // Handle View Saved button click
  const handleViewSaved = () => {
    if (showSavedListings) {
      setShowSavedListings(false);
    } else {
      setShowSavedListings(true);
      loadSavedListings();
    }
  };

  // Handle back to all listings
  const handleBackToAll = () => {
    setShowSavedListings(false);
    setShowRecentlyViewed(false);
  };

  // Handle search with analytics tracking
  const handleSearch = async (value) => {
    if (value.trim()) {
      setSearchQuery(value.trim());
      addRecentSearch(value.trim());
      
      // Clear any existing filters when searching
      setFilters({});
      
      // Track search analytics
      try {
        await analyticsAPI.trackEvent({
          eventType: 'search',
          eventData: {
            query: value.trim(),
            filters: Object.keys(filters).length,
            sortBy,
            sortOrder
          }
        });
      } catch (error) {
        console.error('Error tracking search:', error);
      }
    }
  };

  // Add to recent searches
  const addRecentSearch = (search) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== search);
      return [search, ...filtered].slice(0, 5);
    });
  };

  // Handle search suggestions
  const handleSearchInputChange = async (value) => {
    setSearchQuery(value);
    
    if (value.length >= 2) {
      try {
        const response = await housingAPI.getSearchSuggestions(value);
        if (response.data?.suggestions) {
          setSearchSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        // Fallback to basic suggestions based on popular searches
        const filteredSuggestions = popularSearches.filter(search => 
          search.toLowerCase().includes(value.toLowerCase())
        );
        setSearchSuggestions(filteredSuggestions.slice(0, 5));
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  // Handle filters change with analytics
  const handleFiltersChange = useCallback(async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
    
    // Track filter usage analytics
    try {
      await analyticsAPI.trackEvent({
        eventType: 'filter_applied',
        eventData: {
          filters: Object.keys(newFilters),
          filterValues: newFilters
        }
      });
    } catch (error) {
      console.error('Error tracking filter usage:', error);
    }
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(async () => {
    setFilters({});
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setLoading(true);
    
    // Track filter clear analytics
    try {
      await analyticsAPI.trackEvent({
        eventType: 'filters_cleared',
        eventData: {}
      });
    } catch (error) {
      console.error('Error tracking filter clear:', error);
    }
  }, []);

  // Handle listing actions with analytics
  const handleListingAction = useCallback(async (action, listing, data) => {
    // Track listing action analytics
    try {
      await analyticsAPI.trackEvent({
        eventType: `listing_${action}`,
        eventData: {
          listingId: listing._id,
          listingTitle: listing.title,
          action,
          data
        }
      });
    } catch (error) {
      console.error('Error tracking listing action:', error);
    }

    switch (action) {
      case 'save':
        try {
          if (data) {
            // Save listing
            await housingAPI.saveListing(listing._id);
            message.success('Listing saved to favorites');
            // Refresh saved listings to get the latest data
            await loadSavedListingsCount();
          } else {
            // Unsave listing
            await housingAPI.unsaveListing(listing._id);
            message.success('Listing removed from favorites');
            // Refresh saved listings to get the latest data
            await loadSavedListingsCount();
          }
        } catch (error) {
          console.error('Error saving/unsaving listing:', error);
          message.error('Failed to update saved listing');
        }
        break;
      case 'contact':
        message.info(`Contacting ${listing.title}`);
        break;
      case 'view':
        // Navigate to the listing detail page
        window.location.href = `/housing/${listing._id}`;
        break;
      default:
        break;
    }
  }, []);

  // Get quick stats
  const getQuickStats = () => {
    return {
      totalListings,
      savedCount: savedListings.length || user?.savedListings?.length || 0,
      viewedCount: user?.interactions?.filter(i => i.interactionType === 'view').length || 0
    };
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <Content style={{ padding: '32px' }}>
        {/* Welcome Section */}
        <Card
          style={{
            marginBottom: '32px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: '#374151', margin: 0, fontWeight: 600 }}>
                {getGreeting()}, {user?.firstName || 'Student'}! 👋
              </Title>
              <Text style={{ color: '#6B7280', fontSize: '16px' }}>
                Find your perfect housing near Northeastern University
              </Text>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space direction="vertical" size="large">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>
                    {getQuickStats().totalListings}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Available Listings
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>
                    {getQuickStats().savedCount}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Saved Favorites
                  </div>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Search and Filters Section */}
        <Row gutter={[24, 16]} style={{ marginBottom: '32px' }}>
          {/* Search Bar */}
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                background: '#FFFFFF'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ fontSize: '18px', color: '#374151' }}>
                  Search Housing
                </Text>
              </div>
              
              <Search
                placeholder="Search by location, property type, amenities, or description..."
                enterButton={
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />}
                    style={{ background: '#C8102E', borderColor: '#C8102E' }}
                  >
                    Search
                  </Button>
                }
                size="large"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onSearch={handleSearch}
                style={{ marginBottom: '20px' }}
                allowClear
                onPressEnter={(e) => handleSearch(e.target.value)}
              />

              {/* Search Status */}
              {searchQuery && (
                <div style={{ marginBottom: '20px' }}>
                  <Text style={{ fontSize: '14px', color: '#6B7280' }}>
                    🔍 Searching for: <strong>{searchQuery}</strong>
                  </Text>
                </div>
              )}

              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <Text style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px', display: 'block' }}>
                    Suggestions:
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {searchSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="small"
                        type="text"
                        onClick={() => handleSearch(suggestion)}
                        style={{ 
                          fontSize: '13px',
                          color: '#C8102E',
                          border: '1px solid #C8102E',
                          borderRadius: '16px'
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Search Options */}
              <div style={{ marginBottom: '20px' }}>
                <Text style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px', display: 'block' }}>
                  Popular searches:
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {popularSearches.map((search, index) => (
                    <Button
                      key={index}
                      size="small"
                      type="text"
                      onClick={() => handleSearch(search)}
                      style={{ 
                        fontSize: '13px',
                        color: '#C8102E',
                        border: '1px solid #C8102E',
                        borderRadius: '16px'
                      }}
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <Text style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px', display: 'block' }}>
                    Recent searches:
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        size="small"
                        type="text"
                        onClick={() => handleSearch(search)}
                        style={{ 
                          fontSize: '13px',
                          color: '#6B7280',
                          border: '1px solid #D1D5DB',
                          borderRadius: '16px'
                        }}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Sort and Filter Controls */}
          <Col xs={24} lg={8}>
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                background: '#FFFFFF'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ fontSize: '18px', color: '#374151' }}>
                  Sort & Filter
                </Text>
              </div>

              {/* Sort Options */}
              <div style={{ marginBottom: '20px' }}>
                <Text style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px', display: 'block' }}>
                  Sort by:
                </Text>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  style={{ width: '100%' }}
                >
                  <Option value="createdAt-desc">Newest First</Option>
                  <Option value="createdAt-asc">Oldest First</Option>
                  <Option value="price-asc">Price: Low to High</Option>
                  <Option value="price-desc">Price: High to Low</Option>
                  <Option value="bedrooms-desc">Most Bedrooms</Option>
                  <Option value="bedrooms-asc">Least Bedrooms</Option>
                </Select>
              </div>

              {/* Filter Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                  <Button
                    type={showFilters ? "primary" : "default"}
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      width: '100%',
                      background: showFilters ? '#C8102E' : '#FFFFFF',
                      borderColor: showFilters ? '#C8102E' : '#D1D5DB',
                      color: showFilters ? '#FFFFFF' : '#374151'
                    }}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </Tooltip>
              </div>

              {/* Quick Actions */}
              <div>
                <Text style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px', display: 'block' }}>
                  Quick actions:
                </Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="text"
                    icon={<HeartOutlined />}
                    style={{ width: '100%', textAlign: 'left', color: '#374151' }}
                    onClick={handleViewSaved}
                  >
                    View Saved
                  </Button>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    style={{ width: '100%', textAlign: 'left', color: '#374151' }}
                    onClick={handleShowRecentlyViewed}
                  >
                    Recently Viewed
                  </Button>
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{ width: '100%', textAlign: 'left', color: '#374151' }}
                  >
                    Notifications
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{ marginBottom: '32px' }}>
            <HousingFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              loading={loading}
            />
          </div>
        )}

        {/* Saved Listings Section */}
        {showSavedListings && (
          <div style={{ marginBottom: '32px' }}>
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                background: '#FFFFFF'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space align="center">
                    <HeartOutlined style={{ color: '#C8102E', fontSize: '20px' }} />
                    <Title level={4} style={{ margin: 0, color: '#374151', fontWeight: 600 }}>
                      Saved Listings
                    </Title>
                    <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                      {savedListings.length} listings
                    </Tag>
                  </Space>
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={handleBackToAll}
                    style={{
                      borderColor: '#C8102E',
                      color: '#C8102E'
                    }}
                  >
                    Back to All Listings
                  </Button>
                </Space>
                <Text style={{ color: '#6B7280', display: 'block', marginTop: '8px' }}>
                  Your saved housing listings
                </Text>
              </div>

              {savedListingsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="large" />
                </div>
              ) : savedListings.length === 0 ? (
                <Empty 
                  description="No saved listings yet"
                  style={{ padding: '20px' }}
                >
                  <Text type="secondary">
                    Save listings by clicking the heart icon on any housing card
                  </Text>
                </Empty>
              ) : (
                <Row gutter={[16, 16]}>
                  {savedListings.map((listing) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={listing._id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          height: '100%',
                          background: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        bodyStyle={{ padding: '16px' }}
                      >
                        {/* Image Section */}
                        <div style={{ marginBottom: '12px' }}>
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0].url || listing.images[0]} 
                              alt={listing.title || 'Housing listing'}
                              style={{
                                width: '100%',
                                height: '160px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #F3F4F6'
                              }}
                            />
                          ) : (
                            <div 
                              style={{
                                width: '100%',
                                height: '160px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6B7280'
                              }}
                            >
                              <HomeOutlined style={{ fontSize: '32px' }} />
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '16px', color: '#374151', lineHeight: '1.2' }}>
                            {listing.title || 'Housing Listing'}
                          </Text>
                        </div>
                        
                        {/* Location and Walk Time */}
                        <div style={{ marginBottom: '8px' }}>
                          <Space size="small" style={{ fontSize: '14px', color: '#6B7280' }}>
                            <EnvironmentOutlined style={{ fontSize: '12px' }} />
                            <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                              {listing.location?.neighborhood || listing.location?.address?.split(',')[0] || 'Boston'}
                            </Text>
                            {listing.location?.walkTimeToNEU && (
                              <>
                                <Text style={{ color: '#9CA3AF' }}>•</Text>
                                <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                                  {listing.location.walkTimeToNEU} min walk
                                </Text>
                              </>
                            )}
                          </Space>
                        </div>

                        {/* Property Details */}
                        <div style={{ marginBottom: '8px' }}>
                          <Space size="small" style={{ fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <HomeOutlined style={{ color: '#6B7280', fontSize: '12px' }} />
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {(listing.propertyType || 'apartment').charAt(0).toUpperCase() + (listing.propertyType || 'apartment').slice(1)}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserOutlined style={{ color: '#6B7280', fontSize: '12px' }} />
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {listing.roomType || 'Private'}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {listing.bedrooms || 1} BR
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {listing.bathrooms || 1} Bath
                              </Text>
                            </div>
                          </Space>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ color: '#C8102E', fontSize: '18px', fontWeight: 700 }}>
                            ${listing.price ? listing.price.toLocaleString() : '0'}/month
                          </Text>
                        </div>

                        {/* Description */}
                        {listing.description && (
                          <div style={{ marginBottom: '8px' }}>
                            <Text style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.4' }}>
                              {listing.description.length > 80 
                                ? `${listing.description.substring(0, 80)}...` 
                                : listing.description}
                            </Text>
                          </div>
                        )}

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <Space wrap size="small">
                              {listing.amenities.slice(0, 3).map((amenity, index) => (
                                <Tag key={index} size="small" style={{ 
                                  backgroundColor: '#F3F4F6', 
                                  color: '#374151',
                                  fontSize: '10px',
                                  padding: '2px 6px'
                                }}>
                                  {amenity}
                                </Tag>
                              ))}
                              {listing.amenities.length > 3 && (
                                <Tag size="small" style={{ 
                                  backgroundColor: '#F3F4F6', 
                                  color: '#374151',
                                  fontSize: '10px',
                                  padding: '2px 6px'
                                }}>
                                  +{listing.amenities.length - 3} more
                                </Tag>
                              )}
                            </Space>
                          </div>
                        )}

                        {/* Actions */}
                        <Space style={{ width: '100%' }}>
                          <Button
                            type="primary"
                            size="small"
                            style={{ flex: 1, fontSize: '12px' }}
                            onClick={() => {
                              // Navigate to the listing detail page
                              window.location.href = `/housing/${listing._id}`;
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            type="default"
                            size="small"
                            icon={<HeartFilled />}
                            onClick={() => handleListingAction('save', listing, false)}
                            style={{
                              backgroundColor: '#C8102E',
                              borderColor: '#C8102E',
                              color: '#FFFFFF',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </Button>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </div>
        )}

        {/* Recently Viewed Section */}
        {showRecentlyViewed && (
          <div style={{ marginBottom: '32px' }}>
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                background: '#FFFFFF'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space align="center">
                    <EyeOutlined style={{ color: '#C8102E', fontSize: '20px' }} />
                    <Title level={4} style={{ margin: 0, color: '#374151', fontWeight: 600 }}>
                      Recently Viewed
                    </Title>
                    <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                      {recentlyViewed.length} listings
                    </Tag>
                  </Space>
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={handleBackToAll}
                    style={{
                      borderColor: '#C8102E',
                      color: '#C8102E'
                    }}
                  >
                    Back to All Listings
                  </Button>
                </Space>
                <Text style={{ color: '#6B7280', display: 'block', marginTop: '8px' }}>
                  Your recently viewed housing listings
                </Text>
              </div>

              {recentlyViewedLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="large" />
                </div>
              ) : recentlyViewed.length === 0 ? (
                <Empty 
                  description="No recently viewed listings yet"
                  style={{ padding: '20px' }}
                >
                  <Text type="secondary">
                    View some housing listings to see them here
                  </Text>
                </Empty>
              ) : (
                <Row gutter={[16, 16]}>
                  {recentlyViewed.map((listing) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={listing._id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          height: '100%',
                          background: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        bodyStyle={{ padding: '16px' }}
                      >
                        {/* Image */}
                        <div style={{ marginBottom: '12px' }}>
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0].url || listing.images[0]}
                              alt={listing.title}
                              style={{
                                width: '100%',
                                height: '160px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #F3F4F6'
                              }}
                            />
                          ) : (
                            <div 
                              style={{
                                width: '100%',
                                height: '160px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6B7280'
                              }}
                            >
                              <HomeOutlined style={{ fontSize: '32px' }} />
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '16px', color: '#374151', lineHeight: '1.2' }}>
                            {listing.title || 'Housing Listing'}
                          </Text>
                        </div>
                        
                        {/* Location and Walk Time */}
                        <div style={{ marginBottom: '8px' }}>
                          <Space size="small" style={{ fontSize: '14px', color: '#6B7280' }}>
                            <EnvironmentOutlined style={{ fontSize: '12px' }} />
                            <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                              {listing.location?.neighborhood || listing.location?.address?.split(',')[0] || 'Boston'}
                            </Text>
                            {listing.location?.walkTimeToNEU && (
                              <>
                                <Text style={{ color: '#9CA3AF' }}>•</Text>
                                <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                                  {listing.location.walkTimeToNEU} min walk
                                </Text>
                              </>
                            )}
                          </Space>
                        </div>

                        {/* Property Details */}
                        <div style={{ marginBottom: '8px' }}>
                          <Space size="small" style={{ fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <HomeOutlined style={{ color: '#6B7280', fontSize: '12px' }} />
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {(listing.propertyType || 'apartment').charAt(0).toUpperCase() + (listing.propertyType || 'apartment').slice(1)}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserOutlined style={{ color: '#6B7280', fontSize: '12px' }} />
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {listing.roomType || 'Private'}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {listing.bedrooms || 1} BR
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Text style={{ color: '#374151', fontSize: '12px' }}>
                                {listing.bathrooms || 1} Bath
                              </Text>
                            </div>
                          </Space>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ color: '#C8102E', fontSize: '18px', fontWeight: 700 }}>
                            ${listing.price ? listing.price.toLocaleString() : '0'}/month
                          </Text>
                        </div>

                        {/* Description */}
                        {listing.description && (
                          <div style={{ marginBottom: '8px' }}>
                            <Text style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.4' }}>
                              {listing.description.length > 80 
                                ? `${listing.description.substring(0, 80)}...` 
                                : listing.description}
                            </Text>
                          </div>
                        )}

                        {/* Actions */}
                        <Space style={{ width: '100%' }}>
                          <Button
                            type="primary"
                            size="small"
                            style={{ flex: 1, fontSize: '12px' }}
                            onClick={() => {
                              // Navigate to the listing detail page
                              window.location.href = `/housing/${listing._id}`;
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            type="default"
                            size="small"
                            icon={<HeartOutlined />}
                            onClick={() => handleListingAction('save', listing, true)}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#D1D5DB',
                              color: '#374151',
                              fontSize: '12px'
                            }}
                          >
                            Save
                          </Button>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </div>
        )}

        {/* Housing Listings */}
        {!showSavedListings && !showRecentlyViewed && (
          <div style={{ marginBottom: '32px' }}>
            <HousingList
              filters={filters}
              searchQuery={searchQuery}
              sortBy={sortBy}
              sortOrder={sortOrder}
              pageSize={12}
              showFilters={false}
              onListingAction={handleListingAction}
              className="dashboard-housing-list"
            />
          </div>
        )}

        {/* Extracted Listings Section */}
        {extractedListings.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <Card
              style={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                background: '#FFFFFF'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Space align="center">
                  <RobotOutlined style={{ color: '#C8102E', fontSize: '20px' }} />
                  <Title level={4} style={{ margin: 0, color: '#374151', fontWeight: 600 }}>
                    AI-Extracted Listings
                  </Title>
                  <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                    {extractedListings.length} listings
                  </Tag>
                </Space>
                <Text style={{ color: '#6B7280', display: 'block', marginTop: '8px' }}>
                  Housing listings extracted from your WhatsApp chat uploads
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                {extractedListings.map((listing) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={listing._id}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        height: '100%',
                        background: '#FFFFFF'
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#374151' }}>
                          {listing.title}
                        </Text>
                      </div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                          📍 {listing.location?.address || listing.location}
                        </Text>
                      </div>
                      
                      {listing.price > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '16px', color: '#374151' }}>
                            💰 ${listing.price}/month
                          </Text>
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                          🏘️ {listing.propertyType} • {listing.bedrooms}BR
                        </Text>
                      </div>
                      
                      {listing.confidence && (
                        <div style={{ marginBottom: '8px' }}>
                          <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                            AI Confidence: {Math.round(listing.confidence * 100)}%
                          </Tag>
                        </div>
                      )}
                      
                      <div style={{ marginTop: '12px' }}>
                        <Button
                          type="primary"
                          size="small"
                          style={{
                            backgroundColor: '#C8102E',
                            borderColor: '#C8102E',
                            width: '100%'
                          }}
                          onClick={() => handleListingAction('view', listing)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        )}

        {/* Quick Stats */}
        <Card
          style={{
            borderRadius: '12px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[16, 16]} justify="center">
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>
                  {getQuickStats().totalListings}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Total Listings
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>
                  {getQuickStats().savedCount}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Saved Favorites
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>
                  {getQuickStats().viewedCount}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Recently Viewed
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>
                  {filters && Object.keys(filters).length > 0 ? Object.keys(filters).length : 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Active Filters
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default Dashboard; 
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
  Divider,
  Select,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  HomeOutlined,
  UserOutlined,
  BellOutlined,
  HeartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import HousingList from '../components/housing/HousingList';
import HousingFilters from '../components/housing/HousingFilters';
import { useAuth } from '../contexts/AuthContext';
import { housingAPI, analyticsAPI } from '../services/api';

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

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Load popular searches on component mount
  useEffect(() => {
    loadPopularSearches();
    loadHousingStats();
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

  // Handle search with analytics tracking
  const handleSearch = async (value) => {
    if (value.trim()) {
      setSearchQuery(value.trim());
      addRecentSearch(value.trim());
      
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
        setSearchSuggestions([]);
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
        message.success(data ? 'Listing saved to favorites' : 'Listing removed from favorites');
        break;
      case 'contact':
        // Navigate to chat or open contact modal
        message.info(`Contacting ${listing.title}`);
        break;
      case 'view':
        // Navigate to listing details
        message.info(`Viewing ${listing.title}`);
        break;
      default:
        break;
    }
  }, []);

  // Get quick stats
  const getQuickStats = () => {
    return {
      totalListings,
      savedCount: user?.savedListings?.length || 0,
      viewedCount: user?.interactions?.filter(i => i.interactionType === 'view').length || 0
    };
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        {/* Welcome Section */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #C8102E 0%, #A00020 100%)',
            color: 'white',
            border: 'none'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                {getGreeting()}, {user?.firstName || 'Student'}! 👋
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                Find your perfect housing near Northeastern University
              </Text>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space direction="vertical" size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {getQuickStats().totalListings}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Available Listings
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {getQuickStats().savedCount}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Saved Favorites
                  </div>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Search and Filters Section */}
        <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
          {/* Search Bar */}
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f0f0f0'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  Search Housing
                </Text>
              </div>
              
              <Search
                placeholder="Search by location, property type, amenities..."
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
                style={{ marginBottom: '16px' }}
              />

              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                          fontSize: '12px',
                          color: '#1890ff',
                          border: '1px solid #1890ff',
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
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                        fontSize: '12px',
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
                  <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                          fontSize: '12px',
                          color: '#666',
                          border: '1px solid #d9d9d9',
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
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f0f0f0'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  Sort & Filter
                </Text>
              </div>

              {/* Sort Options */}
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
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
              <div style={{ marginBottom: '16px' }}>
                <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                  <Button
                    type={showFilters ? "primary" : "default"}
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      width: '100%',
                      background: showFilters ? '#C8102E' : undefined,
                      borderColor: showFilters ? '#C8102E' : undefined
                    }}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </Tooltip>
              </div>

              {/* Quick Actions */}
              <div>
                <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Quick actions:
                </Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="text"
                    icon={<HeartOutlined />}
                    style={{ width: '100%', textAlign: 'left', color: '#C8102E' }}
                  >
                    View Saved
                  </Button>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    style={{ width: '100%', textAlign: 'left', color: '#C8102E' }}
                  >
                    Recently Viewed
                  </Button>
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{ width: '100%', textAlign: 'left', color: '#C8102E' }}
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
          <div style={{ marginBottom: '24px' }}>
            <HousingFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              loading={loading}
            />
          </div>
        )}

        {/* Housing Listings */}
        <div style={{ marginBottom: '24px' }}>
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

        {/* Quick Stats Footer */}
        <Card
          style={{
            borderRadius: '12px',
            background: '#f8f9fa',
            border: '1px solid #e9ecef'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} justify="center">
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8102E' }}>
                  {getQuickStats().totalListings}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Total Listings
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8102E' }}>
                  {getQuickStats().savedCount}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Saved Favorites
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8102E' }}>
                  {getQuickStats().viewedCount}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Recently Viewed
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8102E' }}>
                  {filters && Object.keys(filters).length > 0 ? Object.keys(filters).length : 0}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
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
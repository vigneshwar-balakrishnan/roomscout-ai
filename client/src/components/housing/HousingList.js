import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Pagination, Empty, Spin, message, Typography } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import HousingCard from './HousingCard';
import { housingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

const HousingList = ({ 
  filters = {}, 
  searchQuery = '', 
  sortBy = 'createdAt',
  sortOrder = 'desc',
  pageSize = 12,
  showFilters = true,
  onListingAction,
  className = ''
}) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [savedListings, setSavedListings] = useState(new Set());

  // Fetch listings from MongoDB
  const fetchListings = useCallback(async (page = 1, filters = {}, search = '', sort = 'createdAt', order = 'desc') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pageSize,
        sortBy: sort,
        sortOrder: order,
        ...filters
      };

      if (search) {
        params.search = search;
      }

      const response = await housingAPI.getListings(params);
      
      // Handle successful response
      if (response.data) {
        setListings(response.data.listings || []);
        setTotal(response.data.total || 0);
        
        // Update saved listings state
        if (response.data.savedListings) {
          setSavedListings(new Set(response.data.savedListings.map(id => id.toString())));
        }
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load housing listings');
      
      // Show user-friendly error message
      if (error.response?.status === 404) {
        message.error('No listings found matching your criteria');
      } else if (error.response?.status === 500) {
        message.error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        message.error('Network error. Please check your connection.');
      } else {
        message.error('Failed to load housing listings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Load listings on component mount and filter changes
  useEffect(() => {
    fetchListings(currentPage, filters, searchQuery, sortBy, sortOrder);
  }, [fetchListings, currentPage, filters, searchQuery, sortBy, sortOrder]);

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle save/favorite listing
  const handleSaveListing = async (listingId, isSaving) => {
    if (!user) {
      message.warning('Please log in to save listings');
      return;
    }

    try {
      if (isSaving) {
        await housingAPI.saveListing(listingId);
        setSavedListings(prev => new Set([...prev, listingId.toString()]));
        message.success('Listing saved to favorites');
      } else {
        await housingAPI.unsaveListing(listingId);
        setSavedListings(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId.toString());
          return newSet;
        });
        message.success('Listing removed from favorites');
      }

      // Track interaction
      try {
        await housingAPI.addInteraction(listingId, isSaving ? 'save' : 'unsave');
      } catch (interactionError) {
        console.error('Error tracking interaction:', interactionError);
      }

      if (onListingAction) {
        onListingAction('save', listingId, isSaving);
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      
      if (error.response?.status === 401) {
        message.error('Please log in to save listings');
      } else if (error.response?.status === 404) {
        message.error('Listing not found');
      } else {
        message.error('Failed to update listing. Please try again.');
      }
    }
  };

  // Handle contact listing
  const handleContactListing = async (listing) => {
    if (!user) {
      message.warning('Please log in to contact listings');
      return;
    }

    try {
      // Track contact interaction
      await housingAPI.addInteraction(listing._id, 'contact');
      
      // Navigate to chat or open contact modal
      if (onListingAction) {
        onListingAction('contact', listing);
      } else {
        // Default behavior - could open a modal or navigate to chat
        message.info(`Contacting ${listing.title}`);
      }
    } catch (error) {
      console.error('Error contacting listing:', error);
      message.error('Failed to contact listing. Please try again.');
    }
  };

  // Handle view listing details
  const handleViewListing = async (listing) => {
    try {
      // Track view interaction
      await housingAPI.addInteraction(listing._id, 'view');
      
      if (onListingAction) {
        onListingAction('view', listing);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
      // Continue with view action even if tracking fails
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    fetchListings(currentPage, filters, searchQuery, sortBy, sortOrder);
  };

  // Render loading state
  if (loading && listings.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Loading housing listings...
        </div>
      </div>
    );
  }

  // Render error state
  if (error && listings.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          fontSize: '48px', 
          color: '#C8102E', 
          marginBottom: '16px' 
        }}>
          ⚠️
        </div>
        <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
          Unable to Load Listings
        </Title>
        <div style={{ color: '#999', marginBottom: '24px' }}>
          {error}
        </div>
        <button
          onClick={handleRetry}
          style={{
            background: '#C8102E',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ReloadOutlined />
          Try Again
        </button>
      </div>
    );
  }

  // Render empty state
  if (!loading && listings.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <div style={{ color: '#666', marginBottom: '8px' }}>
                No housing listings found
              </div>
              {searchQuery && (
                <div style={{ color: '#999', fontSize: '14px' }}>
                  Try adjusting your search criteria
                </div>
              )}
              {Object.keys(filters).length > 0 && (
                <div style={{ color: '#999', fontSize: '14px' }}>
                  Try adjusting your filters
                </div>
              )}
            </div>
          }
        >
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchListings(1, {}, '', 'createdAt', 'desc');
            }}
            style={{
              background: '#C8102E',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <FilterOutlined />
            Clear Filters
          </button>
        </Empty>
      </div>
    );
  }

  // Calculate responsive grid columns
  const getResponsiveCols = () => {
    return {
      xs: 24,   // 1 column on mobile
      sm: 12,   // 2 columns on small screens
      md: 8,    // 3 columns on medium screens
      lg: 6,    // 4 columns on large screens
      xl: 6,    // 4 columns on extra large screens
      xxl: 4    // 6 columns on extra extra large screens
    };
  };

  return (
    <div className={`housing-list ${className}`}>
      {/* Results summary */}
      {!loading && (
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} of {total} listings
          </div>
          {showFilters && (
            <div style={{ color: '#999', fontSize: '12px' }}>
              {Object.keys(filters).length > 0 && (
                <span>Filters applied: {Object.keys(filters).length}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading overlay for subsequent loads */}
      {loading && listings.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <Spin size="large" />
        </div>
      )}

      {/* Grid of housing cards */}
      <div style={{ position: 'relative' }}>
        <Row gutter={[16, 16]}>
          {listings.map((listing) => (
            <Col key={listing._id} {...getResponsiveCols()}>
              <HousingCard
                listing={{
                  ...listing,
                  isSaved: savedListings.has(listing._id.toString())
                }}
                onSave={handleSaveListing}
                onContact={handleContactListing}
                onView={handleViewListing}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ 
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            style={{
              textAlign: 'center'
            }}
          />
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#666'
        }}>
          <Spin size="small" />
          <span style={{ marginLeft: '8px' }}>Loading more listings...</span>
        </div>
      )}
    </div>
  );
};

export default HousingList; 
import React, { useState, useEffect, useCallback } from 'react';
import { Pagination, Empty, Spin, Typography, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import HousingCard from './HousingCard';
import { housingAPI } from '../../services/api';
import './HousingList.css';

const { Text } = Typography;

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
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        sortBy,
        sortOrder,
        ...filters
      };

      const response = await housingAPI.getListings(params);
      
      if (response.data.success) {
        setListings(response.data.listings);
        setTotal(response.data.total);
      } else {
        setError('Failed to load listings');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, sortBy, sortOrder, filters]);

  // Fetch listings when filters, search, or pagination changes
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSave = async (listingId, isSaved) => {
    try {
      if (isSaved) {
        await housingAPI.saveListing(listingId);
      } else {
        await housingAPI.unsaveListing(listingId);
      }
      
      // Update the listing in the list
      setListings(prev => prev.map(listing => 
        listing._id === listingId 
          ? { ...listing, isSaved: isSaved }
          : listing
      ));
      
      if (onListingAction) {
        onListingAction('save', { _id: listingId }, isSaved);
      }
    } catch (error) {
      console.error('Error saving/unsaving listing:', error);
    }
  };

  const handleContact = (listingId) => {
    const listing = listings.find(l => l._id === listingId);
    if (onListingAction) {
      onListingAction('contact', listing);
    }
  };

  const handleView = (listingId) => {
    const listing = listings.find(l => l._id === listingId);
    if (onListingAction) {
      onListingAction('view', listing);
    }
  };

  const handleRetry = () => {
    fetchListings();
  };

  if (loading && listings.length === 0) {
    return (
      <div className="housing-list-loading">
        <Spin size="large" />
        <Text style={{ color: '#6B7280', marginTop: '16px' }}>
          Loading housing listings...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="housing-list-error">
        <Text style={{ color: '#EF4444', fontSize: '16px' }}>
          {error}
        </Text>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRetry}
          style={{ marginTop: '16px' }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (listings.length === 0 && !loading) {
    return (
      <div className="housing-list-empty">
        <Empty
          description={
            <div>
              <Text style={{ color: '#6B7280', fontSize: '16px' }}>
                No housing listings found
              </Text>
              <br />
              <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                Try adjusting your search criteria or filters
              </Text>
            </div>
          }
          style={{ padding: '48px 0' }}
        />
      </div>
    );
  }

  return (
    <div className={`housing-list ${className}`}>
      {/* Listings */}
      <div className="housing-list-content">
        {listings.map((listing) => (
          <HousingCard
            key={listing._id}
            listing={listing}
            onSave={handleSave}
            onContact={handleContact}
            onView={handleView}
            isSaved={listing.isSaved}
          />
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {loading && listings.length > 0 && (
        <div className="housing-list-loading-more">
          <Spin />
          <Text style={{ color: '#6B7280', marginLeft: '8px' }}>
            Loading more listings...
          </Text>
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="housing-list-pagination">
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} listings`
            }
            style={{
              textAlign: 'center',
              marginTop: '32px'
            }}
          />
        </div>
      )}

      {/* Results summary */}
      {listings.length > 0 && (
        <div className="housing-list-summary">
          <Text style={{ color: '#6B7280', fontSize: '14px' }}>
            Showing {listings.length} of {total} listings
            {searchQuery && ` for "${searchQuery}"`}
          </Text>
        </div>
      )}
    </div>
  );
};

export default HousingList; 
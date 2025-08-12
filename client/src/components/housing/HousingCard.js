import React from 'react';
import { Card, Tag, Button, Space, Typography } from 'antd';
import { 
  HeartOutlined, 
  HeartFilled, 
  EyeOutlined, 
  PhoneOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import './HousingCard.css';

const { Text, Title } = Typography;

const HousingCard = ({ 
  listing, 
  onSave, 
  onContact, 
  onView, 
  isSaved = false,
  compact = false,
  showActions = true 
}) => {
  const {
    _id,
    title,
    description,
    location,
    price,
    bedrooms,
    bathrooms,
    propertyType,
    roomType,
    amenities = [],
    northeasternFeatures = {},
    images = [],
    views = 0,
    createdAt,
    confidence,
    source
  } = listing;

  const isExtracted = source === 'extracted_from_chat';

  const handleSave = () => {
    if (onSave) onSave(_id, !isSaved);
  };

  const handleContact = () => {
    if (onContact) onContact(_id);
  };

  const handleView = () => {
    if (onView) {
      onView(_id);
    } else {
      // Default navigation to listing detail page
      window.location.href = `/housing/${_id}`;
    }
  };

  const getPrimaryImage = () => {
    if (images && images.length > 0) {
      const primaryImage = images.find(img => img.isPrimary) || images[0];
      return primaryImage.url || primaryImage;
    }
    return null;
  };

  const formatPrice = (price) => {
    // Handle null, undefined, or NaN values
    if (!price || isNaN(price)) {
      return 'Price not specified';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getNeighborhoodDisplay = () => {
    if (location?.neighborhood) {
      return location.neighborhood;
    }
    if (location?.address) {
      return location.address.split(',')[0];
    }
    return 'Boston';
  };

  const getWalkTimeDisplay = () => {
    if (location?.walkTimeToNEU) {
      return `${location.walkTimeToNEU} min walk`;
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <Card 
      className={`housing-card ${compact ? 'compact' : ''} ${isExtracted ? 'extracted' : ''}`}
      hoverable
      bodyStyle={{ padding: '24px' }}
      style={{
        marginBottom: '16px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div className="housing-card-content">
        {/* Image Section */}
        <div className="housing-card-image">
          {getPrimaryImage() ? (
            <img 
              src={getPrimaryImage()} 
              alt={title}
              style={{
                width: '280px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '1px solid #F3F4F6'
              }}
            />
          ) : (
            <div 
              style={{
                width: '280px',
                height: '200px',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280'
              }}
            >
              <HomeOutlined style={{ fontSize: '48px' }} />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="housing-card-details">
          {/* Header */}
          <div className="housing-card-header">
            <div className="housing-card-title-section">
              <Title level={4} style={{ margin: 0, color: '#374151', fontWeight: 600 }}>
                {title}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <EnvironmentOutlined style={{ color: '#6B7280', fontSize: '14px' }} />
                <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                  {getNeighborhoodDisplay()}
                </Text>
                {getWalkTimeDisplay() && (
                  <>
                    <Text style={{ color: '#9CA3AF' }}>•</Text>
                    <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                      {getWalkTimeDisplay()}
                    </Text>
                  </>
                )}
              </div>
            </div>
            
            <div className="housing-card-price">
              <Text style={{ fontSize: '24px', fontWeight: 700, color: '#374151' }}>
                {formatPrice(price)}
              </Text>
              <Text style={{ color: '#6B7280', fontSize: '14px' }}>/month</Text>
            </div>
          </div>

          {/* Property Details */}
          <div className="housing-card-property-details">
            <Space size="large" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HomeOutlined style={{ color: '#6B7280' }} />
                <Text style={{ color: '#374151', fontWeight: 500 }}>
                  {(propertyType || 'apartment').charAt(0).toUpperCase() + (propertyType || 'apartment').slice(1)}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserOutlined style={{ color: '#6B7280' }} />
                <Text style={{ color: '#374151', fontWeight: 500 }}>
                  {roomType || 'Private'}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Text style={{ color: '#374151', fontWeight: 500 }}>
                  {bedrooms || 1} BR
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Text style={{ color: '#374151', fontWeight: 500 }}>
                  {bathrooms || 1} Bath
                </Text>
              </div>
            </Space>
          </div>

          {/* Description */}
          <div className="housing-card-description">
            <Text style={{ color: '#6B7280', lineHeight: '1.5' }}>
              {description && description.length > 150 
                ? `${description.substring(0, 150)}...` 
                : description}
            </Text>
            {description && description.length > 150 && (
              <Button
                type="link"
                size="small"
                style={{ 
                  padding: '4px 0', 
                  height: 'auto', 
                  color: '#1e3a8a',
                  fontSize: '12px'
                }}
                onClick={() => {
                  // Navigate to detail page to see full description
                  window.location.href = `/housing/${_id}`;
                }}
              >
                Read More
              </Button>
            )}
          </div>

          {/* Amenities and Features */}
          <div className="housing-card-amenities">
            {amenities.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <Space wrap size="small">
                  {amenities.slice(0, 4).map((amenity, index) => (
                    <Tag 
                      key={index}
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #E5E7EB',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {amenity}
                    </Tag>
                  ))}
                  {amenities.length > 4 && (
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                      +{amenities.length - 4} more
                    </Text>
                  )}
                </Space>
              </div>
            )}
          </div>

          {/* NEU Features */}
          {northeasternFeatures && Object.keys(northeasternFeatures).length > 0 && (
            <div className="housing-card-neu-features">
              <Space wrap size="small">
                {northeasternFeatures.shuttleAccess && (
                  <Tag style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: 'none' }}>
                    Shuttle Access
                  </Tag>
                )}
                {northeasternFeatures.bikeFriendly && (
                  <Tag style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', border: 'none' }}>
                    Bike Friendly
                  </Tag>
                )}
                {northeasternFeatures.studySpaces && (
                  <Tag style={{ backgroundColor: '#D1FAE5', color: '#065F46', border: 'none' }}>
                    Study Spaces
                  </Tag>
                )}
              </Space>
            </div>
          )}

          {/* Confidence Score for Extracted Listings */}
          {isExtracted && confidence && (
            <div style={{ marginTop: '12px' }}>
              <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                AI Confidence: {Math.round(confidence * 100)}%
              </Tag>
            </div>
          )}

          {/* Footer */}
          <div className="housing-card-footer">
            <div className="housing-card-meta">
              <Space size="large">
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                  <EyeOutlined style={{ marginRight: '4px' }} />
                  {views} views
                </Text>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                  <CalendarOutlined style={{ marginRight: '4px' }} />
                  {createdAt ? formatDate(createdAt) : 'Recently'}
                </Text>
              </Space>
            </div>

            {showActions && (
              <div className="housing-card-actions">
                <Space size="small">
                  <Button
                    type={isSaved ? "primary" : "default"}
                    icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleSave}
                    style={{
                      backgroundColor: isSaved ? '#C8102E' : '#FFFFFF',
                      borderColor: isSaved ? '#C8102E' : '#D1D5DB',
                      color: isSaved ? '#FFFFFF' : '#374151'
                    }}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    type="default"
                    icon={<PhoneOutlined />}
                    onClick={handleContact}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D1D5DB',
                      color: '#374151'
                    }}
                  >
                    Contact
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleView}
                    style={{
                      backgroundColor: '#C8102E',
                      borderColor: '#C8102E'
                    }}
                  >
                    View Details
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HousingCard; 
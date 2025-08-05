import React, { useState } from 'react';
import { Card, Tag, Button, Typography, Space, Tooltip } from 'antd';
import { 
  EnvironmentOutlined, 
  HomeOutlined, 
  HeartOutlined, 
  HeartFilled,
  EyeOutlined, 
  MessageOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const HousingCard = ({ listing, onSave, onContact, onView }) => {
  const [isSaved, setIsSaved] = useState(listing.isSaved || false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (onSave) {
        await onSave(listing._id, !isSaved);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact(listing);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(listing);
    } else {
      navigate(`/housing/${listing._id}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAmenityColor = (amenity) => {
    const colorMap = {
      'wifi': 'blue',
      'laundry': 'green',
      'kitchen': 'orange',
      'parking': 'purple',
      'gym': 'red',
      'ac': 'cyan',
      'heating': 'volcano',
      'dishwasher': 'geekblue',
      'balcony': 'lime',
      'elevator': 'magenta',
      'doorman': 'gold',
      'furnished': 'geekblue',
      'utilities_included': 'green',
      'pet_friendly': 'orange',
      'smoke_free': 'green',
      'study_room': 'blue',
      'bike_storage': 'cyan',
      'rooftop_access': 'purple',
      'security_system': 'red'
    };
    return colorMap[amenity] || 'default';
  };

  return (
    <Card
      hoverable
      className="housing-card"
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #f0f0f0',
        overflow: 'hidden'
      }}
      bodyStyle={{
        padding: '16px'
      }}
      cover={
        <div style={{ 
          height: '200px', 
          background: 'linear-gradient(135deg, #C8102E 0%, #A00020 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {listing.images && listing.images.length > 0 ? (
            <img
              alt={listing.title}
              src={listing.images[0].url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ 
              color: 'white', 
              textAlign: 'center',
              fontSize: '14px'
            }}>
              <HomeOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
              <br />
              No Image Available
            </div>
          )}
          
          {/* Save button overlay */}
          <Button
            type="text"
            icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
            onClick={handleSave}
            loading={loading}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              color: isSaved ? '#C8102E' : 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          
          {/* Price overlay */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {formatPrice(listing.price)}/mo
          </div>
        </div>
      }
      actions={[
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={handleView}
            style={{ color: '#C8102E' }}
          >
            View
          </Button>
        </Tooltip>,
        <Tooltip title="Contact Owner">
          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={handleContact}
            style={{ color: '#C8102E' }}
          >
            Contact
          </Button>
        </Tooltip>
      ]}
    >
      <div style={{ marginBottom: '12px' }}>
        <Title level={4} style={{ 
          margin: '0 0 8px 0',
          color: '#333',
          fontSize: '16px',
          lineHeight: '1.4'
        }}>
          {listing.title}
        </Title>
        
        <Space style={{ marginBottom: '8px' }}>
          <Text style={{ color: '#666', fontSize: '12px' }}>
            <EnvironmentOutlined style={{ marginRight: '4px' }} />
            {listing.location?.neighborhood || listing.location?.address}
          </Text>
        </Space>
        
        <Space style={{ marginBottom: '12px' }}>
          <Text style={{ color: '#666', fontSize: '12px' }}>
            <HomeOutlined style={{ marginRight: '4px' }} />
            {listing.bedrooms} bed
          </Text>
          <Text style={{ color: '#666', fontSize: '12px' }}>
            {listing.bathrooms} bath
          </Text>
          {listing.squareFootage && (
            <Text style={{ color: '#666', fontSize: '12px' }}>
              {listing.squareFootage} sq ft
            </Text>
          )}
        </Space>
      </div>

      {/* Property type and room type */}
      <div style={{ marginBottom: '12px' }}>
        <Space>
          <Tag color="#C8102E" style={{ fontSize: '11px' }}>
            {listing.propertyType}
          </Tag>
          <Tag color="#1890ff" style={{ fontSize: '11px' }}>
            {listing.roomType}
          </Tag>
          {listing.rentType && (
            <Tag color="#52c41a" style={{ fontSize: '11px' }}>
              {listing.rentType}
            </Tag>
          )}
        </Space>
      </div>

      {/* Amenities */}
      {listing.amenities && listing.amenities.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px',
            maxHeight: '60px',
            overflow: 'hidden'
          }}>
            {listing.amenities.slice(0, 4).map((amenity, index) => (
              <Tag
                key={index}
                color={getAmenityColor(amenity)}
                style={{ 
                  fontSize: '10px',
                  margin: '0',
                  padding: '2px 6px'
                }}
              >
                {amenity.replace('_', ' ')}
              </Tag>
            ))}
            {listing.amenities.length > 4 && (
              <Tag style={{ 
                fontSize: '10px',
                margin: '0',
                padding: '2px 6px'
              }}>
                +{listing.amenities.length - 4} more
              </Tag>
            )}
          </div>
        </div>
      )}

      {/* Northeastern features */}
      {listing.northeasternFeatures && Object.values(listing.northeasternFeatures).some(Boolean) && (
        <div style={{ marginBottom: '12px' }}>
          <Text style={{ 
            color: '#C8102E', 
            fontSize: '11px',
            fontWeight: '600',
            display: 'block',
            marginBottom: '4px'
          }}>
            NEU Features:
          </Text>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px'
          }}>
            {Object.entries(listing.northeasternFeatures).map(([feature, enabled]) => {
              if (!enabled) return null;
              return (
                <Tag
                  key={feature}
                  color="#C8102E"
                  style={{ 
                    fontSize: '10px',
                    margin: '0',
                    padding: '2px 6px'
                  }}
                >
                  {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Tag>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating and reviews */}
      {listing.averageRating && listing.averageRating > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '8px'
        }}>
          <StarOutlined style={{ 
            color: '#faad14', 
            marginRight: '4px',
            fontSize: '12px'
          }} />
          <Text style={{ 
            color: '#666', 
            fontSize: '12px',
            marginRight: '8px'
          }}>
            {listing.averageRating.toFixed(1)}
          </Text>
          {listing.reviewCount > 0 && (
            <Text style={{ 
              color: '#999', 
              fontSize: '11px'
            }}>
              ({listing.reviewCount} reviews)
            </Text>
          )}
        </div>
      )}

      {/* Status indicator */}
      {listing.status && listing.status !== 'active' && (
        <div style={{ marginTop: '8px' }}>
          <Tag 
            color={listing.status === 'rented' ? 'red' : 'orange'}
            style={{ fontSize: '11px' }}
          >
            {listing.status.toUpperCase()}
          </Tag>
        </div>
      )}
    </Card>
  );
};

export default HousingCard; 
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Tag, 
  Spin, 
  message,
  Row,
  Col,
  Image,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  PhoneOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { housingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const HousingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const loadListing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await housingAPI.getListing(id);
      setListing(response.data.listing);
      setIsSaved(response.data.listing.isSaved || false);
    } catch (error) {
      console.error('Error loading listing:', error);
      message.error('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleSave = async () => {
    try {
      if (isSaved) {
        await housingAPI.unsaveListing(id);
        setIsSaved(false);
        message.success('Listing removed from favorites');
      } else {
        await housingAPI.saveListing(id);
        setIsSaved(true);
        message.success('Listing saved to favorites');
      }
    } catch (error) {
      console.error('Error saving/unsaving listing:', error);
      message.error('Failed to update saved status');
    }
  };

  const handleContact = () => {
    message.info('Contact feature coming soon!');
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <Content style={{ padding: '32px', textAlign: 'center' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '16px' }}>
            Loading listing details...
          </Text>
        </Content>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <Content style={{ padding: '32px', textAlign: 'center' }}>
          <Text>Listing not found</Text>
          <Button 
            type="primary" 
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '16px' }}
          >
            Back to Dashboard
          </Button>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <Content style={{ padding: '32px' }}>
        {/* Back Button */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
          style={{ marginBottom: '24px' }}
        >
          Back to Dashboard
        </Button>

        <Row gutter={[32, 32]}>
          {/* Images */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[0].url || listing.images[0]}
                  alt={listing.title}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              ) : (
                <div 
                  style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
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
            </Card>
          </Col>

          {/* Details */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0, color: '#374151' }}>
                  {listing.title}
                </Title>
                <div style={{ marginTop: '8px' }}>
                  <Space size="small">
                    <EnvironmentOutlined style={{ color: '#6B7280' }} />
                    <Text style={{ color: '#6B7280' }}>
                      {listing.location?.neighborhood || listing.location?.address || 'Boston'}
                    </Text>
                    {listing.location?.walkTimeToNEU && (
                      <>
                        <Text style={{ color: '#9CA3AF' }}>•</Text>
                        <Text style={{ color: '#6B7280' }}>
                          {listing.location.walkTimeToNEU} min walk to NEU
                        </Text>
                      </>
                    )}
                  </Space>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '32px', fontWeight: 700, color: '#C8102E' }}>
                  ${listing.price?.toLocaleString() || '0'}/month
                </Text>
              </div>

              {/* Property Details */}
              <div style={{ marginBottom: '24px' }}>
                <Space size="large">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HomeOutlined style={{ color: '#6B7280' }} />
                    <Text style={{ color: '#374151', fontWeight: 500 }}>
                      {(listing.propertyType || 'apartment').charAt(0).toUpperCase() + (listing.propertyType || 'apartment').slice(1)}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserOutlined style={{ color: '#6B7280' }} />
                    <Text style={{ color: '#374151', fontWeight: 500 }}>
                      {listing.roomType || 'Private'}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Text style={{ color: '#374151', fontWeight: 500 }}>
                      {listing.bedrooms || 1} BR
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Text style={{ color: '#374151', fontWeight: 500 }}>
                      {listing.bathrooms || 1} Bath
                    </Text>
                  </div>
                </Space>
              </div>

              {/* Description */}
              {listing.description && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ margin: 0, marginBottom: '12px' }}>
                    Description
                  </Title>
                  <Text style={{ color: '#6B7280', lineHeight: '1.6' }}>
                    {listing.description}
                  </Text>
                </div>
              )}

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ margin: 0, marginBottom: '12px' }}>
                    Amenities
                  </Title>
                  <Space wrap size="small">
                    {listing.amenities.map((amenity, index) => (
                      <Tag 
                        key={index}
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px'
                        }}
                      >
                        {amenity}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* Actions */}
              <div style={{ marginTop: '32px' }}>
                <Space size="middle">
                  <Button
                    type={isSaved ? "primary" : "default"}
                    icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleSave}
                    size="large"
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
                    size="large"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D1D5DB',
                      color: '#374151'
                    }}
                  >
                    Contact
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HousingDetail; 
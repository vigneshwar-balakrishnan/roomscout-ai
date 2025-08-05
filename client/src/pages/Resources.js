import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  List, 
  Tag, 
  Space, 
  Button,
  Divider,
  Statistic
} from 'antd';
import { 
  BookOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  HomeOutlined,
  SafetyOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const Resources = () => {
  const housingResources = [
    {
      title: 'Northeastern Housing Services',
      description: 'Official university housing information and resources',
      contact: 'housing@northeastern.edu',
      phone: '(617) 373-2814',
      website: 'https://northeastern.edu/housing',
      tags: ['Official', 'On-Campus']
    },
    {
      title: 'Boston Housing Authority',
      description: 'Public housing assistance and rental programs',
      contact: 'info@bostonhousing.org',
      phone: '(617) 988-4000',
      website: 'https://www.bostonhousing.org',
      tags: ['Government', 'Assistance']
    },
    {
      title: 'Northeastern Off-Campus Housing',
      description: 'University-approved off-campus housing listings',
      contact: 'offcampus@northeastern.edu',
      phone: '(617) 373-8480',
      website: 'https://northeastern.edu/offcampus',
      tags: ['University', 'Off-Campus']
    },
    {
      title: 'Boston Student Housing Guide',
      description: 'Comprehensive guide for students in Boston',
      contact: 'info@bostonstudenthousing.com',
      phone: '(617) 555-0123',
      website: 'https://bostonstudenthousing.com',
      tags: ['Guide', 'Student-Focused']
    }
  ];

  const neighborhoods = [
    {
      name: 'Fenway-Kenmore',
      distance: '0.5 miles',
      avgRent: '$2,200',
      description: 'Home to Fenway Park, close to campus, vibrant student life',
      pros: ['Close to campus', 'Lots of restaurants', 'Public transit'],
      cons: ['Higher rent', 'Noisy during games']
    },
    {
      name: 'Roxbury',
      distance: '1.2 miles',
      avgRent: '$1,800',
      description: 'Diverse neighborhood with more affordable options',
      pros: ['More affordable', 'Diverse community', 'Good transit'],
      cons: ['Further from campus', 'Some areas need improvement']
    },
    {
      name: 'Jamaica Plain',
      distance: '2.1 miles',
      avgRent: '$1,900',
      description: 'Green spaces, family-friendly, good for students',
      pros: ['Green spaces', 'Quiet', 'Good restaurants'],
      cons: ['Further commute', 'Limited nightlife']
    },
    {
      name: 'Allston-Brighton',
      distance: '2.5 miles',
      avgRent: '$2,000',
      description: 'Student-heavy area with lots of young people',
      pros: ['Lots of students', 'Good nightlife', 'Affordable'],
      cons: ['Further from NEU', 'Can be noisy']
    }
  ];

  const tips = [
    {
      title: 'Start Early',
      content: 'Begin your housing search 3-4 months before your move-in date. The best options get taken quickly in Boston.',
      icon: <HomeOutlined />
    },
    {
      title: 'Budget Wisely',
      content: 'Aim to spend no more than 30% of your income on rent. Don\'t forget to factor in utilities, internet, and other expenses.',
      icon: <DollarOutlined />
    },
    {
      title: 'Visit in Person',
      content: 'Always visit apartments in person before signing a lease. Photos can be misleading, and you want to check the neighborhood.',
      icon: <SafetyOutlined />
    },
    {
      title: 'Roommate Considerations',
      content: 'Living with roommates can significantly reduce costs. Make sure to discuss expectations, schedules, and shared expenses upfront.',
      icon: <TeamOutlined />
    },
    {
      title: 'Transportation',
      content: 'Consider your commute to campus. The MBTA subway and bus system is extensive, but factor in travel time and costs.',
      icon: <GlobalOutlined />
    },
    {
      title: 'Lease Review',
      content: 'Read your lease carefully before signing. Pay attention to utilities, maintenance, and what\'s included in your rent.',
      icon: <BookOutlined />
    }
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <Card className="neu-card" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: '#C8102E', margin: 0 }}>
              <BookOutlined /> Housing Resources
            </Title>
            <Text type="secondary">
              Essential resources and information for Northeastern University students
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical">
              <Statistic 
                title="Resources Available" 
                value={housingResources.length} 
                prefix={<BookOutlined />}
                valueStyle={{ color: '#C8102E' }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Housing Resources */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="neu-card" title="Housing Resources & Contacts">
            <List
              dataSource={housingResources}
              renderItem={(resource) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{resource.title}</Text>
                        {resource.tags.map(tag => (
                          <Tag key={tag} color={tag === 'Official' ? 'green' : 'blue'}>
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ margin: '8px 0' }}>
                          {resource.description}
                        </Paragraph>
                        <Space wrap>
                          <Button 
                            type="link" 
                            icon={<MailOutlined />}
                            href={`mailto:${resource.contact}`}
                            style={{ padding: 0 }}
                          >
                            {resource.contact}
                          </Button>
                          <Button 
                            type="link" 
                            icon={<PhoneOutlined />}
                            href={`tel:${resource.phone}`}
                            style={{ padding: 0 }}
                          >
                            {resource.phone}
                          </Button>
                          <Button 
                            type="link" 
                            icon={<GlobalOutlined />}
                            href={resource.website}
                            target="_blank"
                            style={{ padding: 0 }}
                          >
                            Visit Website
                          </Button>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="neu-card" title="Quick Stats">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Average Rent Near NEU"
                value={2200}
                prefix={<DollarOutlined />}
                suffix="/month"
                valueStyle={{ color: '#C8102E' }}
              />
              <Statistic
                title="Distance to Campus"
                value={0.8}
                suffix="miles avg"
                valueStyle={{ color: '#C8102E' }}
              />
              <Statistic
                title="Available Listings"
                value={150}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#C8102E' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Neighborhoods */}
      <Card className="neu-card" title="Popular Neighborhoods" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          {neighborhoods.map((neighborhood, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                size="small" 
                title={neighborhood.name}
                extra={<Tag color="blue">{neighborhood.distance}</Tag>}
              >
                <Paragraph style={{ fontSize: '12px', marginBottom: '8px' }}>
                  {neighborhood.description}
                </Paragraph>
                <Text strong style={{ color: '#C8102E' }}>
                  Avg Rent: {neighborhood.avgRent}
                </Text>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text strong style={{ fontSize: '12px' }}>Pros:</Text>
                  <ul style={{ fontSize: '11px', margin: '4px 0' }}>
                    {neighborhood.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Text strong style={{ fontSize: '12px' }}>Cons:</Text>
                  <ul style={{ fontSize: '11px', margin: '4px 0' }}>
                    {neighborhood.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Housing Tips */}
      <Card className="neu-card" title="Housing Tips for NEU Students" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          {tips.map((tip, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card size="small">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ 
                    color: '#C8102E', 
                    fontSize: '20px', 
                    marginRight: '8px' 
                  }}>
                    {tip.icon}
                  </div>
                  <Text strong>{tip.title}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {tip.content}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Emergency Contacts */}
      <Card className="neu-card" title="Emergency Contacts" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" title="NEU Campus Police">
              <Text>Emergency: (617) 373-3333</Text><br />
              <Text>Non-Emergency: (617) 373-2121</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" title="Boston Police">
              <Text>Emergency: 911</Text><br />
              <Text>Non-Emergency: (617) 343-4200</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" title="NEU Health Services">
              <Text>Phone: (617) 373-2772</Text><br />
              <Text>Email: health@northeastern.edu</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Resources; 
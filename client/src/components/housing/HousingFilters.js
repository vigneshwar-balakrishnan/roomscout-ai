import React, { useState, useEffect, useCallback } from 'react';
import { Card, Slider, Select, Button, InputNumber, Typography, Divider, Tag, Tooltip } from 'antd';
import { 
  FilterOutlined, 
  ClearOutlined, 
  DollarOutlined, 
  EnvironmentOutlined,
  HomeOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const HousingFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  onClearFilters,
  loading = false,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState({
    priceMin: filters.priceMin || 0,
    priceMax: filters.priceMax || 5000,
    location: filters.location || [],
    propertyType: filters.propertyType || [],
    roomType: filters.roomType || [],
    bedrooms: filters.bedrooms || [],
    bathrooms: filters.bathrooms || [],
    amenities: filters.amenities || [],
    northeasternFeatures: filters.northeasternFeatures || [],
    rentType: filters.rentType || [],
    moveInDate: filters.moveInDate || null,
    genderPreference: filters.genderPreference || null,
    ...filters
  });

  const [activeFilters, setActiveFilters] = useState(0);

  // Boston neighborhoods
  const neighborhoods = [
    'Allston',
    'Back Bay',
    'Beacon Hill',
    'Brighton',
    'Charlestown',
    'Chinatown',
    'Dorchester',
    'East Boston',
    'Fenway',
    'Jamaica Plain',
    'Leather District',
    'Longwood',
    'Mission Hill',
    'North End',
    'Roslindale',
    'Roxbury',
    'South Boston',
    'South End',
    'West End',
    'West Roxbury'
  ];

  // Property types
  const propertyTypes = [
    'Apartment',
    'House',
    'Condo',
    'Studio',
    'Townhouse',
    'Loft',
    'Duplex',
    'Penthouse',
    'Dorm',
    'Shared Room'
  ];

  // Room types
  const roomTypes = [
    'Single',
    'Double',
    'Triple',
    'Studio',
    '1BR',
    '2BR',
    '3BR',
    '4BR+'
  ];

  // Bedroom options
  const bedroomOptions = [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1 Bedroom' },
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
    { value: 4, label: '4+ Bedrooms' }
  ];

  // Bathroom options
  const bathroomOptions = [
    { value: 1, label: '1 Bathroom' },
    { value: 2, label: '2 Bathrooms' },
    { value: 3, label: '3+ Bathrooms' }
  ];

  // Amenities
  const amenities = [
    'wifi',
    'laundry',
    'kitchen',
    'parking',
    'gym',
    'ac',
    'heating',
    'dishwasher',
    'balcony',
    'elevator',
    'doorman',
    'furnished',
    'utilities_included',
    'pet_friendly',
    'smoke_free',
    'study_room',
    'bike_storage',
    'rooftop_access',
    'security_system'
  ];

  // Northeastern features
  const northeasternFeatures = [
    'nearNEU',
    'studentFriendly',
    'quietStudy',
    'socialAtmosphere',
    'bikeFriendly',
    'transitAccessible',
    'safeNeighborhood',
    'affordableRent',
    'flexibleLease',
    'utilitiesIncluded'
  ];

  // Rent types
  const rentTypes = [
    'monthly',
    'semester',
    'academic_year',
    'summer',
    'flexible'
  ];

  // Gender preferences
  const genderPreferences = [
    { value: 'any', label: 'Any Gender' },
    { value: 'male', label: 'Male Only' },
    { value: 'female', label: 'Female Only' }
  ];

  // Update active filters count
  useEffect(() => {
    let count = 0;
    if (localFilters.priceMin > 0 || localFilters.priceMax < 5000) count++;
    if (localFilters.location.length > 0) count++;
    if (localFilters.propertyType.length > 0) count++;
    if (localFilters.roomType.length > 0) count++;
    if (localFilters.bedrooms.length > 0) count++;
    if (localFilters.bathrooms.length > 0) count++;
    if (localFilters.amenities.length > 0) count++;
    if (localFilters.northeasternFeatures.length > 0) count++;
    if (localFilters.rentType.length > 0) count++;
    if (localFilters.genderPreference) count++;
    if (localFilters.moveInDate) count++;
    
    setActiveFilters(count);
  }, [localFilters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Handle price range change
  const handlePriceChange = (value) => {
    handleFilterChange('priceMin', value[0]);
    handleFilterChange('priceMax', value[1]);
  };

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
  }, [localFilters, onFiltersChange]);

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      priceMin: 0,
      priceMax: 5000,
      location: [],
      propertyType: [],
      roomType: [],
      bedrooms: [],
      bathrooms: [],
      amenities: [],
      northeasternFeatures: [],
      rentType: [],
      moveInDate: null,
      genderPreference: null
    };
    
    setLocalFilters(clearedFilters);
    
    if (onClearFilters) {
      onClearFilters();
    } else if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get amenity display name
  const getAmenityDisplayName = (amenity) => {
    const displayNames = {
      'wifi': 'WiFi',
      'laundry': 'Laundry',
      'kitchen': 'Kitchen',
      'parking': 'Parking',
      'gym': 'Gym',
      'ac': 'Air Conditioning',
      'heating': 'Heating',
      'dishwasher': 'Dishwasher',
      'balcony': 'Balcony',
      'elevator': 'Elevator',
      'doorman': 'Doorman',
      'furnished': 'Furnished',
      'utilities_included': 'Utilities Included',
      'pet_friendly': 'Pet Friendly',
      'smoke_free': 'Smoke Free',
      'study_room': 'Study Room',
      'bike_storage': 'Bike Storage',
      'rooftop_access': 'Rooftop Access',
      'security_system': 'Security System'
    };
    return displayNames[amenity] || amenity.replace('_', ' ');
  };

  // Get NEU feature display name
  const getNEUFeatureDisplayName = (feature) => {
    const displayNames = {
      'nearNEU': 'Near NEU',
      'studentFriendly': 'Student Friendly',
      'quietStudy': 'Quiet Study',
      'socialAtmosphere': 'Social Atmosphere',
      'bikeFriendly': 'Bike Friendly',
      'transitAccessible': 'Transit Accessible',
      'safeNeighborhood': 'Safe Neighborhood',
      'affordableRent': 'Affordable Rent',
      'flexibleLease': 'Flexible Lease',
      'utilitiesIncluded': 'Utilities Included'
    };
    return displayNames[feature] || feature.replace(/([A-Z])/g, l => l.toUpperCase());
  };

  return (
    <Card
      className={`housing-filters ${className}`}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterOutlined style={{ color: '#C8102E' }} />
          <span>Filters</span>
          {activeFilters > 0 && (
            <Tag color="#C8102E" style={{ marginLeft: '8px' }}>
              {activeFilters} active
            </Tag>
          )}
        </div>
      }
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Price Range */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <DollarOutlined style={{ color: '#C8102E', marginRight: '8px' }} />
          <Text strong>Price Range</Text>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <Slider
            range
            min={0}
            max={5000}
            step={50}
            value={[localFilters.priceMin, localFilters.priceMax]}
            onChange={handlePriceChange}
            tipFormatter={(value) => formatPrice(value)}
            style={{ marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>Min</Text>
              <InputNumber
                value={localFilters.priceMin}
                onChange={(value) => handleFilterChange('priceMin', value)}
                min={0}
                max={localFilters.priceMax}
                formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>Max</Text>
              <InputNumber
                value={localFilters.priceMax}
                onChange={(value) => handleFilterChange('priceMax', value)}
                min={localFilters.priceMin}
                max={5000}
                formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Location */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <EnvironmentOutlined style={{ color: '#C8102E', marginRight: '8px' }} />
          <Text strong>Location</Text>
        </div>
        <Select
          mode="multiple"
          placeholder="Select neighborhoods"
          value={localFilters.location}
          onChange={(value) => handleFilterChange('location', value)}
          style={{ width: '100%' }}
          maxTagCount="responsive"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {neighborhoods.map(neighborhood => (
            <Option key={neighborhood} value={neighborhood}>
              {neighborhood}
            </Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Property Type */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <HomeOutlined style={{ color: '#C8102E', marginRight: '8px' }} />
          <Text strong>Property Type</Text>
        </div>
        <Select
          mode="multiple"
          placeholder="Select property types"
          value={localFilters.propertyType}
          onChange={(value) => handleFilterChange('propertyType', value)}
          style={{ width: '100%' }}
          maxTagCount="responsive"
        >
          {propertyTypes.map(type => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Room Type */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <HomeOutlined style={{ color: '#C8102E', marginRight: '8px' }} />
          <Text strong>Room Type</Text>
        </div>
        <Select
          mode="multiple"
          placeholder="Select room types"
          value={localFilters.roomType}
          onChange={(value) => handleFilterChange('roomType', value)}
          style={{ width: '100%' }}
          maxTagCount="responsive"
        >
          {roomTypes.map(type => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Bedrooms & Bathrooms */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <HomeOutlined style={{ color: '#C8102E', marginRight: '8px' }} />
          <Text strong>Bedrooms & Bathrooms</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <Select
            mode="multiple"
            placeholder="Bedrooms"
            value={localFilters.bedrooms}
            onChange={(value) => handleFilterChange('bedrooms', value)}
            style={{ flex: 1 }}
            maxTagCount="responsive"
          >
            {bedroomOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            placeholder="Bathrooms"
            value={localFilters.bathrooms}
            onChange={(value) => handleFilterChange('bathrooms', value)}
            style={{ flex: 1 }}
            maxTagCount="responsive"
          >
            {bathroomOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Amenities */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <SettingOutlined style={{ color: '#C8102E', marginRight: '8px' }} />
          <Text strong>Amenities</Text>
        </div>
        <Select
          mode="multiple"
          placeholder="Select amenities"
          value={localFilters.amenities}
          onChange={(value) => handleFilterChange('amenities', value)}
          style={{ width: '100%' }}
          maxTagCount="responsive"
          showSearch
          filterOption={(input, option) =>
            getAmenityDisplayName(option.value).toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {amenities.map(amenity => (
            <Option key={amenity} value={amenity}>
              {getAmenityDisplayName(amenity)}
            </Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Northeastern Features */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Text strong style={{ color: '#C8102E' }}>NEU Features</Text>
        </div>
        <Select
          mode="multiple"
          placeholder="Select NEU features"
          value={localFilters.northeasternFeatures}
          onChange={(value) => handleFilterChange('northeasternFeatures', value)}
          style={{ width: '100%' }}
          maxTagCount="responsive"
          showSearch
          filterOption={(input, option) =>
            getNEUFeatureDisplayName(option.value).toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {northeasternFeatures.map(feature => (
            <Option key={feature} value={feature}>
              {getNEUFeatureDisplayName(feature)}
            </Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Rent Type & Gender Preference */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Text strong>Additional Options</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <Select
            mode="multiple"
            placeholder="Rent type"
            value={localFilters.rentType}
            onChange={(value) => handleFilterChange('rentType', value)}
            style={{ flex: 1 }}
            maxTagCount="responsive"
          >
            {rentTypes.map(type => (
              <Option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Gender preference"
            value={localFilters.genderPreference}
            onChange={(value) => handleFilterChange('genderPreference', value)}
            style={{ flex: 1 }}
            allowClear
          >
            {genderPreferences.map(pref => (
              <Option key={pref.value} value={pref.value}>
                {pref.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        marginTop: '24px'
      }}>
        <Button
          type="primary"
          onClick={handleApplyFilters}
          loading={loading}
          style={{
            background: '#C8102E',
            borderColor: '#C8102E',
            flex: 1
          }}
        >
          Apply Filters
        </Button>
        <Tooltip title="Clear all filters">
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            disabled={activeFilters === 0}
            style={{ minWidth: '48px' }}
          />
        </Tooltip>
      </div>

      {/* Active Filters Summary */}
      {activeFilters > 0 && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            Active filters: {activeFilters}
          </Text>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px',
            marginTop: '8px'
          }}>
            {localFilters.priceMin > 0 && (
              <Tag size="small" color="blue">
                Min: {formatPrice(localFilters.priceMin)}
              </Tag>
            )}
            {localFilters.priceMax < 5000 && (
              <Tag size="small" color="blue">
                Max: {formatPrice(localFilters.priceMax)}
              </Tag>
            )}
            {localFilters.location.map(loc => (
              <Tag key={loc} size="small" color="green">
                {loc}
              </Tag>
            ))}
            {localFilters.propertyType.map(type => (
              <Tag key={type} size="small" color="orange">
                {type}
              </Tag>
            ))}
            {localFilters.amenities.map(amenity => (
              <Tag key={amenity} size="small" color="purple">
                {getAmenityDisplayName(amenity)}
              </Tag>
            ))}
            {localFilters.northeasternFeatures.map(feature => (
              <Tag key={feature} size="small" color="#C8102E">
                {getNEUFeatureDisplayName(feature)}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default HousingFilters; 
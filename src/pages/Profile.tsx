import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge } from '../components/ui';
import { User, Edit2, Save, X, Calendar, MapPin } from 'lucide-react';
import { mockUsers, mockBookings } from '../data/mockData';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

  // Mock current user - in real app this would come from auth context
  const currentUser = mockUsers[2]; // Elena Rodriguez
  const userBookings = mockBookings.filter(booking => booking.user.id === currentUser.id);

  const [profileData, setProfileData] = useState({
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: currentUser.email,
    phone: '+1 (555) 987-6543',
    bio: 'Travel enthusiast and photography lover. Always seeking the perfect blend of luxury and adventure.',
    location: 'Barcelona, Spain',
  });

  const [editData, setEditData] = useState(profileData);

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    // In real app, this would make an API call to update the profile
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'bookings' as const, label: 'My Bookings', icon: Calendar },
  ];

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              My <span className="font-bold text-gold">Profile</span>
            </h1>
            <p className="text-xl text-charcoal">
              Manage your account settings and view your booking history
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-warm-gray rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-navy shadow-md'
                    : 'text-charcoal hover:text-navy'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Summary Card */}
              <div className="lg:col-span-1">
                <Card variant="default" className="p-6 text-center">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h2 className="text-xl font-semibold text-navy mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-charcoal mb-4">{profileData.location}</p>

                  <div className="flex justify-center space-x-4 text-sm text-charcoal">
                    <div className="text-center">
                      <div className="font-semibold text-navy">{userBookings.length}</div>
                      <div>Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-navy">4.9</div>
                      <div>Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-navy">2</div>
                      <div>Years</div>
                    </div>
                  </div>

                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card variant="default" className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-navy">
                      {isEditing ? 'Edit Profile' : 'Profile Information'}
                    </h3>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} variant="primary" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        value={isEditing ? editData.firstName : profileData.firstName}
                        onChange={(value) => setEditData(prev => ({ ...prev, firstName: value }))}
                        disabled={!isEditing}
                      />
                      <Input
                        label="Last Name"
                        value={isEditing ? editData.lastName : profileData.lastName}
                        onChange={(value) => setEditData(prev => ({ ...prev, lastName: value }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <Input
                      type="email"
                      label="Email Address"
                      value={isEditing ? editData.email : profileData.email}
                      onChange={(value) => setEditData(prev => ({ ...prev, email: value }))}
                      disabled={!isEditing}
                    />

                    <Input
                      label="Phone Number"
                      value={isEditing ? editData.phone : profileData.phone}
                      onChange={(value) => setEditData(prev => ({ ...prev, phone: value }))}
                      disabled={!isEditing}
                    />

                    <Input
                      label="Location"
                      value={isEditing ? editData.location : profileData.location}
                      onChange={(value) => setEditData(prev => ({ ...prev, location: value }))}
                      disabled={!isEditing}
                    />

                    {/* Bio Section */}
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white font-medium text-charcoal placeholder-gray-400 resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-charcoal leading-relaxed p-4 bg-warm-gray rounded-xl">
                          {profileData.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-navy">My Bookings</h3>
                <Badge variant="info" className="bg-gold text-navy">
                  {userBookings.length} Total
                </Badge>
              </div>

              {userBookings.length === 0 ? (
                <Card variant="default" className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gold mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy mb-2">No Bookings Yet</h3>
                  <p className="text-charcoal mb-6">
                    You haven't made any bookings yet. Start exploring our amazing properties!
                  </p>
                  <Button variant="primary">
                    Browse Properties
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {userBookings.map((booking) => (
                    <Card key={booking.id} variant="elevated" className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Property Image */}
                        <div className="lg:w-48 lg:flex-shrink-0">
                          <img
                            src={booking.property.images[0]}
                            alt={booking.property.title}
                            className="w-full h-32 lg:h-32 object-cover rounded-xl"
                          />
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-semibold text-navy mb-1">
                                {booking.property.title}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-charcoal">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.property.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant={getStatusColor(booking.status)} className="capitalize">
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-warm-gray rounded-lg">
                              <div className="text-lg font-semibold text-navy">{booking.guests}</div>
                              <div className="text-sm text-charcoal">Guests</div>
                            </div>
                            <div className="text-center p-3 bg-warm-gray rounded-lg">
                              <div className="text-lg font-semibold text-navy">
                                ${(booking.totalPrice / (booking.guests * Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(0)}
                              </div>
                              <div className="text-sm text-charcoal">Per Night</div>
                            </div>
                            <div className="text-center p-3 bg-warm-gray rounded-lg">
                              <div className="text-lg font-semibold text-navy">${booking.totalPrice}</div>
                              <div className="text-sm text-charcoal">Total</div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {booking.status === 'confirmed' && (
                              <Button variant="primary" size="sm">
                                Manage Booking
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

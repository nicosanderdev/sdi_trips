import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge } from '../components/ui';
import { User, Edit2, Save, X, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getMemberProfile, updateMemberProfile } from '../services/memberService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { User as UserType } from '../types';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Mock bookings for now - will be replaced with real API later
  const userBookings: any[] = [];

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
  });

  const [editData, setEditData] = useState(profileData);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const memberProfile = await getMemberProfile(user.id);

        if (memberProfile) {
          const profileInfo = {
            firstName: memberProfile.name.split(' ')[0] || '',
            lastName: memberProfile.name.split(' ').slice(1).join(' ') || '',
            email: memberProfile.email,
            phone: '', // TODO: Add phone to member profile
            bio: 'Travel enthusiast and photography lover. Always seeking the perfect blend of luxury and adventure.', // TODO: Add bio to member profile
            location: 'Barcelona, Spain', // TODO: Add location to member profile
          };
          setProfileData(profileInfo);
          setEditData(profileInfo);
          setCurrentUser(memberProfile);
        } else {
          // User exists but no member profile - this shouldn't happen with the trigger
          setError(t('profile.errors.profileInfoNotFound'));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(t('profile.errors.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setUpdateError(null);
      setUpdateSuccess(false);

      const updateData = {
        FirstName: editData.firstName,
        LastName: editData.lastName,
        Phone: editData.phone,
      };

      await updateMemberProfile(user.id, updateData);
      setProfileData(editData);
      setIsEditing(false);
      setUpdateSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(t('profile.errors.failedToUpdate'));
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setUpdateError(null);
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
    { id: 'profile' as const, label: t('profile.tabs.profile'), icon: User },
    { id: 'bookings' as const, label: t('profile.tabs.myBookings'), icon: Calendar },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ErrorMessage message={error} />
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy mb-4">{t('profile.errors.profileNotFound')}</h1>
            <p className="text-charcoal mb-4">{t('profile.errors.tryLoggingInAgain')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              <span className="font-bold text-gold">{t('profile.header.title')}</span>
            </h1>
            <p className="text-xl text-charcoal">
              {t('profile.header.subtitle')}
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
                      <div>{t('profile.profileTab.stats.bookings')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-navy">4.9</div>
                      <div>{t('profile.profileTab.stats.rating')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-navy">2</div>
                      <div>{t('profile.profileTab.stats.years')}</div>
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
                      {t('profile.profileTab.editProfile')}
                    </Button>
                  )}
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card variant="default" className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-navy">
                      {isEditing ? t('profile.profileTab.editProfile') : t('profile.profileTab.profileInformation')}
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

                  {/* Success/Error Messages */}
                  {updateSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      {t('profile.profileTab.updatedSuccessfully')}
                    </div>
                  )}
                  {updateError && (
                    <ErrorMessage message={updateError} />
                  )}

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label={t('auth.firstName')}
                        value={isEditing ? editData.firstName : profileData.firstName}
                        onChange={(value) => setEditData(prev => ({ ...prev, firstName: value }))}
                        disabled={!isEditing}
                      />
                      <Input
                        label={t('auth.lastName')}
                        value={isEditing ? editData.lastName : profileData.lastName}
                        onChange={(value) => setEditData(prev => ({ ...prev, lastName: value }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <Input
                      type="email"
                      label={t('auth.emailAddress')}
                      value={isEditing ? editData.email : profileData.email}
                      onChange={(value) => setEditData(prev => ({ ...prev, email: value }))}
                      disabled={!isEditing}
                    />

                    <Input
                      label={t('profile.profileTab.form.phoneNumber')}
                      value={isEditing ? editData.phone : profileData.phone}
                      onChange={(value) => setEditData(prev => ({ ...prev, phone: value }))}
                      disabled={!isEditing}
                    />

                    <Input
                      label={t('profile.profileTab.form.location')}
                      value={isEditing ? editData.location : profileData.location}
                      onChange={(value) => setEditData(prev => ({ ...prev, location: value }))}
                      disabled={!isEditing}
                    />

                    {/* Bio Section */}
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        {t('profile.profileTab.form.bio')}
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white font-medium text-charcoal placeholder-gray-400 resize-none"
                          placeholder={t('profile.profileTab.form.bioPlaceholder')}
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
                <h3 className="text-2xl font-semibold text-navy">{t('profile.bookingsTab.title')}</h3>
                <Badge variant="info" className="bg-gold text-navy">
                  {userBookings.length} {t('profile.bookingsTab.total')}
                </Badge>
              </div>

              {userBookings.length === 0 ? (
                <Card variant="default" className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gold mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy mb-2">{t('profile.bookingsTab.emptyState.title')}</h3>
                  <p className="text-charcoal mb-6">
                    {t('profile.bookingsTab.emptyState.message')}
                  </p>
                  <Button variant="primary">
                    {t('profile.bookingsTab.emptyState.browseProperties')}
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
                              {t(`profile.bookingsTab.status.${booking.status}`)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-warm-gray rounded-lg">
                              <div className="text-lg font-semibold text-navy">{booking.guests}</div>
                              <div className="text-sm text-charcoal">{t('profile.bookingsTab.guests')}</div>
                            </div>
                            <div className="text-center p-3 bg-warm-gray rounded-lg">
                              <div className="text-lg font-semibold text-navy">
                                ${(booking.totalPrice / (booking.guests * Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(0)}
                              </div>
                              <div className="text-sm text-charcoal">{t('profile.bookingsTab.perNight')}</div>
                            </div>
                            <div className="text-center p-3 bg-warm-gray rounded-lg">
                              <div className="text-lg font-semibold text-navy">${booking.totalPrice}</div>
                              <div className="text-sm text-charcoal">{t('profile.bookingsTab.total')}</div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" size="sm">
                              {t('profile.bookingsTab.viewDetails')}
                            </Button>
                            {booking.status === 'confirmed' && (
                              <Button variant="primary" size="sm">
                                {t('profile.bookingsTab.manageBooking')}
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

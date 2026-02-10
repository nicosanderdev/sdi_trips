import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge, MFAEnrollmentModal, Tooltip } from '../components/ui';
import { User, Edit2, Save, X, Calendar, MapPin, Shield, ShieldCheck, Info, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getMemberProfile, updateMemberProfile, uploadProfilePicture, requestEmailChange, verifyEmailChange, requestPhoneChange, verifyPhoneChange, updateMFAStatus } from '../services/memberService';
import { getUserBookingsCount } from '../services/bookingService';
import { enrollMFA, verifyMFAEnrollment, listMFAFactors, unenrollMFA } from '../services/mfaService';
import { Modal, VerificationModal } from '../components/ui';
import type { MFAFactor, MFAEnrollment } from '../types';
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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [userBookingsCount, setUserBookingsCount] = useState(0);
  const [accountAge, setAccountAge] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [showPhoneConfirmation, setShowPhoneConfirmation] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');

  // MFA state
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([]);
  const [mfaEnrollmentData, setMfaEnrollmentData] = useState<MFAEnrollment | null>(null);
  const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);

  // File input ref for camera button
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setOriginalEmail(memberProfile.email);
          setOriginalPhone(''); // TODO: Fetch from Members table when phone is added

          // Fetch user bookings count
          const bookingsCount = await getUserBookingsCount(user.id);
          setUserBookingsCount(bookingsCount);

          // Calculate account age
          if (memberProfile.created_at) {
            const createdDate = new Date(memberProfile.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - createdDate.getTime());
            const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
            const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

            if (diffYears >= 1) {
              setAccountAge(`${diffYears} ${t('profile.profileTab.stats.years').toLowerCase()}`);
            } else {
              setAccountAge(`${diffMonths} ${t('profile.profileTab.stats.memberSince').toLowerCase()}`);
            }
          }
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

  // Load MFA factors
  const loadMFAFactors = async () => {
    if (!user) return;

    try {
      const factors = await listMFAFactors();
      setMfaFactors(factors);
    } catch (error) {
      console.error('Error loading MFA factors:', error);
    }
  };

  // Load MFA factors when component mounts
  useEffect(() => {
    if (user) {
      loadMFAFactors();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Check if email has changed
    if (editData.email !== originalEmail) {
      setPendingEmail(editData.email);
      setShowEmailConfirmation(true);
      return;
    }

    // Check if phone has changed and 2FA is enabled
    if (editData.phone !== originalPhone && mfaFactors.length > 0) {
      setPendingPhone(editData.phone);
      setShowPhoneConfirmation(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
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
      setOriginalEmail(editData.email);
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingPhoto(true);
      setUpdateError(null);

      const newAvatarUrl = await uploadProfilePicture(user.id, file);

      // Update the current user state with new avatar
      setCurrentUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to upload profile picture');
    } finally {
      setIsUploadingPhoto(false);
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmailConfirmation = () => {
    setShowEmailConfirmation(false);
    setShowEmailVerification(true);
  };

  const handleEmailVerification = async (code: string) => {
    if (!user) return;

    try {
      await verifyEmailChange(user.id, code);
      setShowEmailVerification(false);
      await performSave();
    } catch (error) {
      throw error; // Let VerificationModal handle the error
    }
  };

  const handleEmailVerificationResend = async () => {
    if (!user || !pendingEmail) return;

    try {
      await requestEmailChange(user.id, pendingEmail);
    } catch (error) {
      throw error;
    }
  };

  const handleCancelEmailChange = () => {
    setShowEmailConfirmation(false);
    setShowEmailVerification(false);
    setPendingEmail('');
    setEditData(prev => ({ ...prev, email: originalEmail }));
  };

  const handlePhoneConfirmation = () => {
    setShowPhoneConfirmation(false);
    setShowPhoneVerification(true);
  };

  const handlePhoneVerification = async (code: string) => {
    if (!user) return;

    try {
      await verifyPhoneChange(user.id, code);
      setShowPhoneVerification(false);
      await performSave();
    } catch (error) {
      throw error; // Let VerificationModal handle the error
    }
  };

  const handlePhoneVerificationResend = async () => {
    if (!user || !pendingPhone) return;

    try {
      await requestPhoneChange(user.id, pendingPhone);
    } catch (error) {
      throw error;
    }
  };

  const handleCancelPhoneChange = () => {
    setShowPhoneConfirmation(false);
    setShowPhoneVerification(false);
    setPendingPhone('');
    setEditData(prev => ({ ...prev, phone: originalPhone }));
  };

  // MFA handlers
  const handleEnableMFA = async () => {
    if (!user) return;

    try {
      setMfaLoading(true);
      const enrollment = await enrollMFA();
      setMfaEnrollmentData(enrollment);
      setShowMFAEnrollment(true);
    } catch (error) {
      console.error('Error starting MFA enrollment:', error);
      setUpdateError(t('mfa.enrollment.error'));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMFAEnrollmentVerify = async (code: string) => {
    if (!user || !mfaEnrollmentData) return;

    try {
      await verifyMFAEnrollment(mfaEnrollmentData.id, code);
      await updateMFAStatus(user.id, true);
      setShowMFAEnrollment(false);
      setMfaEnrollmentData(null);
      await loadMFAFactors();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      throw error;
    }
  };

  const handleDisableMFA = async (factorId: string) => {
    if (!user) return;

    const confirmed = window.confirm(t('mfa.management.unenrollConfirm'));
    if (!confirmed) return;

    try {
      setMfaLoading(true);
      await unenrollMFA(factorId);
      await updateMFAStatus(user.id, false);
      await loadMFAFactors();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error disabling MFA:', error);
      setUpdateError('Failed to disable 2FA. Please try again.');
    } finally {
      setMfaLoading(false);
    }
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
                  <div className="relative inline-block mb-4">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                    {isEditing && (
                      <button
                        onClick={handleCameraClick}
                        disabled={isUploadingPhoto}
                        className="absolute -bottom-2 -right-2 bg-gold hover:bg-gold-dark text-white p-2 rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('profile.profileTab.changePhoto')}
                      >
                        {isUploadingPhoto ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-navy mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-charcoal mb-4">{profileData.location}</p>

                  {/* Verification Status Card */}
                  <div className="bg-warm-gray rounded-lg pt-4 mb-2">
                    <h4 className="text-sm font-semibold text-navy mb-3">
                      {t('profile.verification.security')}
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-charcoal">
                        {t('profile.verification.emailVerifiedText')}:
                      </span>
                      <Badge
                        variant={user?.email_confirmed_at ? 'success' : 'warning'}
                        size="sm"
                      >
                        {user?.email_confirmed_at
                          ? t('profile.verification.emailVerified')
                          : t('profile.verification.emailNotVerified')
                        }
                      </Badge>
                    </div>
                  </div>

                  {/* MFA Management */}
                  <div className="bg-warm-gray rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-navy">
                        {t('profile.verification.twoFactorEnabledText')}	
                      </h4>
                      <Tooltip content={t('mfa.tooltip')}>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help" />
                      </Tooltip>
                    </div>
                    {mfaFactors.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-charcoal">
                              {t('mfa.management.enrolled')} ({mfaFactors.length})
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisableMFA(mfaFactors[0].id)}
                            disabled={mfaLoading}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            {t('mfa.disable')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-charcoal">
                            {t('profile.verification.twoFactorDisabled')}
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleEnableMFA}
                          disabled={mfaLoading}
                        >
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          {mfaLoading ? 'Enabling...' : t('mfa.enable')}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4 text-sm text-charcoal">
                    <div className="text-center">
                      <div className="font-semibold text-navy">{userBookingsCount}</div>
                      <div>{t('profile.profileTab.stats.bookings')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-navy">4.9</div>
                      <div>{t('profile.profileTab.stats.rating')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-navy">{accountAge}</div>
                      <div>{t('profile.profileTab.stats.memberSince')}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card variant="default" className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-navy">
                      {isEditing ? t('profile.profileTab.editProfile') : t('profile.profileTab.profileInformation')}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSave} variant="primary" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            {t('profile.profileTab.saveChanges')}
                          </Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            {t('profile.profileTab.cancelEdit')}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t('profile.profileTab.editProfile')}
                        </Button>
                      )}
                    </div>
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

      {/* Email Change Confirmation Modal */}
      <Modal
        isOpen={showEmailConfirmation}
        onClose={handleCancelEmailChange}
        title={t('profile.modals.emailChange.title')}
      >
        <div className="space-y-4">
          <p className="text-charcoal">
            {t('profile.modals.emailChange.message')} <strong>{pendingEmail}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancelEmailChange}>
              {t('profile.modals.emailChange.cancel')}
            </Button>
            <Button onClick={handleEmailConfirmation}>
              {t('profile.modals.emailChange.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Verification Modal */}
      <VerificationModal
        isOpen={showEmailVerification}
        onClose={handleCancelEmailChange}
        onVerify={handleEmailVerification}
        onResend={handleEmailVerificationResend}
        title={t('profile.modals.verification.emailTitle')}
        description={t('profile.modals.verification.emailDescription')}
        targetValue={pendingEmail}
      />

      {/* Phone Change Confirmation Modal */}
      <Modal
        isOpen={showPhoneConfirmation}
        onClose={handleCancelPhoneChange}
        title={t('profile.modals.phoneChange.title')}
      >
        <div className="space-y-4">
          <p className="text-charcoal">
            {t('profile.modals.phoneChange.message')}
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancelPhoneChange}>
              {t('profile.modals.phoneChange.cancel')}
            </Button>
            <Button onClick={handlePhoneConfirmation}>
              {t('profile.modals.phoneChange.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Phone Verification Modal */}
      <VerificationModal
        isOpen={showPhoneVerification}
        onClose={handleCancelPhoneChange}
        onVerify={handlePhoneVerification}
        onResend={handlePhoneVerificationResend}
        title={t('profile.modals.verification.phoneTitle')}
        description={t('profile.modals.verification.phoneDescription')}
        targetValue={pendingPhone}
      />

      {/* MFA Enrollment Modal */}
      <MFAEnrollmentModal
        isOpen={showMFAEnrollment}
        onClose={() => {
          setShowMFAEnrollment(false);
          setMfaEnrollmentData(null);
        }}
        enrollmentData={mfaEnrollmentData}
        onVerify={handleMFAEnrollmentVerify}
      />
    </Layout>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useUserProfile, useUpdateProfile, useUploadDocuments } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/slices/authSlice';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../../components/common/Spinner/LoadingSpinner';
import type { ProfileUpdatePayload, DocumentUploadPayload } from '../../types/profile.types';

export const ProfileTab: React.FC = () => {
  const { serviceProvider } = useAuthStore();
  const userId = serviceProvider?.id;
  
  // Fetch user profile using ID from JWT
  const { data: userProfile, isLoading, refetch } = useUserProfile(userId);
  const updateProfile = useUpdateProfile();
  const uploadDocuments = useUploadDocuments();
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    providerType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'BUSINESS',
    idNumber: '',
    businessRegistrationNumber: '', 
    taxId: '',
    businessAddress: '',
    postalCode: '',
    websiteUrl: '',
    primaryColor: '#318BFA',
    secondaryColor: '#D0D9D9',
    instagram: '',
    facebook: '',
    tiktok: '',
    twitterX: '',
    emailNotifications: false,
    rsvpNotifications: false,
    eventApprovalNotifications: false,
    weeklyReports: false,
    smsNotifications: false,
  });

  // Track initial form data for dirty checking
  const [initialFormData, setInitialFormData] = useState(formData);

  // Document files
  const [documents, setDocuments] = useState<{
    logo: File | null;
    coverImage: File | null;
    nationalId: File | null; 
    businessRegistrationCert: File | null; 
    taxRegistrationCert: File | null;
  }>({
    logo: null,
    coverImage: null,
    nationalId: null,
    businessRegistrationCert: null,
    taxRegistrationCert: null,
  });

  // Preview URLs
  const [previews, setPreviews] = useState({
    logo: '',
    coverImage: '',
  });

  // Profile completion percentage
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Initialize form with user data
  useEffect(() => {
    if (userProfile) {
      const sp = userProfile.serviceProvider;
      
      const formValues = {
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        description: '', // Not in API response - you may need to add this to backend
        providerType: (sp.serviceProviderType as 'INDIVIDUAL' | 'BUSINESS') || 'INDIVIDUAL',
        idNumber: sp.idNumber || '',
        businessRegistrationNumber: sp.businessRegistrationNumber || '',
        taxId: sp.taxPin || '',
        businessAddress: sp.locationDetail?.businessAddress || '',
        postalCode: sp.locationDetail?.postalCode || '',
        websiteUrl: sp.locationDetail?.websiteUrl || '',
        primaryColor: sp.brandIdentity?.primaryColor || '#318BFA',
        secondaryColor: sp.brandIdentity?.secondaryColor || '#D0D9D9',
        instagram: sp.socialMedia?.instagram || '',
        facebook: sp.socialMedia?.facebook || '',
        tiktok: sp.socialMedia?.tiktok || '',
        twitterX: sp.socialMedia?.twitter_x || '',
        emailNotifications: sp.notificationPreference?.emailNotificationEnabled || false,
        rsvpNotifications: sp.notificationPreference?.rsvpNotificationEnabled || false,
        eventApprovalNotifications: sp.notificationPreference?.eventApprovalNotificationEnabled || false,
        weeklyReports: sp.notificationPreference?.weeklyReportEnabled || false,
        smsNotifications: sp.notificationPreference?.smsNotificationEnabled || false,
      };

      setFormData(formValues);
      setInitialFormData(formValues);

      // Set logo preview
      if (sp.documents?.businessLogoUrl) {
        setPreviews(prev => ({ ...prev, logo: sp.documents.businessLogoUrl! }));
      }

      // Set cover image preview
      if (sp.documents?.coverImageUrl) {
        setPreviews(prev => ({ ...prev, coverImage: sp.documents.coverImageUrl! }));
      }

      // Calculate completion
      calculateCompletion(userProfile);
    }
  }, [userProfile]);

  const calculateCompletion = (user: typeof userProfile) => {
    if (!user) return;
    
    const sp = user.serviceProvider;
    let completed = 0;
    const total = 15;

    if (user.name) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (sp.locationDetail?.businessAddress) completed++;
    if (sp.locationDetail?.postalCode) completed++;
    if (sp.locationDetail?.websiteUrl) completed++;
    if (sp.socialMedia?.facebook || sp.socialMedia?.instagram) completed++;
    if (sp.brandIdentity?.primaryColor) completed++;
    if (sp.documents?.businessLogoUrl) completed++;
    if (sp.documents?.coverImageUrl) completed++;
    if (sp.serviceProviderType) completed++;
    
    // Notification preferences
    if (sp.notificationPreference?.emailNotificationEnabled) completed++;
    if (sp.notificationPreference?.smsNotificationEnabled) completed++;
    if (sp.notificationPreference?.eventApprovalNotificationEnabled) completed++;
    if (sp.notificationPreference?.weeklyReportEnabled) completed++;

    const percentage = Math.round((completed / total) * 100);
    setCompletionPercentage(percentage);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size must be less than 5MB');
      return;
    }

    // Validate file type for images
    if ((fileType === 'logo' || fileType === 'coverImage') && !file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }

    setDocuments(prev => ({ ...prev, [fileType]: file }));

    // Create preview for images
    if (fileType === 'logo' || fileType === 'coverImage') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [fileType]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * ✅ COMPREHENSIVE FORM SUBMIT HANDLER
   * Supports all update scenarios:
   * 1. Single field updates
   * 2. Multiple fields in one section
   * 3. Multiple fields across sections
   * 4. Provider type changes with respective fields
   * 5. Document uploads
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 [PROFILE TAB] Form submitted');
    console.log('📋 [PROFILE TAB] Current form data:', formData);
    console.log('📋 [PROFILE TAB] Initial form data:', initialFormData);
    console.log('📋 [PROFILE TAB] Documents:', {
      hasLogo: !!documents.logo,
      hasCoverImage: !!documents.coverImage,
      hasNationalId: !!documents.nationalId,
      hasTaxRegistrationCert: !!documents.taxRegistrationCert,
    });

    try {
      // Step 1: Build profile update payload with ONLY changed fields
      const profilePayload: Partial<ProfileUpdatePayload> = {};
      let hasProfileChanges = false;

      // Check each field for changes
      if (formData.name !== initialFormData.name) {
        profilePayload.name = formData.name;
        hasProfileChanges = true;
      }

      // Provider type and related fields
      if (formData.providerType !== initialFormData.providerType) {
        profilePayload.serviceProviderType = formData.providerType;
        hasProfileChanges = true;

        console.log('🔄 [PROFILE TAB] Provider type changed:', {
          from: initialFormData.providerType,
          to: formData.providerType,
        });
        
        // ✅ CRITICAL: When provider type changes, we need to clear the opposite type's fields
        // to avoid sending conflicting data to the backend
        if (formData.providerType === 'INDIVIDUAL') {
          // Switching to INDIVIDUAL - clear business fields
          profilePayload.businessRegistrationNumber = null;
          console.log('📋 [PROFILE TAB] Clearing business registration number (switching to INDIVIDUAL)');
        } else {
          // Switching to BUSINESS - clear individual fields
          profilePayload.idNumber = null;
          console.log('📋 [PROFILE TAB] Clearing ID number (switching to BUSINESS)');
        }
      }

      // INDIVIDUAL-specific fields
      if (formData.providerType === 'INDIVIDUAL') {
        if (formData.idNumber !== initialFormData.idNumber) {
          profilePayload.idNumber = formData.idNumber || null;
          hasProfileChanges = true;
        }
      }

      // BUSINESS-specific fields
      if (formData.providerType === 'BUSINESS') {
        if (formData.businessRegistrationNumber !== initialFormData.businessRegistrationNumber) {
          profilePayload.businessRegistrationNumber = formData.businessRegistrationNumber || null;
          hasProfileChanges = true;
        }
      }

      // Tax ID (for both types)
      if (formData.taxId !== initialFormData.taxId) {
        profilePayload.taxPin = formData.taxId || null;
        hasProfileChanges = true;
      }

      // Location details
      const locationChanges: any = {};
      let hasLocationChanges = false;

      if (formData.businessAddress !== initialFormData.businessAddress) {
        locationChanges.businessAddress = formData.businessAddress || null;
        hasLocationChanges = true;
      }
      if (formData.postalCode !== initialFormData.postalCode) {
        locationChanges.postalCode = formData.postalCode || null;
        hasLocationChanges = true;
      }
      if (formData.websiteUrl !== initialFormData.websiteUrl) {
        locationChanges.websiteUrl = formData.websiteUrl || null;
        hasLocationChanges = true;
      }

      if (hasLocationChanges) {
        profilePayload.locationDetail = locationChanges;
        hasProfileChanges = true;
      }

      // Brand identity
      const brandChanges: any = {};
      let hasBrandChanges = false;

      if (formData.primaryColor !== initialFormData.primaryColor) {
        brandChanges.primaryColor = formData.primaryColor || null;
        hasBrandChanges = true;
      }
      if (formData.secondaryColor !== initialFormData.secondaryColor) {
        brandChanges.secondaryColor = formData.secondaryColor || null;
        hasBrandChanges = true;
      }

      if (hasBrandChanges) {
        profilePayload.brandIdentity = brandChanges;
        hasProfileChanges = true;
      }

      // Social media
      const socialChanges: any = {};
      let hasSocialChanges = false;

      if (formData.facebook !== initialFormData.facebook) {
        socialChanges.facebook = formData.facebook || null;
        hasSocialChanges = true;
      }
      if (formData.instagram !== initialFormData.instagram) {
        socialChanges.instagram = formData.instagram || null;
        hasSocialChanges = true;
      }
      if (formData.tiktok !== initialFormData.tiktok) {
        socialChanges.tiktok = formData.tiktok || null;
        hasSocialChanges = true;
      }
      if (formData.twitterX !== initialFormData.twitterX) {
        socialChanges.twitter_x = formData.twitterX || null;
        hasSocialChanges = true;
      }

      if (hasSocialChanges) {
        profilePayload.socialMedia = socialChanges;
        hasProfileChanges = true;
      }

      // Notification preferences
      const notificationChanges: any = {};
      let hasNotificationChanges = false;

      if (formData.emailNotifications !== initialFormData.emailNotifications) {
        notificationChanges.emailNotificationEnabled = formData.emailNotifications;
        hasNotificationChanges = true;
      }
      if (formData.rsvpNotifications !== initialFormData.rsvpNotifications) {
        notificationChanges.rsvpNotificationEnabled = formData.rsvpNotifications;
        hasNotificationChanges = true;
      }
      if (formData.eventApprovalNotifications !== initialFormData.eventApprovalNotifications) {
        notificationChanges.eventApprovalNotificationEnabled = formData.eventApprovalNotifications;
        hasNotificationChanges = true;
      }
      if (formData.weeklyReports !== initialFormData.weeklyReports) {
        notificationChanges.weeklyReportEnabled = formData.weeklyReports;
        hasNotificationChanges = true;
      }
      if (formData.smsNotifications !== initialFormData.smsNotifications) {
        notificationChanges.smsNotificationEnabled = formData.smsNotifications;
        hasNotificationChanges = true;
      }

      if (hasNotificationChanges) {
        profilePayload.notificationPreference = notificationChanges;
        hasProfileChanges = true;
      }

      console.log('📊 [PROFILE TAB] Change detection:', {
        hasProfileChanges,
        changedFields: Object.keys(profilePayload),
        hasLocationChanges,
        hasBrandChanges,
        hasSocialChanges,
        hasNotificationChanges,
      });

      // Step 2: Update profile if there are changes
      if (hasProfileChanges) {
        console.log('📤 [PROFILE TAB] Updating profile...');
        console.log('📋 [PROFILE TAB] Profile payload:', profilePayload);

        await updateProfile.mutateAsync(profilePayload);
        
        console.log('✅ [PROFILE TAB] Profile updated successfully');
        showToast('success', 'Profile updated successfully');

        // Update initial form data to reflect saved state
        setInitialFormData(formData);
      } else {
        console.log('ℹ️ [PROFILE TAB] No profile changes detected');
      }

      // Step 3: Upload documents if any
      const hasDocuments = documents.logo || documents.coverImage || 
                          documents.nationalId || documents.businessRegistrationCert || 
                          documents.taxRegistrationCert;

      if (hasDocuments) {
        console.log('📤 [PROFILE TAB] Uploading documents...');
        console.log('📋 [PROFILE TAB] Provider type:', formData.providerType);

        // Build document payload with correct field names matching backend
        const documentPayload: DocumentUploadPayload = {};

        if (documents.logo) {
          documentPayload.businessLogo = documents.logo;
          console.log('📎 [PROFILE TAB] Adding businessLogo');
        }
        if (documents.coverImage) {
          documentPayload.coverImage = documents.coverImage;
          console.log('📎 [PROFILE TAB] Adding coverImage');
        }
        
        // ✅ PROVIDER TYPE SPECIFIC: Include appropriate ID document
        if (formData.providerType === 'INDIVIDUAL') {
          if (documents.nationalId) {
            documentPayload.nationalId = documents.nationalId;
            console.log('📎 [PROFILE TAB] Adding nationalId (INDIVIDUAL)');
          }
        } else if (formData.providerType === 'BUSINESS') {
          if (documents.businessRegistrationCert) {
            documentPayload.nationalId = documents.businessRegistrationCert; // Backend uses 'nationalId' field for both
            console.log('📎 [PROFILE TAB] Adding businessRegistrationCert as nationalId (BUSINESS)');
          }
        }
        
        if (documents.taxRegistrationCert) {
          documentPayload.taxRegistrationCertificate = documents.taxRegistrationCert;
          console.log('📎 [PROFILE TAB] Adding taxRegistrationCertificate');
        }

        console.log('📋 [PROFILE TAB] Document payload:', Object.keys(documentPayload));

        await uploadDocuments.mutateAsync(documentPayload);

        console.log('✅ [PROFILE TAB] Documents uploaded successfully');
        showToast('success', 'Documents uploaded successfully');

        // Clear document selections after successful upload
        setDocuments({
          logo: null,
          coverImage: null,
          nationalId: null,
          businessRegistrationCert: null,
          taxRegistrationCert: null,
        });
      } else {
        console.log('ℹ️ [PROFILE TAB] No documents to upload');
      }

      // Step 4: Refresh profile data to get latest state
      if (hasProfileChanges || hasDocuments) {
        console.log('🔄 [PROFILE TAB] Refreshing profile data...');
        await refetch();
        console.log('✅ [PROFILE TAB] Profile data refreshed');
      }

      // Show final success message if nothing was changed
      if (!hasProfileChanges && !hasDocuments) {
        showToast('info', 'No changes to save');
      }

    } catch (error) {
      console.error('❌ [PROFILE TAB] Form submission error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      showToast('error', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-600">Failed to load profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Completion Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Profile Completion</h3>
          <span className="text-sm font-semibold text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Complete your profile to improve visibility and trust with customers
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business/Provider Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">Phone cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your business..."
            />
          </div>
        </div>
      </div>

      {/* Provider Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider Type *
          </label>
          <select
            name="providerType"
            value={formData.providerType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="BUSINESS">Business</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose whether you're operating as an individual or business entity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.providerType === 'INDIVIDUAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 12345678"
              />
            </div>
          )}

          {formData.providerType === 'BUSINESS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Registration Number
              </label>
              <input
                type="text"
                name="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., BN12345678"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax PIN / Tax ID
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., A001234567P"
            />
          </div>
        </div>
      </div>

      {/* Documents Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents & Media</h3>
        
        {/* ℹ️ HELPFUL INFO */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">Document Upload Guide</h4>
              <p className="mt-1 text-sm text-blue-700">
                You can upload documents individually or in groups:
              </p>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Business Logo (recommended)</li>
                <li>Cover Image (recommended)</li>
                <li>{formData.providerType === 'INDIVIDUAL' ? 'National ID (for identity verification)' : 'Business Registration Certificate (for business verification)'}</li>
                <li>Tax Registration Certificate (if applicable)</li>
              </ul>
              <p className="mt-2 text-sm text-blue-700">
                Upload the documents you have ready now. You can always add more later.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="flex items-center space-x-4">
              {previews.logo && (
                <img
                  src={previews.logo}
                  alt="Logo preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="flex items-center space-x-4">
              {previews.coverImage && (
                <img
                  src={previews.coverImage}
                  alt="Cover preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'coverImage')}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* National ID (for INDIVIDUAL) */}
          {formData.providerType === 'INDIVIDUAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID Document
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'nationalId')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                {documents.nationalId ? documents.nationalId.name : 'PDF or image up to 5MB'}
              </p>
            </div>
          )}

          {/* Business Registration Certificate (for BUSINESS) */}
          {formData.providerType === 'BUSINESS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Registration Certificate
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'businessRegistrationCert')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                {documents.businessRegistrationCert ? documents.businessRegistrationCert.name : 'PDF or image up to 5MB'}
              </p>
            </div>
          )}

          {/* Tax Registration Certificate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Registration Certificate
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'taxRegistrationCert')}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              {documents.taxRegistrationCert ? documents.taxRegistrationCert.name : 'PDF or image up to 5MB'}
            </p>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Address
            </label>
            <textarea
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your business address..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 00100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleInputChange}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#318BFA"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="secondaryColor"
                value={formData.secondaryColor}
                onChange={handleInputChange}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#D0D9D9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </span>
            </label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </span>
            </label>
            <input
              type="url"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://instagram.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/>
                </svg>
                Twitter / X
              </span>
            </label>
            <input
              type="url"
              name="twitterX"
              value={formData.twitterX}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                TikTok
              </span>
            </label>
            <input
              type="url"
              name="tiktok"
              value={formData.tiktok}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://tiktok.com/@yourpage"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Email Notifications
              </label>
              <p className="text-xs text-gray-600">Receive updates and alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">
                RSVP Notifications
              </label>
              <p className="text-xs text-gray-600">Get notified when someone RSVPs to your events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rsvpNotifications"
                checked={formData.rsvpNotifications}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Event Approval Notifications
              </label>
              <p className="text-xs text-gray-600">Alerts when your events are approved or require changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="eventApprovalNotifications"
                checked={formData.eventApprovalNotifications}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Weekly Reports
              </label>
              <p className="text-xs text-gray-600">Receive weekly performance and analytics reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="weeklyReports"
                checked={formData.weeklyReports}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">
                SMS Notifications
              </label>
              <p className="text-xs text-gray-600">Get important updates via text message</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>

        <div className="space-y-4">
          <div className="text-center py-4">
            <button
              type="button"
              className="text-blue-600 font-medium hover:underline"
            >
              Change Password
            </button>
            <p className="text-sm text-gray-600 mt-2">
              For security reasons, password changes must be done via email verification.
            </p>
            <button
              type="button"
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Password Reset Email
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Enable Two-Factor Authentication
                </label>
                <p className="text-xs text-gray-600">Add an extra layer of security to your account with 2FA</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="space-x-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setDocuments({
                logo: null,
                coverImage: null,
                nationalId: null,
                businessRegistrationCert: null,
                taxRegistrationCert: null,
              });
              showToast('info', 'Changes reset');
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
        <button
          type="submit"
          disabled={updateProfile.isPending || uploadDocuments.isPending}
          className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {updateProfile.isPending || uploadDocuments.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};
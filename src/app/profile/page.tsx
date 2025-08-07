'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  first_name: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  last_name: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  phone: z.string().min(10, 'Bitte geben Sie eine gültige Telefonnummer ein'),
  address: z.object({
    street: z.string().min(5, 'Straße und Hausnummer erforderlich'),
    postal_code: z.string().min(5, 'PLZ erforderlich'),
    city: z.string().min(2, 'Stadt erforderlich'),
    country: z.string().default('Deutschland'),
  }),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  company_name: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  certifications: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { appUser, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      address: {
        street: '',
        postal_code: '',
        city: '',
        country: 'Deutschland',
      },
      bio: '',
      website: '',
      company_name: '',
      specialties: [],
      experience_years: 0,
      certifications: [],
    },
  });

  useEffect(() => {
    if (appUser) {
      setValue('first_name', appUser.first_name || '');
      setValue('last_name', appUser.last_name || '');
      setValue('phone', appUser.phone || '');
      setValue('address', appUser.address || {
        street: '',
        postal_code: '',
        city: '',
        country: 'Deutschland',
      });
      setValue('bio', appUser.bio || '');
      setValue('website', appUser.website || '');
      setValue('company_name', appUser.company_name || '');
      setValue('specialties', appUser.specialties || []);
      setValue('experience_years', appUser.experience_years || 0);
      setValue('certifications', appUser.certifications || []);
    }
  }, [appUser, setValue]);

  if (!appUser) {
    router.push('/login');
    return null;
  }

  const isCraftsman = appUser.role === 'craftsman';
  const profileCompleted = appUser.profile_completed;

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        ...data,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        toast.error('Fehler beim Speichern des Profils');
      } else {
        toast.success('Profil erfolgreich aktualisiert!');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setIsSaving(false);
    }
  };

  const profileCompletionPercentage = calculateProfileCompletion();

  function calculateProfileCompletion(): number {
    if (!appUser) return 0;
    
    const requiredFields = [
      appUser.first_name,
      appUser.last_name,
      appUser.phone,
      appUser.address?.street,
      appUser.address?.postal_code,
      appUser.address?.city,
    ];

    const completedFields = requiredFields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / requiredFields.length) * 100);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Profil bearbeiten</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              Zurück
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Progress */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Profil-Vervollständigung</h2>
            <span className="text-sm font-medium text-gray-500">
              {profileCompletionPercentage}% vollständig
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileCompletionPercentage}%` }}
            ></div>
          </div>
          {profileCompletionPercentage < 100 && (
            <p className="mt-2 text-sm text-gray-600">
              Vervollständigen Sie Ihr Profil, um alle Funktionen nutzen zu können.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Persönliche Informationen</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Vorname *
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  id="first_name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Nachname *
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  id="last_name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefonnummer *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  value={appUser.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <MapPinIcon className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Straße und Hausnummer *
                </label>
                <input
                  {...register('address.street')}
                  type="text"
                  id="street"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  PLZ *
                </label>
                <input
                  {...register('address.postal_code')}
                  type="text"
                  id="postal_code"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.address?.postal_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.postal_code.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Stadt *
                </label>
                <input
                  {...register('address.city')}
                  type="text"
                  id="city"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Craftsman-specific Information */}
          {isCraftsman && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <BriefcaseIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Berufliche Informationen</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Firmenname
                  </label>
                  <input
                    {...register('company_name')}
                    type="text"
                    id="company_name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">
                    Berufserfahrung (Jahre)
                  </label>
                  <input
                    {...register('experience_years', { valueAsNumber: true })}
                    type="number"
                    id="experience_years"
                    min="0"
                    max="50"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    {...register('website')}
                    type="url"
                    id="website"
                    placeholder="https://www.ihre-website.de"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Über mich
                  </label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Beschreiben Sie Ihre Erfahrungen und Spezialisierungen..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Speichern...
                </div>
              ) : (
                'Profil speichern'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


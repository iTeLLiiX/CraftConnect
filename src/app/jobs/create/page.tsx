'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPinIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const jobSchema = z.object({
  title: z.string().min(10, 'Titel muss mindestens 10 Zeichen lang sein'),
  description: z.string().min(50, 'Beschreibung muss mindestens 50 Zeichen lang sein'),
  category: z.string().min(1, 'Bitte wählen Sie eine Kategorie'),
  subcategory: z.string().optional(),
  location: z.object({
    street: z.string().min(5, 'Straße und Hausnummer erforderlich'),
    postal_code: z.string().min(5, 'PLZ erforderlich'),
    city: z.string().min(2, 'Stadt erforderlich'),
    country: z.string().default('Deutschland'),
  }),
  budget_min: z.number().min(0, 'Budget muss positiv sein').optional(),
  budget_max: z.number().min(0, 'Budget muss positiv sein').optional(),
  urgency: z.enum(['low', 'medium', 'high'], {
    required_error: 'Bitte wählen Sie eine Dringlichkeit',
  }),
}).refine((data) => {
  if (data.budget_min && data.budget_max) {
    return data.budget_max >= data.budget_min;
  }
  return true;
}, {
  message: 'Maximales Budget muss größer oder gleich dem minimalen Budget sein',
  path: ['budget_max'],
});

type JobFormData = z.infer<typeof jobSchema>;

const categories = [
  { value: 'Elektro', label: 'Elektro' },
  { value: 'Sanitär', label: 'Sanitär' },
  { value: 'Heizung', label: 'Heizung' },
  { value: 'Bau', label: 'Bau' },
  { value: 'Garten', label: 'Garten' },
  { value: 'Reinigung', label: 'Reinigung' },
  { value: 'Umzug', label: 'Umzug' },
  { value: 'Sonstiges', label: 'Sonstiges' },
];

const urgencyLevels = [
  { value: 'low', label: 'Niedrig', description: 'Kann warten' },
  { value: 'medium', label: 'Mittel', description: 'Normal' },
  { value: 'high', label: 'Hoch', description: 'Dringend' },
];

export default function CreateJobPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      urgency: 'medium',
      location: {
        country: 'Deutschland',
      },
    },
  });

  const selectedCategory = watch('category');
  const budgetMin = watch('budget_min');
  const budgetMax = watch('budget_max');

  const onSubmit = async (data: JobFormData) => {
    if (!appUser) {
      toast.error('Sie müssen angemeldet sein');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('jobs').insert({
        customer_id: appUser.id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        location: data.location,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        urgency: data.urgency,
        status: 'open',
      });

      if (error) {
        console.error('Error creating job:', error);
        toast.error('Fehler beim Erstellen des Auftrags');
      } else {
        toast.success('Auftrag erfolgreich erstellt!');
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appUser || appUser.role !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Zugriff verweigert
          </h2>
          <p className="text-gray-600">
            Nur Kunden können Aufträge erstellen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Neuen Auftrag erstellen</h1>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Auftragsdetails</h3>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titel des Auftrags *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="z.B. Küche renovieren, Elektroinstallation, etc."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Beschreibung *
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Beschreiben Sie detailliert, was Sie benötigen..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Kategorie *
                </label>
                <select
                  {...register('category')}
                  id="category"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Kategorie auswählen</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                  Unterkategorie (optional)
                </label>
                <input
                  {...register('subcategory')}
                  type="text"
                  id="subcategory"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="z.B. Küchenbau, Badrenovierung, etc."
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <MapPinIcon className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Standort</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Straße und Hausnummer *
                </label>
                <input
                  {...register('location.street')}
                  type="text"
                  id="street"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Musterstraße 123"
                />
                {errors.location?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.street.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  PLZ *
                </label>
                <input
                  {...register('location.postal_code')}
                  type="text"
                  id="postal_code"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="12345"
                />
                {errors.location?.postal_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.postal_code.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Stadt *
                </label>
                <input
                  {...register('location.city')}
                  type="text"
                  id="city"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Musterstadt"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Budget and Urgency */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Budget */}
              <div>
                <div className="flex items-center mb-6">
                  <CurrencyEuroIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Budget</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700">
                      Minimales Budget (€)
                    </label>
                    <input
                      {...register('budget_min', { valueAsNumber: true })}
                      type="number"
                      id="budget_min"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                    {errors.budget_min && (
                      <p className="mt-1 text-sm text-red-600">{errors.budget_min.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700">
                      Maximales Budget (€)
                    </label>
                    <input
                      {...register('budget_max', { valueAsNumber: true })}
                      type="number"
                      id="budget_max"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                    {errors.budget_max && (
                      <p className="mt-1 text-sm text-red-600">{errors.budget_max.message}</p>
                    )}
                  </div>

                  {budgetMin && budgetMax && budgetMax < budgetMin && (
                    <p className="text-sm text-red-600">
                      Maximales Budget muss größer oder gleich dem minimalen Budget sein
                    </p>
                  )}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <div className="flex items-center mb-6">
                  <ClockIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Dringlichkeit</h3>
                </div>
                
                <div className="space-y-3">
                  {urgencyLevels.map((urgency) => (
                    <label key={urgency.value} className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                      <input
                        {...register('urgency')}
                        type="radio"
                        value={urgency.value}
                        className="sr-only"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900">
                            {urgency.label}
                          </span>
                          <span className="mt-1 flex items-center text-sm text-gray-500">
                            {urgency.description}
                          </span>
                        </span>
                      </span>
                      <span className="pointer-events-none absolute -inset-px rounded-lg border-2" />
                    </label>
                  ))}
                  {errors.urgency && (
                    <p className="text-sm text-red-600">{errors.urgency.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
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
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Erstelle Auftrag...
                </div>
              ) : (
                'Auftrag erstellen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

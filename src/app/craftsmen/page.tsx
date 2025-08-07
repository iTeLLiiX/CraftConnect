'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface CraftsmanWithStats extends User {
  completed_jobs?: number;
  average_rating?: number;
  total_reviews?: number;
}

export default function CraftsmenPage() {
  const [craftsmen, setCraftsmen] = useState<CraftsmanWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const categories = [
    'Alle Kategorien',
    'Elektriker',
    'Sanitär',
    'Maler',
    'Gärtner',
    'Schreiner',
    'Dachdecker',
    'Heizung',
    'Klima',
    'Bau',
    'Renovierung',
  ];

  useEffect(() => {
    fetchCraftsmen();
  }, []);

  const fetchCraftsmen = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      let query = supabase
        .from('users')
        .select(`
          *,
          jobs!jobs_customer_id_fkey(
            id,
            status
          ),
          applications:job_applications(
            id,
            status
          )
        `)
        .eq('role', 'craftsman')
        .eq('profile_completed', true);

      if (selectedCategory && selectedCategory !== 'Alle Kategorien') {
        query = query.contains('professional_info', { categories: [selectedCategory] });
      }

      if (selectedLocation) {
        query = query.ilike('address->>city', `%${selectedLocation}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate stats for each craftsman
      const craftsmenWithStats = (data || []).map((craftsman) => {
        const completedJobs = craftsman.applications?.filter(app => app.status === 'completed').length || 0;
        const totalReviews = craftsman.jobs?.length || 0;
        const averageRating = totalReviews > 0 ? 4.5 : 0; // Placeholder - would need reviews table

        return {
          ...craftsman,
          completed_jobs: completedJobs,
          average_rating: averageRating,
          total_reviews: totalReviews,
        };
      });

      setCraftsmen(craftsmenWithStats);
    } catch (error) {
      console.error('Error fetching craftsmen:', error);
      toast.error('Fehler beim Laden der Handwerker');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCraftsmen();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    fetchCraftsmen();
  };

  const filteredCraftsmen = craftsmen.filter((craftsman) =>
    craftsman.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    craftsman.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    craftsman.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    craftsman.professional_info?.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Handwerker finden</h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700"
            >
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nach Handwerker oder Firma suchen..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Standort
              </label>
              <input
                type="text"
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Stadt oder PLZ"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Suchen
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCraftsmen.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Handwerker gefunden
              </h3>
              <p className="text-gray-500">
                Versuchen Sie andere Suchkriterien oder erweitern Sie Ihre Suche.
              </p>
            </div>
          ) : (
            filteredCraftsmen.map((craftsman) => (
              <div key={craftsman.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {craftsman.company_name || `${craftsman.first_name} ${craftsman.last_name}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {craftsman.professional_info?.categories?.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {craftsman.average_rating?.toFixed(1) || 'Neu'}
                      </span>
                    </div>
                  </div>

                  {craftsman.address && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {craftsman.address.city}, {craftsman.address.postal_code}
                    </div>
                  )}

                  {craftsman.professional_info?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {craftsman.professional_info.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{craftsman.completed_jobs} abgeschlossene Aufträge</span>
                    <span>{craftsman.total_reviews} Bewertungen</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {craftsman.phone && (
                      <a
                        href={`tel:${craftsman.phone}`}
                        className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Anrufen
                      </a>
                    )}
                    {craftsman.email && (
                      <a
                        href={`mailto:${craftsman.email}`}
                        className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                      >
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        E-Mail
                      </a>
                    )}
                    {craftsman.professional_info?.website && (
                      <a
                        href={craftsman.professional_info.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                      >
                        <GlobeAltIcon className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/craftsmen/${craftsman.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Profil anzeigen
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserIcon,
  BriefcaseIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, appUser, signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Erfolgreich abgemeldet');
      router.push('/');
    } catch (error) {
      toast.error('Fehler beim Abmelden');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Profil wird geladen...
          </h2>
        </div>
      </div>
    );
  }

  const isCustomer = appUser.role === 'customer';
  const isCraftsman = appUser.role === 'craftsman';
  const profileCompleted = appUser.profile_completed;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Willkommen, {appUser.first_name}!
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Alert */}
        {!profileCompleted && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Profil vervollständigen
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Bitte vervollständigen Sie Ihr Profil, um alle Funktionen nutzen zu können.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
                  >
                    Profil bearbeiten
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary-100 rounded-full p-3">
                  <UserIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {appUser.first_name} {appUser.last_name}
                  </h2>
                  <p className="text-gray-500 capitalize">
                    {isCustomer ? 'Kunde' : 'Handwerker'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-3" />
                  {appUser.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-3" />
                  {appUser.phone}
                </div>
                {appUser.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-3" />
                    {appUser.address.city}, {appUser.address.postal_code}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/profile"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Profil bearbeiten
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {isCustomer ? (
              <CustomerDashboard />
            ) : (
              <CraftsmanDashboard />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellzugriff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/jobs/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <BriefcaseIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Auftrag erstellen</h4>
              <p className="text-sm text-gray-500">Neuen Auftrag ausschreiben</p>
            </div>
          </Link>

          <Link
            href="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Meine Aufträge</h4>
              <p className="text-sm text-gray-500">Aufträge verwalten</p>
            </div>
          </Link>

          <Link
            href="/craftsmen"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <UserIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Handwerker finden</h4>
              <p className="text-sm text-gray-500">Nach Handwerkern suchen</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Letzte Aktivitäten</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <BriefcaseIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Auftrag "Küche renovieren" erstellt</p>
                <p className="text-sm text-gray-500">vor 2 Stunden</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Aktiv</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">3 Bewerbungen erhalten</p>
                <p className="text-sm text-gray-500">vor 1 Tag</p>
              </div>
            </div>
            <span className="text-sm text-blue-600 font-medium">3 Neu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CraftsmanDashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellzugriff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <BriefcaseIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Aufträge durchsuchen</h4>
              <p className="text-sm text-gray-500">Nach Aufträgen suchen</p>
            </div>
          </Link>

          <Link
            href="/applications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Meine Bewerbungen</h4>
              <p className="text-sm text-gray-500">Bewerbungen verwalten</p>
            </div>
          </Link>

          <Link
            href="/schedule"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <CalendarIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Terminkalender</h4>
              <p className="text-sm text-gray-500">Termine verwalten</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktive Bewerbungen</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Abgeschlossene Aufträge</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3">
              <UserIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Durchschnittliche Bewertung</p>
              <p className="text-2xl font-semibold text-gray-900">4.8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Letzte Aktivitäten</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <BriefcaseIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bewerbung für "Küche renovieren" gesendet</p>
                <p className="text-sm text-gray-500">vor 3 Stunden</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Gesendet</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Neue Bewertung erhalten</p>
                <p className="text-sm text-gray-500">vor 1 Tag</p>
              </div>
            </div>
            <span className="text-sm text-blue-600 font-medium">5 Sterne</span>
          </div>
        </div>
      </div>
    </div>
  );
}


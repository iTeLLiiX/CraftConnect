'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalRevenue: number;
  pendingApplications: number;
  activeJobs: number;
  completedJobs: number;
  newUsersThisMonth: number;
}

export default function AdminPage() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalRevenue: 0,
    pendingApplications: 0,
    activeJobs: 0,
    completedJobs: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    
    // Check if user is admin
    if (appUser.role !== 'admin') {
      toast.error('Zugriff verweigert. Nur Administratoren können diese Seite aufrufen.');
      return;
    }

    fetchDashboardStats();
  }, [appUser]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch various statistics
      const [
        { count: totalUsers },
        { count: totalJobs },
        { count: totalApplications },
        { count: pendingApplications },
        { count: activeJobs },
        { count: completedJobs },
        { count: newUsersThisMonth },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalJobs: totalJobs || 0,
        totalApplications: totalApplications || 0,
        totalRevenue: 0, // Placeholder - would need payment integration
        pendingApplications: pendingApplications || 0,
        activeJobs: activeJobs || 0,
        completedJobs: completedJobs || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!appUser || appUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Zugriff verweigert
          </h2>
          <p className="text-gray-600">
            Nur Administratoren können diese Seite aufrufen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gesamte Benutzer</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                +{stats.newUsersThisMonth} diesen Monat
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <BriefcaseIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gesamte Aufträge</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {stats.activeJobs} aktiv, {stats.completedJobs} abgeschlossen
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bewerbungen</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {stats.pendingApplications} ausstehend
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <CurrencyEuroIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Umsatz</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRevenue}€</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Diesen Monat
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Schnellzugriff</h2>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <UsersIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Benutzer verwalten</h3>
                  <p className="text-sm text-gray-500">Benutzerkonten und Rollen verwalten</p>
                </div>
              </Link>

              <Link
                href="/admin/jobs"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <BriefcaseIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Aufträge verwalten</h3>
                  <p className="text-sm text-gray-500">Aufträge moderieren und verwalten</p>
                </div>
              </Link>

              <Link
                href="/admin/applications"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <ChartBarIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Bewerbungen</h3>
                  <p className="text-sm text-gray-500">Bewerbungen überprüfen</p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <CogIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Einstellungen</h3>
                  <p className="text-sm text-gray-500">Plattform-Einstellungen</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Aktuelle Aktivitäten</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    {stats.pendingApplications} ausstehende Bewerbungen
                  </p>
                  <p className="text-xs text-yellow-700">
                    Benötigen Überprüfung
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {stats.activeJobs} aktive Aufträge
                  </p>
                  <p className="text-xs text-green-700">
                    In Bearbeitung
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <UsersIcon className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {stats.newUsersThisMonth} neue Benutzer
                  </p>
                  <p className="text-xs text-blue-700">
                    Diesen Monat registriert
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Letzte Aktivitäten</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Keine aktuellen Aktivitäten</p>
              <p className="text-sm">Aktivitäten werden hier angezeigt, sobald sie verfügbar sind.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


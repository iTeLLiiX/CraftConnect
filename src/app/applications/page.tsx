'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { JobApplication, Job } from '@/types';
import toast from 'react-hot-toast';

interface ApplicationWithJob extends JobApplication {
  job: Job & {
    customer: {
      id: string;
      first_name: string;
      last_name: string;
      company_name?: string;
    };
  };
}

export default function ApplicationsPage() {
  const { appUser } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (!appUser) return;
    fetchApplications();
  }, [appUser]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(
            *,
            customer:users!jobs_customer_id_fkey(
              id,
              first_name,
              last_name,
              company_name
            )
          )
        `)
        .eq('craftsman_id', appUser?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Fehler beim Laden der Bewerbungen');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Ausstehend
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Angenommen
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Abgelehnt
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Abgeschlossen
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unbekannt
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredApplications = applications.filter((application) => {
    if (selectedStatus === 'all') return true;
    return application.status === selectedStatus;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Meine Bewerbungen</h1>
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
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Alle Bewerbungen</option>
              <option value="pending">Ausstehend</option>
              <option value="accepted">Angenommen</option>
              <option value="rejected">Abgelehnt</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Bewerbungen gefunden
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedStatus === 'all'
                  ? 'Sie haben noch keine Bewerbungen eingereicht.'
                  : `Keine Bewerbungen mit dem Status "${selectedStatus}" gefunden.`}
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Nach Aufträgen suchen
              </Link>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.job.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Kunde: {application.job.customer.company_name || 
                          `${application.job.customer.first_name} ${application.job.customer.last_name}`}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {application.job.location.city}, {application.job.location.postal_code}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(application.job.created_at)}
                    </div>
                    {application.job.budget_min && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                        {application.job.budget_min}€
                        {application.job.budget_max && ` - ${application.job.budget_max}€`}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {application.job.description}
                    </p>
                  </div>

                  {application.message && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Ihre Nachricht:</h4>
                      <p className="text-sm text-gray-600">{application.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Bewerbung eingereicht am {formatDate(application.created_at)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/jobs/${application.job.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Auftrag anzeigen
                      </Link>
                      {application.status === 'accepted' && (
                        <Link
                          href={`/messages?job=${application.job.id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Nachricht senden
                        </Link>
                      )}
                    </div>
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

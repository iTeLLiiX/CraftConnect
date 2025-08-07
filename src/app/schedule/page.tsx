'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types';
import toast from 'react-hot-toast';

interface ScheduledJob extends Job {
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
    email: string;
  };
  application: {
    id: string;
    status: string;
    scheduled_date?: string;
    scheduled_time?: string;
  };
}

export default function SchedulePage() {
  const { appUser } = useAuth();
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!appUser) return;
    fetchScheduledJobs();
  }, [appUser]);

  const fetchScheduledJobs = async () => {
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
              company_name,
              phone,
              email
            )
          )
        `)
        .eq('craftsman_id', appUser?.id)
        .in('status', ['accepted', 'in_progress'])
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Transform data to match ScheduledJob interface
      const transformedData = (data || []).map((item) => ({
        ...item.job,
        customer: item.job.customer,
        application: {
          id: item.id,
          status: item.status,
          scheduled_date: item.scheduled_date,
          scheduled_time: item.scheduled_time,
        },
      }));

      setScheduledJobs(transformedData);
    } catch (error) {
      console.error('Error fetching scheduled jobs:', error);
      toast.error('Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (applicationId: string, date: string, time: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('job_applications')
        .update({
          scheduled_date: date,
          scheduled_time: time,
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Termin aktualisiert');
      fetchScheduledJobs();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Fehler beim Aktualisieren des Termins');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getJobsForDate = (date: string) => {
    return scheduledJobs.filter((job) => job.application.scheduled_date === date);
  };

  const selectedDateJobs = getJobsForDate(selectedDate);

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
            <h1 className="text-2xl font-bold text-gray-900">Terminkalender</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Kalender</h2>
              
              {/* Date Picker */}
              <div className="mb-6">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Datum auswählen
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {selectedDateJobs.length} Termine
                      </p>
                      <p className="text-xs text-blue-700">
                        am {formatDate(selectedDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {scheduledJobs.length} Gesamt
                      </p>
                      <p className="text-xs text-green-700">
                        geplante Termine
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Termine am {formatDate(selectedDate)}
                </h2>
              </div>

              <div className="p-6">
                {selectedDateJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine Termine
                    </h3>
                    <p className="text-gray-500">
                      An diesem Tag sind keine Termine geplant.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedDateJobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {job.customer.company_name || 
                                `${job.customer.first_name} ${job.customer.last_name}`}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {job.application.status === 'accepted' ? 'Angenommen' : 'In Bearbeitung'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {job.location.city}, {job.location.postal_code}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {job.application.scheduled_time || 'Zeit nicht festgelegt'}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {job.description}
                          </p>
                        </div>

                        {/* Customer Contact */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Kontakt</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <UserIcon className="h-4 w-4 mr-2" />
                              {job.customer.first_name} {job.customer.last_name}
                            </div>
                            {job.customer.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                <a
                                  href={`tel:${job.customer.phone}`}
                                  className="text-primary-600 hover:text-primary-500"
                                >
                                  {job.customer.phone}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              <a
                                href={`mailto:${job.customer.email}`}
                                className="text-primary-600 hover:text-primary-500"
                              >
                                {job.customer.email}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Auftrag anzeigen
                            </Link>
                            <Link
                              href={`/messages?job=${job.id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                            >
                              Nachricht senden
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


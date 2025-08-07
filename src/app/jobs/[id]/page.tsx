'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPinIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Job, JobApplication } from '@/types';
import toast from 'react-hot-toast';

interface JobWithCustomer extends Job {
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
    email: string;
  };
  applications?: JobApplication[];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { appUser } = useAuth();
  const [job, setJob] = useState<JobWithCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    message: '',
    price: '',
    estimated_duration: '',
  });

  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:users!jobs_customer_id_fkey(
            id,
            first_name,
            last_name,
            company_name,
            phone,
            email
          ),
          applications:job_applications(
            *,
            craftsman:users!job_applications_craftsman_id_fkey(
              id,
              first_name,
              last_name,
              company_name
            )
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Fehler beim Laden der Auftragsdetails');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!appUser || appUser.role !== 'craftsman') {
      toast.error('Nur Handwerker können sich bewerben');
      return;
    }

    if (!applicationData.message.trim()) {
      toast.error('Bitte geben Sie eine Nachricht ein');
      return;
    }

    setApplying(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          craftsman_id: appUser.id,
          message: applicationData.message,
          price: applicationData.price ? parseFloat(applicationData.price) : null,
          estimated_duration: applicationData.estimated_duration ? parseInt(applicationData.estimated_duration) : null,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Bewerbung erfolgreich eingereicht');
      setShowApplicationForm(false);
      setApplicationData({ message: '', price: '', estimated_duration: '' });
      fetchJobDetails(); // Refresh to show new application
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Fehler beim Einreichen der Bewerbung');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Hoch
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Mittel
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Niedrig
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Offen
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            In Bearbeitung
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Abgeschlossen
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Auftrag nicht gefunden
          </h2>
          <p className="text-gray-600 mb-4">
            Der angeforderte Auftrag existiert nicht oder wurde entfernt.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Zurück zu den Aufträgen
          </Link>
        </div>
      </div>
    );
  }

  const hasApplied = job.applications?.some(app => app.craftsman_id === appUser?.id);
  const isOwner = job.customer_id === appUser?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link
                href="/jobs"
                className="text-gray-500 hover:text-gray-700 mb-2 inline-block"
              >
                ← Zurück zu den Aufträgen
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(job.status)}
              {getUrgencyBadge(job.urgency)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Auftragsbeschreibung
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Standort</p>
                      <p>{job.location.street}, {job.location.postal_code} {job.location.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Erstellt am</p>
                      <p>{formatDate(job.created_at)}</p>
                    </div>
                  </div>

                  {job.budget_min && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyEuroIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Budget</p>
                        <p>
                          {job.budget_min}€
                          {job.budget_max && ` - ${job.budget_max}€`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <BriefcaseIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Kategorie</p>
                      <p>{job.category}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Auftraggeber</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {job.customer.company_name || `${job.customer.first_name} ${job.customer.last_name}`}
                        </p>
                        {job.customer.company_name && (
                          <p className="text-sm text-gray-600">
                            {job.customer.first_name} {job.customer.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
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
                </div>
              </div>
            </div>

            {/* Applications Section (for job owner) */}
            {isOwner && job.applications && job.applications.length > 0 && (
              <div className="bg-white rounded-lg shadow mt-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bewerbungen ({job.applications.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {job.applications.map((application) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {application.craftsman.company_name || 
                                `${application.craftsman.first_name} ${application.craftsman.last_name}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              Bewerbung eingereicht am {formatDate(application.created_at)}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Ausstehend
                          </span>
                        </div>
                        {application.message && (
                          <p className="text-sm text-gray-600 mb-3">
                            {application.message}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {application.price && (
                            <span>Preis: {application.price}€</span>
                          )}
                          {application.estimated_duration && (
                            <span>Dauer: {application.estimated_duration} Tage</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aktionen</h3>
              
              {!isOwner && appUser?.role === 'craftsman' && job.status === 'open' && (
                <div className="space-y-3">
                  {hasApplied ? (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">
                        Bewerbung eingereicht
                      </p>
                      <p className="text-xs text-green-700">
                        Sie haben sich bereits für diesen Auftrag beworben.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Bewerbung einreichen
                    </button>
                  )}
                </div>
              )}

              {isOwner && (
                <div className="space-y-3">
                  <Link
                    href={`/messages?job=${job.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Nachrichten
                  </Link>
                </div>
              )}

              {!isOwner && !appUser && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Melden Sie sich an, um sich zu bewerben
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Anmelden
                  </Link>
                </div>
              )}
            </div>

            {/* Job Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiken</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bewerbungen</span>
                  <span className="text-sm font-medium text-gray-900">
                    {job.applications?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Aufrufe</span>
                  <span className="text-sm font-medium text-gray-900">
                    {/* Placeholder - would need analytics */}
                    0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Bewerbung einreichen
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Ihre Nachricht *
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={applicationData.message}
                    onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Beschreiben Sie Ihre Qualifikationen und warum Sie der richtige Handwerker für diesen Auftrag sind..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Preis (€)
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={applicationData.price}
                      onChange={(e) => setApplicationData({ ...applicationData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Dauer (Tage)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={applicationData.estimated_duration}
                      onChange={(e) => setApplicationData({ ...applicationData, estimated_duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || !applicationData.message.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Wird eingereicht...' : 'Bewerbung einreichen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { meterApi, readingApi } from '../utils/api';
import MeterCard from '../components/MeterCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const {
    data: meters = [],
    isLoading: metersLoading,
    error: metersError,
    refetch: refetchMeters
  } = useQuery('meters', meterApi.getAll, {
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Feil ved henting av målere');
    }
  });

  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useQuery('reading-statistics', () => readingApi.getStatistics(), {
    onError: (error: any) => {
      console.error('Error fetching statistics:', error);
    }
  });

  const handleRefresh = async () => {
    try {
      await refetchMeters();
      toast.success('Data oppdatert');
    } catch (error) {
      toast.error('Feil ved oppdatering av data');
    }
  };

  if (metersLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (metersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Feil ved lasting av data
        </h3>
        <p className="text-gray-500 mb-4">
          Kunne ikke hente målere. Sjekk internettforbindelsen og prøv igjen.
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Prøv igjen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Oversikt over alle målere og avlesninger
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Oppdater
          </button>
          
          <Link
            to="/reading/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ny avlesning
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {statistics && !statisticsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">
                      {meters.length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Totalt målere
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {meters.length} målere
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">
                      {statistics.total_readings}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Totalt avlesninger
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.total_readings} avlesninger
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {meters.filter(m => m.latest_reading).length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aktive målere
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {meters.filter(m => m.latest_reading).length} målere
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meters Grid */}
      {meters.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Målere ({meters.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meters.map((meter) => (
              <MeterCard key={meter.id} meter={meter} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Plus className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Ingen målere ennå
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Kom i gang ved å legge til din første måler.
          </p>
          <div className="mt-6">
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til måler
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
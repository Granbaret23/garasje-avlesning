import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  Calendar,
  Image as ImageIcon,
  FileText,
  Edit2
} from 'lucide-react';

import { meterApi } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MeterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  const meterId = parseInt(id || '0');

  const { data: meter, isLoading: meterLoading } = useQuery(
    ['meter', meterId],
    () => meterApi.getById(meterId),
    {
      enabled: !!meterId,
    }
  );

  const { data: readingsData, isLoading: readingsLoading } = useQuery(
    ['meter-readings', meterId, currentPage],
    () => meterApi.getReadings(meterId, { page: currentPage, limit: pageSize }),
    {
      enabled: !!meterId,
    }
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd. MMM yyyy HH:mm', { locale: nb });
    } catch {
      return 'Ukjent dato';
    }
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toLocaleString('nb-NO', { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    })} ${unit}`;
  };

  const getInputMethodLabel = (method: string) => {
    switch (method) {
      case 'manual':
        return 'Manuell';
      case 'photo':
        return 'Bilde';
      case 'ocr':
        return 'OCR';
      default:
        return method;
    }
  };

  if (meterLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Måler ikke funnet
        </h3>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700"
        >
          Gå tilbake til dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Tilbake
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meter.name}</h1>
            <p className="text-gray-600">
              {meter.location && `${meter.location} • `}
              {meter.meter_type} • {meter.unit}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`/reading/new?meter=${meter.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ny avlesning
          </Link>
        </div>
      </div>

      {/* Meter Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meter.latest_reading && (
            <>
              <div>
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Siste avlesning
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatValue(meter.latest_reading.value, meter.unit)}
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Siste oppdatering
                  </span>
                </div>
                <div className="text-lg text-gray-900">
                  {formatDate(meter.latest_reading.reading_date)}
                </div>
              </div>
            </>
          )}
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Opprettet
            </div>
            <div className="text-lg text-gray-900">
              {formatDate(meter.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Readings History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Avlesningshistorikk
            {readingsData && ` (${readingsData.total} avlesninger)`}
          </h2>
        </div>

        {readingsLoading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : readingsData && readingsData.readings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verdi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notater
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {readingsData.readings.map((reading) => (
                    <tr key={reading.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(reading.reading_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatValue(reading.value, meter.unit)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {reading.input_method === 'photo' && (
                            <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          {reading.input_method === 'manual' && (
                            <Edit2 className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <span className="text-sm text-gray-600">
                            {getInputMethodLabel(reading.input_method)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reading.synced_to_sheets
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reading.synced_to_sheets ? 'Synkronisert' : 'Venter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {reading.notes && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {reading.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {readingsData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Viser side {readingsData.page} av {readingsData.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Forrige
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(readingsData.totalPages, prev + 1))}
                      disabled={currentPage === readingsData.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Neste
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <div className="text-gray-500">
              Ingen avlesninger registrert ennå
            </div>
            <Link
              to={`/reading/new?meter=${meter.id}`}
              className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Legg til første avlesning
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeterDetails;
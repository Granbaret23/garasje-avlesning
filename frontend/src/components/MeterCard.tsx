import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { 
  Zap, 
  Droplets, 
  Flame, 
  Thermometer, 
  Circle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Meter } from '../types';

interface MeterCardProps {
  meter: Meter;
}

const MeterCard: React.FC<MeterCardProps> = ({ meter }) => {
  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'electric':
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'water':
        return <Droplets className="h-6 w-6 text-blue-500" />;
      case 'gas':
        return <Flame className="h-6 w-6 text-orange-500" />;
      case 'heat':
        return <Thermometer className="h-6 w-6 text-red-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getMeterTypeLabel = (type: string) => {
    switch (type) {
      case 'electric':
        return 'Strøm';
      case 'water':
        return 'Vann';
      case 'gas':
        return 'Gass';
      case 'heat':
        return 'Varme';
      default:
        return 'Annet';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd. MMM yyyy', { locale: nb });
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

  return (
    <Link to={`/meter/${meter.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 hover:border-primary-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getMeterIcon(meter.meter_type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {meter.name}
              </h3>
              <p className="text-sm text-gray-500">
                {getMeterTypeLabel(meter.meter_type)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {meter.unit}
            </span>
          </div>
        </div>

        {/* Location */}
        {meter.location && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              📍 {meter.location}
            </p>
          </div>
        )}

        {/* Latest Reading */}
        <div className="space-y-3">
          {meter.latest_reading ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Siste avlesning:
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(meter.latest_reading.reading_date)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(meter.latest_reading.value, meter.unit)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">
                <Circle className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">
                Ingen avlesninger ennå
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Legg til første avlesning
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Opprettet {formatDate(meter.created_at)}</span>
            <span className="text-primary-600 font-medium">
              Se detaljer →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MeterCard;
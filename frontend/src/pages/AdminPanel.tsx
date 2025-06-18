import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Settings,
  Save,
  X
} from 'lucide-react';

import { meterApi } from '../utils/api';
import { CreateMeterData, UpdateMeterData, Meter } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const meterSchema = yup.object({
  name: yup.string().required('Navn er påkrevd').max(100, 'Navn kan ikke være lenger enn 100 tegn'),
  location: yup.string().max(200, 'Lokasjon kan ikke være lenger enn 200 tegn'),
  meter_type: yup.string().oneOf(['electric', 'water', 'gas', 'heat', 'other']).required(),
  unit: yup.string().max(20, 'Enhet kan ikke være lenger enn 20 tegn').required(),
});

type MeterFormData = yup.InferType<typeof meterSchema>;

const AdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingMeter, setEditingMeter] = React.useState<Meter | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const { data: meters = [], isLoading } = useQuery('meters', meterApi.getAll);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MeterFormData>({
    resolver: yupResolver(meterSchema),
    defaultValues: {
      meter_type: 'electric',
      unit: 'kWh',
    },
  });

  const createMutation = useMutation(meterApi.create, {
    onSuccess: () => {
      toast.success('Måler opprettet');
      queryClient.invalidateQueries('meters');
      setShowCreateForm(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Feil ved oppretting av måler');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: UpdateMeterData }) =>
      meterApi.update(id, data),
    {
      onSuccess: () => {
        toast.success('Måler oppdatert');
        queryClient.invalidateQueries('meters');
        setEditingMeter(null);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Feil ved oppdatering av måler');
      },
    }
  );

  const deleteMutation = useMutation(meterApi.delete, {
    onSuccess: () => {
      toast.success('Måler slettet');
      queryClient.invalidateQueries('meters');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Feil ved sletting av måler');
    },
  });

  const onSubmit = (data: MeterFormData) => {
    if (editingMeter) {
      updateMutation.mutate({ id: editingMeter.id, data });
    } else {
      createMutation.mutate(data as CreateMeterData);
    }
  };

  const startEdit = (meter: Meter) => {
    setEditingMeter(meter);
    setShowCreateForm(false);
    setValue('name', meter.name);
    setValue('location', meter.location || '');
    setValue('meter_type', meter.meter_type as any);
    setValue('unit', meter.unit);
  };

  const cancelEdit = () => {
    setEditingMeter(null);
    setShowCreateForm(false);
    reset();
  };

  const handleDelete = (meter: Meter) => {
    if (window.confirm(`Er du sikker på at du vil slette måleren "${meter.name}"? Dette vil også slette alle tilhørende avlesninger.`)) {
      deleteMutation.mutate(meter.id);
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
      case 'other':
        return 'Annet';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrasjon</h1>
          <p className="text-gray-600">
            Administrer målere og systeminnstillinger
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingMeter(null);
            reset();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ny måler
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingMeter) && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingMeter ? 'Rediger måler' : 'Ny måler'}
            </h2>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="f.eks. Lader Elbil"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasjon
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="f.eks. Garasje høyre vegg"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  {...register('meter_type')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="electric">Strøm</option>
                  <option value="water">Vann</option>
                  <option value="gas">Gass</option>
                  <option value="heat">Varme</option>
                  <option value="other">Annet</option>
                </select>
                {errors.meter_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.meter_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enhet *
                </label>
                <input
                  type="text"
                  {...register('unit')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="f.eks. kWh, m³, l"
                />
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {(createMutation.isLoading || updateMutation.isLoading) && (
                  <LoadingSpinner size="small" className="mr-2" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {editingMeter ? 'Oppdater' : 'Opprett'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meters List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Målere ({meters.length})
          </h2>
        </div>

        {meters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasjon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enhet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siste avlesning
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meters.map((meter) => (
                  <tr key={meter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {meter.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {meter.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getMeterTypeLabel(meter.meter_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meter.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meter.latest_reading 
                        ? `${meter.latest_reading.value} ${meter.unit}`
                        : 'Ingen avlesninger'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEdit(meter)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(meter)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Ingen målere ennå
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Kom i gang ved å legge til din første måler.
            </p>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingMeter(null);
                reset();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til måler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Camera, Edit, Upload } from 'lucide-react';

import { meterApi, readingApi, uploadApi } from '../utils/api';
import { CreateReadingData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const schema = yup.object({
  meter_id: yup.number().required('Måler er påkrevd'),
  value: yup
    .number()
    .positive('Verdi må være positiv')
    .required('Verdi er påkrevd'),
  reading_date: yup.string().optional(),
  input_method: yup
    .string()
    .oneOf(['manual', 'photo'], 'Ugyldig inndata-metode')
    .required(),
  notes: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const NewReading: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: meters = [], isLoading: metersLoading } = useQuery(
    'meters',
    meterApi.getAll
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      input_method: 'manual',
      reading_date: new Date().toISOString().slice(0, 16),
    },
  });

  const inputMethod = watch('input_method');

  const uploadMutation = useMutation(
    ({ file, meterId }: { file: File; meterId: number }) =>
      uploadApi.uploadImage(file, meterId),
    {
      onSuccess: (data) => {
        toast.success('Bilde lastet opp');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Feil ved opplasting av bilde');
      },
    }
  );

  const createMutation = useMutation(readingApi.create, {
    onSuccess: () => {
      toast.success('Avlesning registrert');
      queryClient.invalidateQueries('meters');
      queryClient.invalidateQueries('readings');
      queryClient.invalidateQueries('reading-statistics');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Feil ved registrering av avlesning');
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Filen er for stor. Maksimal størrelse er 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Kun bildefiler er tillatt');
        return;
      }

      setSelectedFile(file);
      setValue('input_method', 'photo');

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setValue('input_method', 'manual');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let imagePath: string | undefined;

      if (selectedFile && data.meter_id) {
        const uploadResult = await uploadMutation.mutateAsync({
          file: selectedFile,
          meterId: data.meter_id,
        });
        imagePath = uploadResult.filename;
      }

      const readingData: CreateReadingData = {
        meter_id: data.meter_id,
        value: data.value,
        reading_date: data.reading_date || new Date().toISOString(),
        input_method: data.input_method as 'manual' | 'photo',
        notes: data.notes,
        image_path: imagePath,
      };

      await createMutation.mutateAsync(readingData);
    } catch (error) {
      console.error('Error creating reading:', error);
    }
  };

  if (metersLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (meters.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ingen målere funnet
        </h3>
        <p className="text-gray-500 mb-4">
          Du må legge til minst én måler før du kan registrere avlesninger.
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Legg til måler
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Tilbake
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ny avlesning</h1>
          <p className="text-gray-600">
            Registrer en ny måleravlesning
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Meter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Måler *
            </label>
            <select
              {...register('meter_id', { valueAsNumber: true })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Velg måler</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id}>
                  {meter.name} ({meter.location})
                </option>
              ))}
            </select>
            {errors.meter_id && (
              <p className="mt-1 text-sm text-red-600">{errors.meter_id.message}</p>
            )}
          </div>

          {/* Input Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registreringsmetode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  {...register('input_method')}
                  value="manual"
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  inputMethod === 'manual'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Edit className="h-6 w-6 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Manuell innskriving</div>
                      <div className="text-sm text-gray-500">Skriv inn verdi direkte</div>
                    </div>
                  </div>
                </div>
              </label>

              <label className="relative">
                <input
                  type="radio"
                  {...register('input_method')}
                  value="photo"
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  inputMethod === 'photo'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Camera className="h-6 w-6 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Ta bilde</div>
                      <div className="text-sm text-gray-500">Last opp bilde av måler</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          {inputMethod === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bilde av måler
              </label>
              
              {!imagePreview ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Last opp en fil</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">eller dra og slipp</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF opp til 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Måler"
                    className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avlesningsverdi *
            </label>
            <input
              type="number"
              step="0.1"
              {...register('value', { valueAsNumber: true })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Skriv inn verdi"
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
            )}
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avlesningsdato
            </label>
            <input
              type="datetime-local"
              {...register('reading_date')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.reading_date && (
              <p className="mt-1 text-sm text-red-600">{errors.reading_date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notater
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Legg til eventuelle notater..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || uploadMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {(createMutation.isLoading || uploadMutation.isLoading) && (
                <LoadingSpinner size="small" className="mr-2" />
              )}
              Lagre avlesning
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReading;
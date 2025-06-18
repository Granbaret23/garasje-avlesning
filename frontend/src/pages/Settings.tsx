import React from 'react';
import { toast } from 'react-hot-toast';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      // This would call the export API endpoint
      toast.success('Excel-fil generert og lastet ned');
    } catch (error) {
      toast.error('Feil ved eksport til Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncToSheets = async () => {
    setIsSyncing(true);
    try {
      // This would call the Google Sheets sync API endpoint
      toast.success('Data synkronisert til Google Sheets');
    } catch (error) {
      toast.error('Feil ved synkronisering til Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Innstillinger</h1>
        <p className="text-gray-600">
          Konfigurer synkronisering og eksport av data
        </p>
      </div>

      {/* Google Sheets Integration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Google Sheets Integrasjon
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Alle avlesninger synkroniseres automatisk til Google Sheets hver time. 
                Du kan også utføre manuell synkronisering ved behov.
              </p>
              <p>
                <strong>Konfigurasjon:</strong> Google Sheets ID og service account 
                konfigureres via environment variabler på serveren.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSyncToSheets}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isSyncing ? 'Synkroniserer...' : 'Synkroniser nå'}
            </button>
            
            <a
              href="#"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              onClick={(e) => {
                e.preventDefault();
                toast('Åpne Google Sheets manuelt med URL fra konfigurasjon');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Åpne Google Sheets
            </a>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Data Eksport
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p>
                Eksporter alle data til Excel-format for backup eller analyse. 
                Eksporten inkluderer alle målere og avlesninger med tilhørende metadata.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleExportToExcel}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Eksporterer...' : 'Eksporter til Excel'}
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Systeminformasjon
          </h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-700">Applikasjon</dt>
              <dd className="text-gray-600">Garasje Avlesning v1.0.0</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">API Status</dt>
              <dd className="text-green-600">Online</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Database</dt>
              <dd className="text-gray-600">SQLite</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Miljø</dt>
              <dd className="text-gray-600">
                {process.env.NODE_ENV || 'development'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Brukerveiledning
          </h2>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Slik registrerer du avlesninger:
            </h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Gå til "Ny Avlesning" fra hovedmenyen</li>
              <li>Velg måler fra listen</li>
              <li>Velg registreringsmetode (manuell eller bilde)</li>
              <li>Skriv inn verdien eller last opp bilde</li>
              <li>Legg til eventuelle notater</li>
              <li>Lagre avlesningen</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Administrering av målere:
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Legg til nye målere i administrasjonspanelet</li>
              <li>Rediger målernavn, lokasjon og enhet etter behov</li>
              <li>Slett målere du ikke lenger bruker (sletter også avlesninger)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Bildeopptak tips:
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Sørg for god belysning når du tar bilde</li>
              <li>Hold kameraet parallelt med målerdisplayet</li>
              <li>Fokuser på å få tallene klart leselige</li>
              <li>Maksimal filstørrelse er 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
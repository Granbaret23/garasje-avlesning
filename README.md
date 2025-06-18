# Garasje Avlesning App

En Docker-basert webapplikasjon for registrering og sporing av målerverdier (minusmålere) i garasje, med automatisk synkronisering til Google Sheets.

## Hurtigstart

### Med Docker Compose (Anbefalt)
```bash
# Klon repository
git clone https://github.com/Granbaret23/garasje-avlesning.git
cd garasje-avlesning

# Kopier og konfigurer miljøvariabler
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Opprett data mapper
mkdir -p data uploads logs config

# Start applikasjonen
docker-compose up -d

# Applikasjonen er tilgjengelig på http://localhost:3000
```

### Lokal Utvikling
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (i nytt terminal)
cd frontend
npm install
cp .env.example .env
npm start
```

## Prosjektstruktur

```
├── backend/          # Node.js/Express API
├── frontend/         # React applikasjon
├── docker/          # Docker konfigurasjoner
├── data/            # Database og persistent data
├── uploads/         # Opplastede bilder
├── SPEC.md          # Teknisk spesifikasjon
└── README.md        # Denne filen
```

## Funksjoner

- 📱 Responsivt webgrensesnitt
- 📸 Fotografering av målere
- ✋ Manuell registrering av avlesninger
- 📊 Google Sheets synkronisering
- 📈 Historikk og rapportering
- 🐳 Docker deployment for Unraid

## Konfigurasjoner

### Environment Variabler
Opprett `.env` filer i backend og frontend mapper:

#### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_PATH=../data/readings.db
JWT_SECRET=din-sikre-jwt-secret
GOOGLE_SERVICE_ACCOUNT_PATH=../data/google-service-account.json
GOOGLE_SHEET_ID=din-google-sheet-id
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Google Sheets Setup

1. Opprett Google Cloud Project
2. Aktiver Google Sheets API
3. Opprett Service Account og last ned JSON nøkkel
4. Del Google Sheet med service account email
5. Legg til Sheet ID i backend .env

## Unraid Deployment

**Enkel installasjon med "Add Container":**

1. Gå til Docker tab i Unraid WebUI
2. Klikk "Add Container"
3. Repository: `granbaret23/garasje-avlesning:latest`
4. Port: `3000:3001`
5. Legg til 4 volumes til `/mnt/user/appdata/garasje-avlesning/`
6. Apply og start!

**Detaljert guide:** Se [UNRAID-SETUP.md](./UNRAID-SETUP.md)

## Dokumentasjon

- [SPEC.md](./SPEC.md) - Detaljert teknisk spesifikasjon
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide for alle platformer

## Utvikling

### Testing
```bash
# Backend testing
cd backend
npm test

# Frontend testing  
cd frontend
npm test
```

### Linting
```bash
# Backend linting
cd backend
npm run lint

# Frontend linting
cd frontend
npm run lint
```

### Building
```bash
# Backend build
cd backend
npm run build

# Frontend build
cd frontend
npm run build
```

## Bidrag

Vi ønsker bidrag velkommen! Se [CONTRIBUTING.md](./CONTRIBUTING.md) for detaljerte instruksjoner.

1. Fork repository
2. Opprett feature branch (`git checkout -b feature/ny-funksjon`)
3. Commit endringer (`git commit -am 'feat: legg til ny funksjon'`)
4. Push til branch (`git push origin feature/ny-funksjon`)
5. Opprett Pull Request

## Support

- 📖 Dokumentasjon: Se guides og SPEC.md
- 🐛 Bug reports: [GitHub Issues](https://github.com/Granbaret23/garasje-avlesning/issues)
- 💡 Feature requests: [GitHub Issues](https://github.com/Granbaret23/garasje-avlesning/issues)
- 📧 Direkte kontakt: Opprett en GitHub Discussion

## Lisens

MIT License - se [LICENSE](LICENSE) fil for detaljer.

## Contributors

Takk til alle som bidrar til dette prosjektet! 🙏

<!-- Add contributor list here when we have contributors -->
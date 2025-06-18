# Garasje Avlesning App - Teknisk Spesifikasjon

## 1. Prosjektoversikt

### 1.1 Formål
En Docker-basert webapplikasjon for registrering og sporing av målerverdier (minusmålere) i garasje, med automatisk synkronisering til Google Sheets eller Excel-filer.

### 1.2 Hovedfunksjoner
- Fotografering av målere med mobil/nettbrett
- Manuell registrering av måleravlesninger
- Automatisk synkronisering til Google Sheets
- Historikk og rapportering
- Enkel deployment på Unraid som Docker container

## 2. Funksjonskrav

### 2.1 Brukerhistorier

#### Som bruker ønsker jeg å:
- **US001**: Ta bilde av måler og få registrert avlesning automatisk
- **US002**: Manuelt skrive inn måleravlesning når bilde ikke fungerer
- **US003**: Se liste over alle målere med siste avlesning
- **US004**: Se historikk for en spesifikk måler
- **US005**: Legge til nye målere i systemet
- **US006**: Redigere eller slette feilregistrerte avlesninger
- **US007**: Få data automatisk synkronisert til Google Sheets
- **US008**: Eksportere data til Excel-fil som backup

### 2.2 Tekniske krav
- Responsivt design som fungerer på mobil, nettbrett og PC
- Offline-kapasitet med lokal lagring
- Sikker autentisering og autorisasjon
- RESTful API design
- Docker container under 500MB
- Støtte for norske datoformater

## 3. Teknisk Arkitektur

### 3.1 Overordnet arkitektur
```
[Frontend - React] ←→ [Backend API - Node.js] ←→ [Database - SQLite]
                                ↓
[Google Sheets API] ←→ [External Services]
```

### 3.2 Teknologistack

#### Frontend
- **Framework**: React 18+ med TypeScript
- **Styling**: Tailwind CSS for responsivt design
- **Kamera**: HTML5 Media Capture API
- **State Management**: React Context API
- **HTTP Client**: Axios

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js med TypeScript
- **Database**: SQLite3 med better-sqlite3 driver
- **Autentisering**: JWT tokens
- **Validering**: Joi schema validation
- **Logging**: Winston logger

#### Integrasjoner
- **Google Sheets**: Google Sheets API v4
- **Excel Export**: ExcelJS bibliotek
- **Bildebehandling**: Sharp for bildekomprimering

### 3.3 Deployment
- **Container**: Docker med Alpine Linux base
- **Reverse Proxy**: Nginx for statiske filer
- **Persistent Storage**: Docker volumes
- **Port**: 3000 (konfigurerbar)

## 4. Database Design

### 4.1 Schema

#### Tabell: meters
```sql
CREATE TABLE meters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    meter_type TEXT DEFAULT 'electric',
    unit TEXT DEFAULT 'kWh',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabell: readings
```sql
CREATE TABLE readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meter_id INTEGER NOT NULL,
    value REAL NOT NULL,
    reading_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_path TEXT,
    input_method TEXT CHECK(input_method IN ('manual', 'photo', 'ocr')),
    synced_to_sheets BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
);
```

#### Tabell: config
```sql
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API Spesifikasjon

### 5.1 Base URL
- Development: `http://localhost:3000/api`
- Production: `http://[unraid-ip]:[port]/api`

### 5.2 Endpoints

#### Målere
- `GET /meters` - Hent alle målere
- `POST /meters` - Opprett ny måler
- `GET /meters/:id` - Hent spesifikk måler
- `PUT /meters/:id` - Oppdater måler
- `DELETE /meters/:id` - Slett måler

#### Avlesninger
- `GET /readings` - Hent alle avlesninger (med pagination)
- `POST /readings` - Opprett ny avlesning
- `GET /readings/:id` - Hent spesifikk avlesning
- `PUT /readings/:id` - Oppdater avlesning
- `DELETE /readings/:id` - Slett avlesning
- `GET /meters/:id/readings` - Hent avlesninger for spesifikk måler

#### Bildeupload
- `POST /upload/image` - Last opp målerbilde
- `GET /images/:filename` - Hent bilde

#### Synkronisering
- `POST /sync/sheets` - Manuell synkronisering til Google Sheets
- `GET /export/excel` - Eksporter til Excel-fil

### 5.3 Eksempel API Responser

#### GET /meters
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Lader Elbil",
      "location": "Garasje høyre vegg",
      "meter_type": "electric",
      "unit": "kWh",
      "latest_reading": {
        "value": 1234.5,
        "reading_date": "2024-01-15T10:30:00Z"
      }
    }
  ]
}
```

#### POST /readings
```json
{
  "meter_id": 1,
  "value": 1235.7,
  "input_method": "manual",
  "notes": "Avlest 15. januar"
}
```

## 6. Frontend Design

### 6.1 Sidestruktur
- **Dashboard** (`/`) - Oversikt over alle målere
- **Ny Avlesning** (`/reading/new`) - Registrer ny avlesning
- **Målerdetaljer** (`/meter/:id`) - Historikk for spesifikk måler
- **Administrasjon** (`/admin`) - Administrer målere og innstillinger
- **Innstellinger** (`/settings`) - Google Sheets konfigurasjon

### 6.2 Komponenter
- `MeterCard` - Viser målerstatus på dashboard
- `CameraCapture` - Håndterer bildeopptak
- `ReadingForm` - Skjema for manuell registrering
- `ReadingHistory` - Tabell med historiske avlesninger
- `AdminPanel` - Administrasjonsfunksjoner

### 6.3 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 7. Docker Deployment

### 7.1 Dockerfile Struktur
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 7.2 Docker Compose
```yaml
version: '3.8'
services:
  garasje-avlesning:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/readings.db
```

### 7.3 Unraid Template
- **Repository**: `ditt-dockerhub-navn/garasje-avlesning`
- **Port**: 3000 (konfigurerbar)
- **Volumes**: 
  - `/mnt/user/appdata/garasje-avlesning/data:/app/data`
  - `/mnt/user/appdata/garasje-avlesning/uploads:/app/uploads`

## 8. Google Sheets Integrasjon

### 8.1 Autentisering
- Service Account med JSON nøkkelfil
- Google Sheets API v4 tilgang
- Konfigurasjon via environment variabler

### 8.2 Dataformat i Google Sheets
| Dato | Måler | Lokasjon | Verdi | Enhet | Notater |
|------|-------|----------|-------|-------|---------|
| 2024-01-15 | Lader Elbil | Garasje høyre | 1234.5 | kWh | Manuell avlesning |

### 8.3 Synkronisering
- Automatisk synkronisering hver time
- Manuell synkronisering via admin-panel
- Feilhåndtering med retry-logikk

## 9. Testing Strategi

### 9.1 Enhetstesting
- Backend API endpoints (Jest + Supertest)
- Database operasjoner
- Utility funksjoner

### 9.2 Integrasjonstesting
- Google Sheets API integrasjon
- Database migrasjoner
- Docker container testing

### 9.3 E2E Testing
- Kritiske brukerflyter med Playwright
- Kamera-funksjonalitet på ekte enheter

## 10. Sikkerhet

### 10.1 Autentisering
- JWT-basert autentisering
- Passord-beskyttet admin-område
- Session timeout (24 timer)

### 10.2 Data Security
- HTTPS påkrevd i produksjon
- Input validering på alle endpoints
- SQL injection beskyttelse
- File upload begrensninger

### 10.3 API Security
- Rate limiting
- CORS konfigurasjon
- Environment-baserte secrets

## 11. Vedlikehold og Logging

### 11.1 Logging
- Strukturert logging med Winston
- Log levels: error, warn, info, debug
- Roterende log-filer

### 11.2 Monitoring
- Health check endpoint (`/health`)
- Database størrelse monitoring
- API response time tracking

### 11.3 Backup
- Automatisk database backup
- Export til Excel som backup
- Docker volume backup rutiner

## 12. Fremtidige Utvidelser

### 12.1 Mulige forbedringer
- OCR for automatisk avlesning av bilder
- Push-notifikasjoner for påminnelser
- Grafer og visualiseringer
- Multi-tenant støtte
- Mobile app (React Native)
- Integration med Home Assistant

### 12.2 Skalerbarhet
- PostgreSQL som database alternativ
- Redis for caching
- Load balancing support
- Kubernetes deployment

## 13. Implementasjonsplan

### Fase 1: Minimum Viable Product (MVP)
1. Grunnleggende prosjektstruktur
2. Database setup og API
3. Enkel frontend med manuell registrering
4. Docker deployment

### Fase 2: Kjernefunksjonalitet
1. Kamera-integrasjon
2. Google Sheets synkronisering
3. Administrasjonspanel
4. Responsivt design

### Fase 3: Forbedringer
1. Feilhåndtering og validering
2. Testing suite
3. Dokumentasjon
4. Performance optimering

## 14. Leveranse

### 14.1 Dokumentasjon som leveres
- README.md med installasjonsinstruksjoner
- API dokumentasjon
- Unraid deployment guide
- Google Sheets setup guide

### 14.2 Kode kvalitet
- TypeScript for type safety
- ESLint og Prettier for kode formatting
- Kommentert kode der nødvendig
- Git commit guidelines
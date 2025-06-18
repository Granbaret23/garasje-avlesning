# Deployment Guide - Garasje Avlesning

Denne guiden forklarer hvordan du setter opp og deployer Garasje Avlesning appen på forskjellige platformer.

## Innholdsfortegnelse

1. [Krav](#krav)
2. [Lokal Utvikling](#lokal-utvikling)
3. [Docker Deployment](#docker-deployment)
4. [Unraid Deployment](#unraid-deployment)
5. [Google Sheets Setup](#google-sheets-setup)
6. [Feilsøking](#feilsøking)

## Krav

### Minimum System Krav
- Docker 20.10+ og Docker Compose
- 512MB RAM
- 2GB disk space
- Internettforbindelse for Google Sheets sync

### Støttede Platformer
- Unraid 6.9+
- Docker på Linux/Windows/macOS
- Any system with Docker support

## Lokal Utvikling

### Forutsetninger
- Node.js 18+ og npm
- Git

### Oppstart

1. **Klon repository**
```bash
git clone https://github.com/torsteinpaulsen/garasje-avlesning.git
cd garasje-avlesning
```

2. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Rediger .env etter behov
npm run dev
```

3. **Frontend setup** (nytt terminal vindu)
```bash
cd frontend
npm install
cp .env.example .env
# Rediger .env etter behov
npm start
```

4. **Tilgang**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API dokumentasjon: http://localhost:3001/api

## Docker Deployment

### Med Docker Compose (Anbefalt)

1. **Last ned filer**
```bash
curl -O https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning/main/.env.example
```

2. **Konfigurer miljøvariabler**
```bash
cp .env.example .env
# Rediger .env med dine innstillinger
```

3. **Opprett data mapper**
```bash
mkdir -p data uploads logs config
```

4. **Start applikasjonen**
```bash
docker-compose up -d
```

5. **Sjekk status**
```bash
docker-compose logs -f
```

### Med Docker Run

```bash
docker run -d \
  --name garasje-avlesning \
  -p 3000:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/config:/app/config \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/data/readings.db \
  --restart unless-stopped \
  torsteinpaulsen/garasje-avlesning:latest
```

## Unraid Deployment

> **📖 DETALJERT GUIDE**: Se [UNRAID-SETUP.md](./UNRAID-SETUP.md) for steg-for-steg instruksjoner med screenshots og feilsøking.

### Metode 1: Add Container (Anbefalt)

Den enkleste måten å installere på Unraid:

1. **Gå til Docker tab** i Unraid WebUI
2. **Klikk "Add Container"**
3. **Kopier verdier** fra [docker/unraid-manual-setup.txt](./docker/unraid-manual-setup.txt)
4. **Klikk "Apply"** og vent på oppstart

**Hurtig Copy/Paste konfigurasjon:**
- **Repository**: `torsteinpaulsen/garasje-avlesning:latest`
- **Port**: `3000:3001`
- **Volumes**: 4 stk til `/mnt/user/appdata/garasje-avlesning/`
- **Extra Parameters**: `--restart=unless-stopped`

### Metode 2: Import Template

1. **Last ned optimalisert template**:
```bash
wget -O /boot/config/plugins/dockerMan/templates-user/garasje-avlesning.xml \
https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning/main/docker/unraid-template-optimized.xml
```

2. **Gå til Docker tab** → **Add Container** → **Velg template**
3. **Konfigurer og Apply**

### Metode 3: Community Applications

*Kommer snart når app er publisert til Community Applications*

## Google Sheets Setup

### 1. Opprett Google Cloud Project

1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opprett nytt prosjekt eller velg eksisterende
3. Aktiver Google Sheets API:
   - Gå til "APIs & Services" > "Library"
   - Søk etter "Google Sheets API"
   - Klikk "Enable"

### 2. Opprett Service Account

1. Gå til "APIs & Services" > "Credentials"
2. Klikk "Create Credentials" > "Service account"
3. Fyll inn navn (f.eks. "garasje-avlesning-service")
4. Klikk "Create and Continue"
5. Velg rolle "Editor" eller "Owner"
6. Klikk "Done"

### 3. Last ned Service Account Key

1. Klikk på den opprettede service account
2. Gå til "Keys" tab
3. Klikk "Add Key" > "Create new key"
4. Velg JSON format
5. Last ned filen

### 4. Opprett Google Sheet

1. Gå til [Google Sheets](https://sheets.google.com)
2. Opprett nytt spreadsheet
3. Gi det et navn (f.eks. "Garasje Avlesninger")
4. Kopier spreadsheet ID fra URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### 5. Del Sheet med Service Account

1. Åpne spreadsheet
2. Klikk "Share" øverst til høyre
3. Legg til service account email (fra JSON-filen)
4. Gi "Editor" tilgang
5. Klikk "Send"

### 6. Konfigurer App

1. **Plasser service account fil**:
   ```bash
   # For Docker Compose
   cp service-account.json ./config/google-service-account.json
   
   # For Unraid
   cp service-account.json /mnt/user/appdata/garasje-avlesning/config/google-service-account.json
   ```

2. **Oppdater miljøvariabler**:
   ```bash
   GOOGLE_SERVICE_ACCOUNT_PATH=/app/config/google-service-account.json
   GOOGLE_SHEET_ID=your-spreadsheet-id-here
   ```

3. **Restart container** for å aktivere endringene

## Miljøvariabler

### Backend Environment Variables

| Variabel | Standard | Beskrivelse |
|----------|----------|-------------|
| `NODE_ENV` | `development` | Miljø (development/production) |
| `PORT` | `3001` | Server port |
| `DATABASE_PATH` | `../data/readings.db` | Database fil path |
| `UPLOAD_DIR` | `../uploads` | Mappe for opplastede bilder |
| `LOG_DIR` | `../logs` | Log filer mappe |
| `LOG_LEVEL` | `info` | Log level (error/warn/info/debug) |
| `CORS_ORIGIN` | `http://localhost:3000` | Tillatte CORS origins |
| `GOOGLE_SERVICE_ACCOUNT_PATH` | - | Path til Google service account JSON |
| `GOOGLE_SHEET_ID` | - | Google Sheets dokument ID |
| `SYNC_INTERVAL_MINUTES` | `60` | Synkroniseringsintervall i minutter |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limiting vindu (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` | Max requests per vindu |

### Frontend Environment Variables

| Variabel | Standard | Beskrivelse |
|----------|----------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3001/api` | Backend API URL |
| `REACT_APP_APP_NAME` | `Garasje Avlesning` | App navn |
| `REACT_APP_VERSION` | `1.0.0` | App versjon |

## Sikkerhet

### Nettverkssikkerhet
- Endre standard port hvis ønskelig
- Bruk reverse proxy (nginx/Traefik) for HTTPS
- Begrens tilgang med firewall regler

### Data Sikkerhet
- Service account JSON filen inneholder sensitive data
- Sett riktige fil-permissjoner (600) på service account filen
- Regelmessig backup av data mappen

### Tilgangskontroll
- Appen har ikke innebygd autentisering
- Bruk reverse proxy med auth hvis eksponert til internett
- Vurder VPN tilgang for ekstern bruk

## Backup og Gjenoppretting

### Backup
```bash
# Backup av alle data
tar -czf garasje-avlesning-backup-$(date +%Y%m%d).tar.gz \
  data/ uploads/ config/

# Kun database backup
cp data/readings.db backup/readings-$(date +%Y%m%d).db
```

### Gjenoppretting
```bash
# Stopp container
docker-compose down

# Gjenopprett data
tar -xzf garasje-avlesning-backup-YYYYMMDD.tar.gz

# Start container
docker-compose up -d
```

## Monitoring og Logging

### Health Check
```bash
# Sjekk app helse
curl http://localhost:3000/health

# Docker health check
docker inspect --format='{{.State.Health.Status}}' garasje-avlesning
```

### Logs
```bash
# Container logs
docker-compose logs -f

# App logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Metrics
- Besøk `/api` for API info
- Database størrelse i `data/` mappen
- Disk usage for `uploads/` mappen

## Oppgradering

### Docker Compose
```bash
# Pull nyeste image
docker-compose pull

# Restart med ny versjon
docker-compose up -d
```

### Manual Docker
```bash
# Stopp eksisterende container
docker stop garasje-avlesning
docker rm garasje-avlesning

# Pull ny versjon
docker pull torsteinpaulsen/garasje-avlesning:latest

# Start ny container (samme kommando som før)
docker run -d ...
```

## Feilsøking

### Vanlige Problemer

**Container starter ikke**
- Sjekk port konflikter: `netstat -tulpn | grep :3000`
- Verifiser volume paths eksisterer
- Sjekk container logs: `docker logs garasje-avlesning`

**Kan ikke koble til database**
- Sjekk fil permissions på data mappen
- Verifiser DATABASE_PATH environment variabel
- Sjekk disk space: `df -h`

**Google Sheets sync virker ikke**
- Verifiser service account JSON fil er tilgjengelig
- Sjekk Sheet ID er korrekt
- Test tilkobling via `/api/sync/test` endpoint
- Sjekk at service account har tilgang til sheet

**Bilder lastes ikke opp**
- Sjekk UPLOAD_DIR permissions
- Verifiser disk space i uploads mappen
- Test med mindre bildefiler først

**Frontend kobler ikke til backend**
- Sjekk REACT_APP_API_URL environment variabel
- Verifiser backend er tilgjengelig på konfigurert port
- Sjekk CORS konfiguration

### Debug Mode

Aktiver debug logging:
```bash
# Sett LOG_LEVEL til debug
LOG_LEVEL=debug

# Restart container for å aktivere
docker-compose restart
```

### Support

For support og bug reports:
1. Sjekk eksisterende [GitHub Issues](https://github.com/torsteinpaulsen/garasje-avlesning/issues)
2. Opprett ny issue med:
   - System informasjon (OS, Docker versjon)
   - Container logs
   - Beskrivelse av problemet
   - Steg for å reprodusere

## Performance Tuning

### Database Optimization
- Database kjører automatisk VACUUM og ANALYZE
- Vurder å øke `PRAGMA cache_size` for store databaser

### Storage Management
- Roter log filer regelmessig
- Komprimér gamle bilder i uploads mappen
- Implementer automatisk sletting av gamle data hvis ønskelig

### Memory Usage
- Standard container bruker ~256MB RAM
- Øk til 512MB for store databaser eller høy trafikk
- Monitor med `docker stats garasje-avlesning`

---

For mer detaljert informasjon, se [SPEC.md](./SPEC.md) for teknisk dokumentasjon.
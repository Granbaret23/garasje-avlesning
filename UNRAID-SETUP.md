# Unraid Setup Guide - Garasje Avlesning

En steg-for-steg guide for å installere Garasje Avlesning på Unraid med "Add Container" metoden.

## 📋 Forutsetninger

- Unraid 6.9 eller nyere
- Internettforbindelse
- 5-10 minutter tid

## 🚀 Metode 1: Add Container (Anbefalt)

### Steg 1: Forbered Unraid

1. **Gå til Docker tab** i Unraid WebUI
2. **Klikk "Add Container"** nederst på siden
3. **Klikk "Advanced View"** øverst til høyre (viktig!)

### Steg 2: Container Grunninnstillinger

Fyll inn følgende verdier:

| Felt | Verdi |
|------|-------|
| **Name** | `Garasje-Avlesning` |
| **Repository** | `torsteinpaulsen/garasje-avlesning:latest` |
| **Network Type** | `bridge` |
| **Console shell command** | `sh` |

### Steg 3: Port Mapping

**Klikk "Add another Path, Port, Variable, Label or Device"** og velg **Port**:

| Felt | Verdi |
|------|-------|
| **Name** | `Web UI` |
| **Container Port** | `3001` |
| **Host Port** | `3000` |
| **Connection Type** | `TCP` |

### Steg 4: Volume Mappings

**Legg til 4 volumes** ved å klikke "Add another Path, Port, Variable, Label or Device" og velge **Path**:

#### Volume 1: Data
| Felt | Verdi |
|------|-------|
| **Name** | `Database Data` |
| **Container Path** | `/app/data` |
| **Host Path** | `/mnt/user/appdata/garasje-avlesning/data` |
| **Access Mode** | `Read/Write` |

#### Volume 2: Uploads
| Felt | Verdi |
|------|-------|
| **Name** | `Image Uploads` |
| **Container Path** | `/app/uploads` |
| **Host Path** | `/mnt/user/appdata/garasje-avlesning/uploads` |
| **Access Mode** | `Read/Write` |

#### Volume 3: Logs
| Felt | Verdi |
|------|-------|
| **Name** | `Log Files` |
| **Container Path** | `/app/logs` |
| **Host Path** | `/mnt/user/appdata/garasje-avlesning/logs` |
| **Access Mode** | `Read/Write` |

#### Volume 4: Config
| Felt | Verdi |
|------|-------|
| **Name** | `Configuration` |
| **Container Path** | `/app/config` |
| **Host Path** | `/mnt/user/appdata/garasje-avlesning/config` |
| **Access Mode** | `Read/Write` |

### Steg 5: Environment Variables

**Legg til environment variables** ved å klikke "Add another Path, Port, Variable, Label or Device" og velge **Variable**:

#### Grunnleggende variabler:
| Name | Key | Value |
|------|-----|-------|
| `Environment` | `NODE_ENV` | `production` |
| `Port` | `PORT` | `3001` |
| `Database Path` | `DATABASE_PATH` | `/app/data/readings.db` |
| `Upload Directory` | `UPLOAD_DIR` | `/app/uploads` |
| `Log Directory` | `LOG_DIR` | `/app/logs` |
| `Log Level` | `LOG_LEVEL` | `info` |
| `Timezone` | `TZ` | `Europe/Oslo` |

#### Google Sheets variabler (valgfritt):
| Name | Key | Value |
|------|-----|-------|
| `Google Service Account` | `GOOGLE_SERVICE_ACCOUNT_PATH` | `/app/config/google-service-account.json` |
| `Google Sheet ID` | `GOOGLE_SHEET_ID` | `(la stå tom foreløpig)` |
| `Sync Interval` | `SYNC_INTERVAL_MINUTES` | `60` |

### Steg 6: Avanserte Innstillinger

Scroll ned til **"Extra Parameters"** og legg til:
```
--restart=unless-stopped
```

### Steg 7: Start Container

1. **Klikk "Apply"** nederst på siden
2. **Vent** til Unraid laster ned image (kan ta 2-5 minutter første gang)
3. **Container skal vise som "Started"** i Docker tab

### Steg 8: Test Installasjon

1. **Klikk på container navn** i Docker tab
2. **Klikk "WebUI"** eller gå til `http://DIN-UNRAID-IP:3000`
3. **Du skal se Garasje Avlesning dashboard**

## 🔧 Metode 2: Import Template (Alternativ)

Hvis du foretrekker å bruke template:

### Steg 1: Last ned template
1. Gå til terminal på Unraid eller bruk SSH
2. Kjør:
```bash
wget -O /boot/config/plugins/dockerMan/templates-user/garasje-avlesning.xml \
https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning/main/docker/unraid-template-optimized.xml
```

### Steg 2: Bruk template
1. **Gå til Docker tab**
2. **Klikk "Add Container"**
3. **Velg "garasje-avlesning" fra dropdown**
4. **Juster innstillinger hvis ønskelig**
5. **Klikk "Apply"**

## 📊 Google Sheets Setup (Valgfritt)

Hvis du ønsker automatisk synkronisering til Google Sheets:

### Steg 1: Opprett Google Cloud Prosjekt
1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opprett nytt prosjekt
3. Aktiver Google Sheets API

### Steg 2: Service Account
1. Opprett Service Account under "APIs & Services" > "Credentials"
2. Last ned JSON nøkkelfil
3. Kopier filen til `/mnt/user/appdata/garasje-avlesning/config/google-service-account.json`

### Steg 3: Google Sheet
1. Opprett nytt Google Sheet
2. Del sheet med service account email (fra JSON fil)
3. Kopier Sheet ID fra URL
4. Legg til Sheet ID i container environment variables

### Steg 4: Restart Container
1. **Stopp container** i Docker tab
2. **Start container** igjen
3. **Synkronisering starter automatisk**

## 🛠️ Feilsøking

### Container starter ikke
- **Sjekk logs**: Klikk på container navn > "Logs"
- **Verifiser paths**: Kontroller at alle host paths eksisterer
- **Port konflikter**: Endre host port til noe annet enn 3000

### Kan ikke nå WebUI
- **Sjekk firewall**: Kontroller at port 3000 er åpen
- **Unraid IP**: Bruk riktig IP adresse til Unraid serveren
- **Container status**: Kontroller at container er "Started"

### Google Sheets virker ikke
- **Service account fil**: Kontroller at JSON filen er i riktig mappe
- **Sheet tilgang**: Verifiser at service account har tilgang til sheet
- **Sheet ID**: Dobbelsjekk at Sheet ID er korrekt

### Database problemer
- **Disk space**: Kontroller tilgjengelig plass på `/mnt/user/appdata/`
- **Permissions**: Sjekk at container kan skrive til data mappen
- **Corrupt database**: Stopp container, slett `readings.db`, start igjen

## 📱 Første gangs bruk

### Steg 1: Legg til første måler
1. **Gå til "Administrasjon"** i menyen
2. **Klikk "Ny måler"**
3. **Fyll inn**:
   - Navn: f.eks. "Lader Elbil"
   - Lokasjon: f.eks. "Garasje høyre vegg"
   - Type: Velg passende type
   - Enhet: f.eks. "kWh"
4. **Klikk "Opprett"**

### Steg 2: Registrer første avlesning
1. **Gå til "Ny Avlesning"**
2. **Velg måleren** fra dropdown
3. **Velg metode**:
   - **Ta bilde**: Bruk kamera på telefon/nettbrett
   - **Manuell**: Skriv inn verdi direkte
4. **Fyll inn verdi** og eventuelle notater
5. **Klikk "Lagre avlesning"**

### Steg 3: Se data
1. **Dashboard**: Oversikt over alle målere
2. **Klikk på måler**: Se detaljert historikk
3. **Innstillinger**: Eksporter til Excel eller sync til Google Sheets

## 🎯 Tips og Triks

### Mobile Access
- **Legg til bookmark** på hjemskjermen på telefon/nettbrett
- **Virker offline**: Registrer avlesninger uten internett
- **Automatisk sync**: Data synkroniseres når internett kommer tilbake

### Backup
- **Automatisk backup**: Alle data i `/mnt/user/appdata/garasje-avlesning/`
- **Excel eksport**: Gå til Innstillinger > "Eksporter til Excel"
- **Google Sheets**: Automatisk cloud backup hvis konfigurert

### Performance
- **Lav ressursbruk**: ~256MB RAM, minimal CPU
- **Rask database**: SQLite optimalisert for små databaser
- **Bildekomprimering**: Bilder komprimeres automatisk

---

**Lykke til med din nye måleravlesnings-app! 🏠⚡**

For mer hjelp, se [DEPLOYMENT.md](./DEPLOYMENT.md) eller opprett en issue på GitHub.
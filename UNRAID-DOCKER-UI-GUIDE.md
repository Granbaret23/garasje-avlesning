# Unraid Docker UI - Komplett Setup Guide

## 📋 Oversikt
Denne guiden viser deg EKSAKT hvordan du setter opp NocoDB og n8n via Unraid Docker UI for målerverdier med Google Sheets sync.

---

## 🟦 Del 1: Installer NocoDB

### Steg 1: Åpne Docker Tab
1. Logg inn på Unraid WebUI
2. Klikk på **"Docker"** tab
3. Klikk på **"Add Container"** knappen

### Steg 2: Fyll ut Container Detaljer

**Basic Settings:**
- **Name:** `NocoDB-Garasje`
- **Repository:** `nocodb/nocodb:latest`
- **Docker Hub URL:** `https://hub.docker.com/r/nocodb/nocodb`
- **Icon URL:** `https://raw.githubusercontent.com/nocodb/nocodb/develop/packages/nc-gui/assets/img/icons/512x512.png`

### Steg 3: Network Settings
- **Network Type:** `bridge` (default)
- **Console shell command:** `Shell` → `sh`
- **Privileged:** `OFF` (unchecked)

### Steg 4: Port Mappings
Klikk **"Add another Path, Port, Variable, Label or Device"** → Velg **"Port"**

- **Name:** `WebUI`
- **Container Port:** `8080`
- **Host Port:** `8080`
- **Connection Type:** `TCP`

### Steg 5: Volume Mappings
Klikk **"Add another Path, Port, Variable, Label or Device"** → Velg **"Path"**

- **Name:** `Data`
- **Container Path:** `/usr/app/data`
- **Host Path:** `/mnt/user/appdata/nocodb`
- **Access Mode:** `Read/Write`

### Steg 6: Environment Variables
Klikk **"Add another Path, Port, Variable, Label or Device"** → Velg **"Variable"**

**Variable 1 (REQUIRED):**
- **Name:** `JWT Secret`
- **Key:** `NC_AUTH_JWT_SECRET`
- **Value:** `your-super-secret-key-change-this-123456`
- **Description:** `JWT Secret for authentication`

**Variable 2 (OPTIONAL - Legg til hvis du får URL error):**
- **Name:** `Public URL`
- **Key:** `NC_PUBLIC_URL`
- **Value:** `http://[DIN-UNRAID-IP]:8080`
- **Description:** `Public URL for NocoDB`

**VIKTIG:** 
- Ikke legg til `NC_DB` variabel - la NocoDB håndtere database selv
- Erstatt `[DIN-UNRAID-IP]` med din faktiske Unraid IP (f.eks. `192.168.1.100`)

### Steg 7: Apply
- Klikk **"Apply"** nederst
- Container vil starte automatisk
- Vent ~30 sekunder

### Steg 8: Første Gangs Setup
1. Åpne: `http://[DIN-UNRAID-IP]:8080`
2. Lag admin bruker:
   - E-post: `din-epost@example.com`
   - Passord: `VelgEtSikkertPassord`
3. Klikk "Sign Up"

---

## 🟩 Del 2: Installer n8n

### Steg 1: Add Container
Tilbake i Docker tab → **"Add Container"**

### Steg 2: Container Detaljer

**Basic Settings:**
- **Name:** `n8n-Garasje`
- **Repository:** `n8nio/n8n:latest`
- **Docker Hub URL:** `https://hub.docker.com/r/n8nio/n8n`
- **Icon URL:** `https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png`

### Steg 3: Port Mappings
**Port 1:**
- **Name:** `WebUI`
- **Container Port:** `5678`
- **Host Port:** `5678`
- **Connection Type:** `TCP`

### Steg 4: Volume Mappings
**Path 1:**
- **Name:** `Config`
- **Container Path:** `/home/node/.n8n`
- **Host Path:** `/mnt/user/appdata/n8n`
- **Access Mode:** `Read/Write`

**Path 2:**
- **Name:** `Files`
- **Container Path:** `/files`
- **Host Path:** `/mnt/user/appdata/n8n/files`
- **Access Mode:** `Read/Write`

### Steg 5: Environment Variables

**Variable 1:**
- **Name:** `Basic Auth`
- **Key:** `N8N_BASIC_AUTH_ACTIVE`
- **Value:** `true`

**Variable 2:**
- **Name:** `Username`
- **Key:** `N8N_BASIC_AUTH_USER`
- **Value:** `admin`

**Variable 3:**
- **Name:** `Password`
- **Key:** `N8N_BASIC_AUTH_PASSWORD`
- **Value:** `DittSikkrePassord123`

**Variable 4:**
- **Name:** `Webhook URL`
- **Key:** `WEBHOOK_URL`
- **Value:** `http://[DIN-UNRAID-IP]:5678/`

**Variable 5:**
- **Name:** `Timezone`
- **Key:** `TZ`
- **Value:** `Europe/Oslo`

### Steg 6: Extra Parameters (Valgfritt)
- **Extra Parameters:** `--restart unless-stopped`

### Steg 7: Apply
- Klikk **"Apply"**
- Container starter
- Vent ~1 minutt

---

## 📊 Del 3: Konfigurer NocoDB Database

### Steg 1: Logg inn på NocoDB
1. Gå til: `http://[DIN-UNRAID-IP]:8080`
2. Logg inn med admin bruker

### Steg 2: Opprett Prosjekt
1. Klikk **"New Project"**
2. Navn: `Garasje Målerverdier`
3. Klikk **"Create"**

### Steg 3: Lag "Målere" Tabell
1. Klikk **"Add new table"**
2. Navn: `Målere`
3. Legg til kolonner:

| Kolonnenavn | Type | Innstillinger |
|-------------|------|---------------|
| navn | Single Line Text | Required |
| type | Single Select | Options: Strøm, Vann, Gass |
| lokasjon | Single Line Text | |
| enhet | Single Line Text | Default: kWh |
| siste_verdi | Number | Decimal: 2 |
| siste_avlesning | DateTime | |

### Steg 4: Lag "Avlesninger" Tabell
1. **"Add new table"** → Navn: `Avlesninger`
2. Legg til kolonner:

| Kolonnenavn | Type | Innstillinger |
|-------------|------|---------------|
| måler | Links | Link to: Målere |
| verdi | Number | Required, Decimal: 2 |
| avlest_dato | DateTime | Default: Now |
| bilde | Attachment | |
| notater | Long Text | |
| forbruk | Formula | Se under |

**Forbruk Formula:**
```
IF({måler.siste_verdi}, {verdi} - {måler.siste_verdi}, 0)
```

### Steg 5: Lag Mobilvennlig Form
1. I "Avlesninger" tabell → Views → **"Create new view"**
2. Type: **"Form"**
3. Navn: `📱 Ny Avlesning`
4. Dra feltene i ønsket rekkefølge:
   - Måler (dropdown)
   - Verdi (number)
   - Bilde (file upload)
   - Notater (text)
5. Klikk **"Share"** → Kopier link

---

## 🔄 Del 4: Sett opp n8n Workflow

### Steg 1: Logg inn på n8n
1. Gå til: `http://[DIN-UNRAID-IP]:5678`
2. Logg inn: `admin` / `DittSikkrePassord123`

### Steg 2: Opprett Google Credentials
1. Venstre meny → **"Credentials"** → **"Add credential"**
2. Søk etter: **"Google Sheets"**
3. Velg: **"Google Sheets OAuth2 API"**
4. Følg instruksjonene for å koble Google konto

### Steg 3: Opprett NocoDB Credentials
1. **"Add credential"** → Søk: **"NocoDB"**
2. Fyll ut:
   - **Host:** `http://[DIN-UNRAID-IP]:8080`
   - **API Token:** (Hent fra NocoDB → User Settings → API Tokens)

### Steg 4: Importer Workflow
1. Last ned: [n8n-workflow-template.json](https://raw.githubusercontent.com/Granbaret23/garasje-avlesning/main/n8n-workflow-template.json)
2. I n8n: **"Workflows"** → **"Import from File"**
3. Velg downloaded fil
4. Åpne workflow

### Steg 5: Konfigurer Workflow
1. Dobbeltklikk på **"Append to Google Sheets"** node
2. Endre:
   - **Credential:** Velg din Google Sheets credential
   - **Sheet ID:** Lim inn ID fra din Google Sheet URL
   - **Range:** `Avlesninger!A:I`
3. **Save** workflow

### Steg 6: Aktiver Webhook i NocoDB
1. Tilbake i NocoDB → Prosjekt settings
2. **"Webhooks"** → **"Add Webhook"**
3. Fyll ut:
   - **Title:** `n8n Sync`
   - **Event:** `After Insert`
   - **Table:** `Avlesninger`
   - **URL:** `http://n8n-Garasje:5678/webhook/nocodb-new-reading`
   - **Method:** `POST`
4. **Save**

---

## 📱 Del 5: Bruk på Mobil

### iPhone/iPad:
1. Åpne Safari
2. Gå til: `http://[DIN-UNRAID-IP]:8080`
3. Logg inn
4. Naviger til form view
5. Trykk "Del" → "Legg til på Hjem-skjerm"

### Android:
1. Åpne Chrome
2. Samme URL
3. Meny → "Legg til på startskjerm"

### Ta Avlesning:
1. Åpne app fra hjemskjerm
2. Velg måler fra dropdown
3. Ta bilde eller skriv verdi
4. Submit → Automatisk til Google Sheets!

---

## 🛠️ Feilsøking

### "Invalid URL" Error i NocoDB:
**Årsak:** Feil i environment variables

**Løsning:**
1. Stopp container
2. Edit container
3. **Fjern** disse hvis de finnes:
   - `NC_DB` variabel
   - Tomme variabler
4. **Sjekk** at `NC_PUBLIC_URL` har riktig format:
   - Riktig: `http://192.168.1.100:8080`
   - Feil: `192.168.1.100:8080` (mangler http://)
   - Feil: `http://192.168.1.100:8080/` (slash på slutten)
5. Apply og restart

**Alternativ minimal setup:**
- Fjern ALLE variabler unntatt `NC_AUTH_JWT_SECRET`
- La NocoDB bruke standard innstillinger

### NocoDB fungerer ikke:
```bash
# SSH til Unraid, kjør:
docker logs NocoDB-Garasje
```

### n8n webhook feiler:
- Sjekk at container navn er riktig: `n8n-Garasje`
- Bruk container navn, ikke IP i webhook URL
- Test webhook manuelt i n8n

### Google Sheets sync feiler:
1. Sjekk at Sheet er delt med service account
2. Verifiser Sheet ID er korrekt
3. Se execution log i n8n

### Containers kan ikke kommunisere:
1. Docker settings → Under "Docker custom network type"
2. Sett til: `bridge`
3. Restart begge containers

---

## ✅ Ferdig!

Du har nå:
- ✅ NocoDB for database og UI
- ✅ n8n for automatisk Google Sheets sync  
- ✅ Mobilvenlig løsning med bildestøtte
- ✅ Alt kjører på Unraid
- ✅ Ingen koding nødvendig!

**Tips:** Bokmerk både NocoDB form og admin panel på mobilen for rask tilgang.
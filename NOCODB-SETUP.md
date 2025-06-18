# NocoDB + n8n Setup Guide for Garasje Målerverdier

## 🚀 Rask Start (5 minutter)

### 1. Start Docker Containers

```bash
# På Unraid, kjør i terminal:
cd /mnt/user/appdata/
curl -O https://raw.githubusercontent.com/Granbaret23/garasje-avlesning/main/docker-compose-nocodb.yml
docker-compose -f docker-compose-nocodb.yml up -d
```

### 2. Første gangs oppsett

#### NocoDB (Database & UI)
1. Åpne: `http://din-unraid-ip:8080`
2. Lag admin bruker
3. Opprett nytt prosjekt: "Garasje Målerverdier"

#### Lag tabeller:

**Målere (Meters)**
- `id` (Auto increment)
- `navn` (Single line text) - f.eks "Strøm Garasje"
- `type` (Single select) - Strøm/Vann/Gass
- `lokasjon` (Single line text)
- `enhet` (Single line text) - kWh, m³, etc
- `siste_verdi` (Number) - Automatisk oppdatert

**Avlesninger (Readings)**
- `id` (Auto increment)
- `måler` (Link to Meters)
- `verdi` (Number) - Required
- `avlest_dato` (DateTime) - Default: Now
- `bilde` (Attachment) - For bilde av måler
- `notater` (Long text)
- `forbruk` (Formula) - Kalkuler differanse

### 3. Mobilvennlig Form View

1. Lag ny "Gallery View" → "Form"
2. Navn: "Ny Avlesning 📸"
3. Felt:
   - Måler (dropdown)
   - Verdi (number input)
   - Bilde (camera/upload)
   - Notater (optional)
4. Del link eller bokmerk på mobil

## 🔄 Google Sheets Automatisk Sync

### n8n Workflow Setup

1. Åpne n8n: `http://din-unraid-ip:5678`
2. Logg inn (admin/ditt-passord)

### Importer Ferdig Workflow

```json
{
  "name": "NocoDB til Google Sheets Sync",
  "nodes": [
    {
      "name": "NocoDB Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "nocodb-reading",
        "responseMode": "onReceived",
        "options": {}
      }
    },
    {
      "name": "Google Sheets Append",
      "type": "n8n-nodes-base.googleSheets",
      "position": [650, 300],
      "parameters": {
        "operation": "append",
        "sheetId": "DIN-SHEET-ID",
        "range": "A:E",
        "options": {
          "valueInputMode": "USER_ENTERED"
        }
      }
    }
  ]
}
```

### Koble til Google Sheets

1. I n8n → Credentials → New
2. Velg "Google Sheets OAuth2"
3. Følg instruksjoner for å koble til Google
4. Test connection

### NocoDB Webhook

I NocoDB:
1. Settings → Webhooks → Add Webhook
2. URL: `http://n8n-garasje:5678/webhook/nocodb-reading`
3. Trigger: After Insert (Readings table)

## 📱 Bruk på Mobil

### Legg til som App
1. Åpne `http://unraid-ip:8080` i Safari/Chrome
2. Del → Legg til på Hjem-skjerm
3. Navn: "Garasje Målere"

### Ta Avlesning
1. Åpne appen
2. Trykk "Ny Avlesning 📸"
3. Velg måler
4. Ta bilde eller skriv inn verdi
5. Send → Automatisk til Google Sheets!

## 🎯 Avanserte Features

### OCR for Automatisk Avlesing
Legg til i n8n workflow:
```javascript
// Tesseract OCR node
const image = $input.first().json.bilde;
const ocrResult = await tesseract.recognize(image);
const verdi = ocrResult.text.match(/\d+/)[0];
return { verdi: parseInt(verdi) };
```

### Forbruksrapporter
NocoDB Views:
- Månedlig forbruk (Group by month)
- Årlig statistikk (Charts)
- Sammenlign perioder

### Varsler
n8n kan sende:
- E-post ved høyt forbruk
- Discord/Telegram melding
- Push notifications

## 🔧 Feilsøking

**NocoDB starter ikke:**
```bash
docker logs nocodb-garasje
# Sjekk permissions på /mnt/user/appdata/nocodb
```

**n8n webhook fungerer ikke:**
- Sjekk at containers er på samme nettverk
- Bruk container navn, ikke localhost

**Google Sheets sync feiler:**
- Sjekk at Sheet ID er riktig
- Verifiser Google credentials i n8n

## 🎉 Ferdig!

Du har nå:
- ✅ Database for målerverdier
- ✅ Mobilvenlig UI med bildestøtte
- ✅ Automatisk Google Sheets sync
- ✅ Ingen koding nødvendig
- ✅ Fungerer på Unraid med en gang!

Besøk `http://unraid-ip:8080` for å starte!
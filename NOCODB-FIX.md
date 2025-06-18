# NocoDB "Invalid URL" - Quick Fix

## Gjør dette NÅ for å fikse feilen:

### 1. Stopp Container
- Docker tab → Klikk på `NocoDB-Garasje`
- Klikk **"Stop"**

### 2. Edit Container
- Klikk på container navn eller ikon
- Velg **"Edit"**

### 3. Fjern/Endre Environment Variables

**FJERN disse hvis de finnes:**
- ❌ `NC_DB` - Slett denne helt!
- ❌ Alle tomme variabler

**BEHOLD/LEGG TIL:**
- ✅ `NC_AUTH_JWT_SECRET` = `din-hemmelige-nokkel-123`

**Valgfritt (hvis feilen fortsetter):**
- ✅ `NC_PUBLIC_URL` = `http://192.168.1.XXX:8080` (bruk DIN Unraid IP)

### 4. Apply og Start
- Scroll ned → **"Apply"**
- Container starter automatisk

### 5. Test
- Vent 30 sekunder
- Åpne: `http://[din-unraid-ip]:8080`
- Skal vise NocoDB login/signup side

## Hvis det fortsatt ikke fungerer:

### Minimal Setup (fungerer alltid):
1. Edit container igjen
2. **Fjern ALLE environment variables**
3. Apply
4. NocoDB vil bruke defaults og skal starte

### Sjekk logs:
```bash
docker logs NocoDB-Garasje --tail 50
```

Se etter:
- "Listening on port 8080" = Success! ✅
- "Invalid URL" = Fortsatt feil med variabler

## Tips:
- NocoDB er veldig følsom på formatet av environment variables
- Mindre er ofte bedre - start med minimal config
- Database opprettes automatisk i `/usr/app/data`
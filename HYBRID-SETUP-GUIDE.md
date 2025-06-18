# Hybrid Repository Setup - Steg for Steg

Denne guiden setter opp en hybrid løsning der kildekoden forblir privat, men Unraid templates og dokumentasjon blir public.

## 🎯 Resultatet

**Etter setup vil du ha:**
- **Privat repo**: `garasje-avlesning-private` (all kildekode)
- **Public repo**: `garasje-avlesning-templates` (kun templates og docs)
- **Automatisk sync**: Script som synkroniserer templates til public repo
- **Fungerende Unraid template**: Som alle kan bruke uten tilgang til kildekode

## 📋 Steg 1: Opprett begge GitHub repositories

### 1.1 Opprett privat hovedrepository
1. Gå til [GitHub](https://github.com) → "New repository"
2. **Repository name**: `garasje-avlesning-private`
3. **Description**: `Privat repository for Garasje Avlesning app - måleravlesning med Google Sheets sync`
4. **Visibility**: 🔒 **Private**
5. **IKKE** initialiser med README, .gitignore eller license
6. Klikk "Create repository"

### 1.2 Opprett public template repository
1. Opprett nytt repository
2. **Repository name**: `garasje-avlesning-templates`
3. **Description**: `Public Unraid templates og dokumentasjon for Garasje Avlesning app`
4. **Visibility**: 🌐 **Public**
5. **IKKE** initialiser med README, .gitignore eller license
6. Klikk "Create repository"

## 🚀 Steg 2: Last opp kildekode til privat repo

```bash
# Naviger til prosjektmappen
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"

# Initialiser git repository
git init

# Legg til alle filer
git add .

# Opprett første commit
git commit -m "feat: initial private release v1.0.0

Complete Garasje Avlesning application:
- React frontend with responsive design
- Node.js backend with SQLite database
- Google Sheets integration
- Docker containerization
- Unraid templates and documentation
- Comprehensive setup guides"

# Legg til remote til PRIVAT repository (erstatt DIN-BRUKER med ditt GitHub brukernavn)
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning-private.git

# Push til privat repository
git branch -M main
git push -u origin main
```

## 📋 Steg 3: Konfigurer sync script

### 3.1 Oppdater sync script med dine repository URLs
Rediger `scripts/sync-to-public.sh` og endre disse linjene:

```bash
# Åpne i en editor
nano scripts/sync-to-public.sh

# Endre disse variablene (linje ~8-11):
PRIVATE_REPO_DIR="/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"
PUBLIC_REPO_DIR="../garasje-avlesning-templates"
PUBLIC_REPO_URL="https://github.com/DIN-BRUKER/garasje-avlesning-templates.git"
```

**Erstatt `DIN-BRUKER` med ditt GitHub brukernavn!**

### 3.2 Test sync script lokalt
```bash
# Gjør scriptet kjørbart (allerede gjort)
chmod +x scripts/sync-to-public.sh

# Opprett public repo mappe og initialiser
mkdir -p ../garasje-avlesning-templates
cd ../garasje-avlesning-templates
git init
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning-templates.git

# Gå tilbake til hovedprosjekt
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"

# Kjør sync (første gang)
./scripts/sync-to-public.sh
```

### 3.3 Push til public repository
```bash
cd ../garasje-avlesning-templates
git push -u origin main
```

## 🔧 Steg 4: Oppdater template URLs

### 4.1 Fikse template URL i optimized template
```bash
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"

# Rediger template fil
nano docker/unraid-template-optimized.xml

# Endre denne linjen (linje ~25):
# FRA:
<TemplateURL>https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning/main/docker/unraid-template-optimized.xml</TemplateURL>

# TIL:
<TemplateURL>https://raw.githubusercontent.com/DIN-BRUKER/garasje-avlesning-templates/main/docker/unraid-template-optimized.xml</TemplateURL>
```

### 4.2 Oppdater support URLs i template
```bash
# I samme fil, endre også (linje ~10-11):
# FRA:
<Support>https://github.com/torsteinpaulsen/garasje-avlesning/issues</Support>
<Project>https://github.com/torsteinpaulsen/garasje-avlesning</Project>

# TIL:
<Support>https://github.com/DIN-BRUKER/garasje-avlesning-templates/issues</Support>
<Project>https://github.com/DIN-BRUKER/garasje-avlesning-templates</Project>
```

### 4.3 Commit endringer og sync igjen
```bash
git add docker/unraid-template-optimized.xml
git commit -m "fix: update template URLs to point to public templates repo"
git push origin main

# Sync oppdaterte templates til public repo
./scripts/sync-to-public.sh
```

## 🐳 Steg 5: Docker Hub setup

### 5.1 Opprett Docker Hub repository
1. Gå til [Docker Hub](https://hub.docker.com) → "Create Repository"
2. **Name**: `garasje-avlesning`
3. **Description**: `Docker container for Garasje Avlesning - måleravlesning app`
4. **Visibility**: Public
5. Klikk "Create"

### 5.2 Manual Docker build og push (anbefalt for privat repo)
```bash
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"

# Bygg Docker image
docker build -t din-dockerhub-bruker/garasje-avlesning:latest .
docker build -t din-dockerhub-bruker/garasje-avlesning:v1.0.0 .

# Logg inn på Docker Hub
docker login

# Push images
docker push din-dockerhub-bruker/garasje-avlesning:latest
docker push din-dockerhub-bruker/garasje-avlesning:v1.0.0
```

## ✅ Steg 6: Test hybrid setup

### 6.1 Verifiser public repository
1. Gå til `https://github.com/DIN-BRUKER/garasje-avlesning-templates`
2. Sjekk at du ser:
   - README.md (template-spesifikk)
   - docker/ mappe med templates
   - docs/ mappe med dokumentasjon
   - LICENSE fil

### 6.2 Test template URL
Åpne i browser:
```
https://raw.githubusercontent.com/DIN-BRUKER/garasje-avlesning-templates/main/docker/unraid-template-optimized.xml
```
Du skal se XML innholdet.

### 6.3 Test Docker image
```bash
# Test at Docker image fungerer
docker run -d -p 3000:3001 --name garasje-test din-dockerhub-bruker/garasje-avlesning:latest

# Test health endpoint
sleep 10
curl http://localhost:3000/health

# Cleanup
docker stop garasje-test && docker rm garasje-test
```

## 🔄 Steg 7: Fremtidig workflow

### Når du gjør endringer i kildekode:
```bash
# Commit til privat repo som normalt
git add .
git commit -m "feat: ny funksjonalitet"
git push origin main
```

### Når du endrer templates eller dokumentasjon:
```bash
# Etter commit til privat repo
./scripts/sync-to-public.sh

# Dette synkroniserer automatisk:
# - Unraid templates
# - Dokumentasjon (README, setup guides)
# - LICENSE fil
```

### Når du vil release ny versjon:
```bash
# Tag i privat repo
git tag -a v1.1.0 -m "Release v1.1.0 - nye funksjoner"
git push origin v1.1.0

# Bygg og push ny Docker image
docker build -t din-dockerhub-bruker/garasje-avlesning:v1.1.0 .
docker build -t din-dockerhub-bruker/garasje-avlesning:latest .
docker push din-dockerhub-bruker/garasje-avlesning:v1.1.0
docker push din-dockerhub-bruker/garasje-avlesning:latest

# Sync til public repo
./scripts/sync-to-public.sh
```

## 🎯 Fordeler med denne setupa

✅ **Kildekode privat**: Ingen kan se din implementasjon
✅ **Templates public**: Unraid brukere kan enkelt installere
✅ **Automatisk sync**: Ett script synkroniserer templates
✅ **Issues på public repo**: Support uten tilgang til kildekode
✅ **Docker Hub public**: Alle kan bruke images
✅ **Fleksibel**: Kan gjøres helt public senere hvis ønskelig

## 🆘 Feilsøking

### Sync script feil:
```bash
# Sjekk at public repo eksisterer og har riktig remote
cd ../garasje-avlesning-templates
git remote -v

# Reset hvis nødvendig
rm -rf ../garasje-avlesning-templates
./scripts/sync-to-public.sh
```

### Template URL virker ikke:
- Sjekk at public repo er public (ikke private)
- Verifiser at template fil eksisterer i public repo
- Test URL i browser først

### Docker push feil:
```bash
# Sjekk at du er logget inn
docker login

# Sjekk at repository navnet matcher
docker images | grep garasje-avlesning
```

## 🎉 Ferdig!

Du har nå en fungerende hybrid setup der:
- **Privat kildekode** er beskyttet
- **Public templates** gjør Unraid installasjon enkelt
- **Automatisk synkronisering** holder public repo oppdatert

**Neste:** Test installasjon på Unraid med den nye template URL! 🚀
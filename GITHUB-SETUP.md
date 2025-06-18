# GitHub Repository Setup Guide

En steg-for-steg guide for å sette opp GitHub repository og Docker Hub integrasjon for Garasje Avlesning prosjektet.

## 📋 Forutsetninger

- GitHub konto
- Docker Hub konto
- Git installert lokalt

## 🚀 Steg 1: Opprett GitHub Repository

### 1.1 Opprett Repository
1. Gå til [GitHub](https://github.com) og logg inn
2. Klikk "New repository" (grønn knapp øverst til høyre)
3. Fyll inn:
   - **Repository name**: `garasje-avlesning`
   - **Description**: `Docker-basert webapplikasjon for registrering av måleravlesninger med Google Sheets synkronisering`
   - **Visibility**: Public (eller Private hvis ønskelig)
   - **IKKE** initialiser med README, .gitignore eller license (vi har allerede disse)
4. Klikk "Create repository"

### 1.2 Last opp eksisterende kode
```bash
# Naviger til prosjektmappen
cd /path/to/garasje-avlesning

# Initialiser git repository
git init

# Legg til alle filer
git add .

# Opprett første commit
git commit -m "feat: initial release of Garasje Avlesning v1.0.0

- Complete Docker-based meter reading application
- React frontend with responsive design
- Node.js backend with SQLite database
- Google Sheets integration
- Unraid Docker template
- Comprehensive documentation"

# Legg til remote origin (erstatt 'torsteinpaulsen' med ditt GitHub brukernavn)
git remote add origin https://github.com/torsteinpaulsen/garasje-avlesning.git

# Push til GitHub
git branch -M main
git push -u origin main
```

## 🐳 Steg 2: Sett opp Docker Hub

### 2.1 Opprett Docker Hub Repository
1. Gå til [Docker Hub](https://hub.docker.com) og logg inn
2. Klikk "Create Repository"
3. Fyll inn:
   - **Name**: `garasje-avlesning`
   - **Description**: `Docker-basert måleravlesning app med Google Sheets sync`
   - **Visibility**: Public
4. Klikk "Create"

### 2.2 Koble GitHub til Docker Hub
1. Gå til ditt Docker Hub repository
2. Klikk på "Builds" tab
3. Klikk "Configure Automated Builds"
4. Velg "GitHub" som source
5. Autorisér Docker Hub til å få tilgang til GitHub
6. Velg `garasje-avlesning` repository
7. Konfigurer build rules:
   - **Source Type**: Branch
   - **Source**: main
   - **Docker Tag**: latest
   - **Dockerfile location**: /Dockerfile
8. Klikk "Save and Build"

## 🔐 Steg 3: GitHub Secrets for Actions

For at GitHub Actions skal kunne pushe til Docker Hub, trenger vi secrets:

### 3.1 Opprett Docker Hub Access Token
1. Gå til Docker Hub → Account Settings → Security
2. Klikk "New Access Token"
3. Navn: `github-actions-garasje-avlesning`
4. Permissions: Read, Write, Delete
5. Kopier token (vises kun én gang!)

### 3.2 Legg til GitHub Secrets
1. Gå til GitHub repository → Settings → Secrets and variables → Actions
2. Klikk "New repository secret" og legg til:

**Secret 1:**
- **Name**: `DOCKERHUB_USERNAME`
- **Value**: Ditt Docker Hub brukernavn

**Secret 2:**
- **Name**: `DOCKERHUB_TOKEN`
- **Value**: Access token fra steg 3.1

## 🏷️ Steg 4: Opprett første release

### 4.1 Tag og release
```bash
# Opprett og push tag for v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0

Initial release with complete functionality:
- Meter management and reading registration
- Google Sheets integration
- Unraid Docker template
- Comprehensive documentation"

git push origin v1.0.0
```

### 4.2 Opprett GitHub Release
1. Gå til GitHub repository → Releases
2. Klikk "Create a new release"
3. Fyll inn:
   - **Tag**: v1.0.0 (velg eksisterende tag)
   - **Title**: `Garasje Avlesning v1.0.0`
   - **Description**: Kopier fra CHANGELOG.md
4. Klikk "Publish release"

## 🔄 Steg 5: Test GitHub Actions

GitHub Actions skal nå kjøre automatisk:

### 5.1 Sjekk Workflows
1. Gå til GitHub repository → Actions
2. Du skal se to workflows:
   - **Test**: Kjører på hver push/PR
   - **Build and Push Docker Image**: Kjører på push til main og tags

### 5.2 Verifiser Docker Build
1. Vent til workflows er ferdige (grønne checkmarks)
2. Gå til Docker Hub repository
3. Du skal se:
   - `latest` tag (fra main branch)
   - `v1.0.0` tag (fra release tag)
   - `1.0` tag (automatisk fra semver)

## 📋 Steg 6: Oppdater dokumentasjon

### 6.1 Erstatt placeholder URLs
Hvis du bruker et annet brukernavn enn "torsteinpaulsen", oppdater disse filene:

```bash
# Finn og erstatt alle referanser
grep -r "torsteinpaulsen" . --include="*.md" --include="*.xml" --include="*.txt"

# Erstatt med ditt brukernavn i:
# - README.md
# - DEPLOYMENT.md
# - UNRAID-SETUP.md
# - docker/unraid-template-optimized.xml
# - docker/unraid-manual-setup.txt
```

### 6.2 Commit endringer
```bash
git add .
git commit -m "docs: update repository URLs with correct username"
git push origin main
```

## 🎯 Steg 7: Test hele pipeline

### 7.1 Test lokal Docker build
```bash
# Test at Docker image bygger lokalt
docker build -t garasje-avlesning-test .

# Test at container starter
docker run -d -p 3000:3001 garasje-avlesning-test

# Test at app fungerer
curl http://localhost:3000/health
```

### 7.2 Test Docker Hub image
```bash
# Pull fra Docker Hub
docker pull torsteinpaulsen/garasje-avlesning:latest

# Test at det fungerer
docker run -d -p 3001:3001 torsteinpaulsen/garasje-avlesning:latest
```

## 📋 Steg 8: Community Applications (Unraid)

### 8.1 Forbered for Community Applications
1. Repository må være public
2. Template må være tilgjengelig på raw.githubusercontent.com
3. Test at template URL fungerer:
   ```
   https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning/main/docker/unraid-template-optimized.xml
   ```

### 8.2 Submit til Community Applications (valgfritt)
1. Fork [Unraid Community Applications](https://github.com/Squidly271/ca_templates)
2. Legg til din template i riktig kategori
3. Opprett Pull Request

## ✅ Ferdig!

Ditt repository er nå klart med:

- ✅ GitHub repository med komplett kode
- ✅ Automatisk Docker Hub builds
- ✅ GitHub Actions for testing og deployment
- ✅ Versjonerte releases
- ✅ Community-ready dokumentasjon
- ✅ Unraid template som fungerer

## 🎯 Neste steg

1. **Test alt fungerer**: Deploy på Unraid og test funksjonaliteten
2. **Del med community**: Post på Unraid forums eller Reddit
3. **Fortsett utvikling**: Legg til nye features via Pull Requests
4. **Vedlikehold**: Overvåk issues og oppdater når nødvendig

## 📞 Support

Hvis du har problemer med oppsettet:
1. Sjekk GitHub Actions logs for build errors
2. Verifiser Docker Hub integrasjon
3. Test template URLs i browser
4. Opprett issue på GitHub repository
# Quick Start - Hybrid Setup

En forenklet guide for å komme i gang med hybrid repository setup.

## 🚀 TL;DR - 5 minutter setup

### 1. Opprett repositories på GitHub
- **Privat**: `garasje-avlesning-private` 
- **Public**: `garasje-avlesning-templates`

### 2. Kjør disse kommandoene
```bash
# Gå til prosjektmappen
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"

# Initialiser git og push til privat repo
git init
git add .
git commit -m "feat: initial private release v1.0.0"
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning-private.git
git push -u origin main

# Rediger sync script med ditt brukernavn
nano scripts/sync-to-public.sh
# Endre "DIN-BRUKER" til ditt GitHub brukernavn

# Opprett public repo directory
mkdir -p ../garasje-avlesning-templates
cd ../garasje-avlesning-templates
git init
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning-templates.git

# Gå tilbake og sync første gang
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"
./scripts/sync-to-public.sh

# Push til public repo
cd ../garasje-avlesning-templates
git push -u origin main
```

### 3. Oppdater template URLs
```bash
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"

# Rediger template fil
nano docker/unraid-template-optimized.xml

# Endre alle "torsteinpaulsen" til "DIN-BRUKER"
# Spesielt TemplateURL, Support og Project linjer

# Commit og sync
git add .
git commit -m "fix: update template URLs to public repo"
git push origin main
./scripts/sync-to-public.sh
```

### 4. Docker Hub (valgfritt)
```bash
# Bygg og push Docker image
docker build -t din-dockerhub-bruker/garasje-avlesning:latest .
docker login
docker push din-dockerhub-bruker/garasje-avlesning:latest
```

## ✅ Test at det fungerer

1. **Template URL**: `https://raw.githubusercontent.com/DIN-BRUKER/garasje-avlesning-templates/main/docker/unraid-template-optimized.xml`
2. **Public repo**: `https://github.com/DIN-BRUKER/garasje-avlesning-templates`
3. **Docker image**: `docker run -d -p 3000:3001 din-dockerhub-bruker/garasje-avlesning:latest`

## 🔄 Daglig bruk

**Når du gjør endringer:**
```bash
# Commit til privat repo som normalt
git add .
git commit -m "beskrivelse av endring"
git push origin main

# Sync templates hvis du endret dokumentasjon/templates
./scripts/sync-to-public.sh
```

**Det er det!** 🎉

Se [HYBRID-SETUP-GUIDE.md](HYBRID-SETUP-GUIDE.md) for detaljert guide med feilsøking.
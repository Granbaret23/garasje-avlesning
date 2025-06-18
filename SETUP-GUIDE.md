# Setup Guide - Velg din tilnærming

Dette dokumentet hjelper deg med å velge og sette opp GitHub repository for Garasje Avlesning prosjektet.

## 🎯 Hvilken tilnærming passer for deg?

### 🔒 Jeg vil ha PRIVAT repository
**Hvem:** Du vil beholde kildekoden privat, kun for personlig bruk
**Konsekvenser:** Unraid template må installeres manuelt
**Setup:** Se [Privat Repository Setup](#privat-repository-setup)

### 🌐 Jeg vil ha PUBLIC repository  
**Hvem:** Du vil dele med community og få bidrag
**Konsekvenser:** Kildekode blir synlig for alle
**Setup:** Se [Public Repository Setup](#public-repository-setup)

### 🔄 Jeg vil ha HYBRID (anbefalt)
**Hvem:** Privat kode, men public templates for enkel Unraid bruk
**Konsekvenser:** Mest kompleks setup, men beste funksjonalitet
**Setup:** Se [Hybrid Repository Setup](#hybrid-repository-setup)

---

## 🔒 Privat Repository Setup

### Steg 1: Opprett privat GitHub repository
1. Gå til GitHub → New repository
2. Navn: `garasje-avlesning`
3. **Velg "Private"**
4. Ikke initialiser med README

### Steg 2: Last opp kode
```bash
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"
git init
git add .
git commit -m "feat: initial private release v1.0.0"
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning.git
git branch -M main
git push -u origin main
```

### Steg 3: Sett opp Docker Hub (valgfritt)
- Opprett public Docker Hub repository
- Manuell push av images (GitHub Actions vil ikke fungere for private repos på gratis plan)

### Steg 4: Unraid template installasjon
**For andre brukere:**
1. Del `docker/unraid-template-private.xml` filen direkte
2. Eller gi dem verdiene fra `docker/unraid-manual-setup.txt`
3. Manuell "Add Container" setup

---

## 🌐 Public Repository Setup

### Steg 1: Opprett public GitHub repository
1. Gå til GitHub → New repository  
2. Navn: `garasje-avlesning`
3. **Velg "Public"**
4. Ikke initialiser med README

### Steg 2: Last opp kode
```bash
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"
git init
git add .
git commit -m "feat: initial public release v1.0.0"
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning.git
git branch -M main
git push -u origin main
```

### Steg 3: Sett opp Docker Hub auto-build
1. Følg instruksjonene i `GITHUB-SETUP.md`
2. Konfigurer GitHub Secrets for Docker Hub
3. GitHub Actions bygger automatisk

### Steg 4: Test Unraid template
Template URL fungerer automatisk:
```
https://raw.githubusercontent.com/DIN-BRUKER/garasje-avlesning/main/docker/unraid-template-optimized.xml
```

---

## 🔄 Hybrid Repository Setup

### Steg 1: Opprett privat hovedrepository
```bash
# Opprett privat repo: garasje-avlesning-private
cd "/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"
git init
git add .
git commit -m "feat: initial private release v1.0.0"
git remote add origin https://github.com/DIN-BRUKER/garasje-avlesning-private.git
git push -u origin main
```

### Steg 2: Opprett public template repository
```bash
# Opprett public repo: garasje-avlesning-templates
# Bruk sync scriptet for å kopiere kun templates
chmod +x scripts/sync-to-public.sh
./scripts/sync-to-public.sh
```

### Steg 3: Konfigurer template URLs
Oppdater template til å peke på public repo:
```xml
<TemplateURL>https://raw.githubusercontent.com/DIN-BRUKER/garasje-avlesning-templates/main/docker/unraid-template-optimized.xml</TemplateURL>
```

### Steg 4: Docker Hub setup
- Public Docker Hub repository
- Auto-build fra privat repo (krever Docker Hub Pro) eller manual push

---

## 🔧 Etter Setup - Neste steg

### For alle alternativer:

1. **Test Docker image lokalt**:
```bash
docker build -t garasje-avlesning-test .
docker run -d -p 3000:3001 garasje-avlesning-test
curl http://localhost:3000/health
```

2. **Test på Unraid**:
- Følg UNRAID-SETUP.md guide
- Bruk riktig template for din setup
- Verifiser at alle volumes og ports fungerer

3. **Konfigurer Google Sheets** (valgfritt):
- Følg Google Sheets setup i DEPLOYMENT.md
- Test synkronisering

### For public/hybrid repos:

4. **Sett opp GitHub Actions**:
- Konfigurer Docker Hub secrets
- Test at builds fungerer
- Opprett release tags

5. **Community sharing**:
- Post på Unraid forums
- Del på r/unRAID subreddit
- Vurder Community Applications submission

---

## 🆘 Trenger du hjelp?

### Avhengig av din setup:

**Privat repo issues:**
- Check repository settings
- Verifiser Docker Hub push manual
- Test template deling med andre

**Public repo issues:**  
- Check GitHub Actions logs
- Verifiser Docker Hub auto-build
- Test template URL i browser

**Hybrid repo issues:**
- Sync script problemer
- Public/private permissions
- Template URL konfigurasjon

### Generell hjelp:
- Les DEPLOYMENT.md for detaljert info
- Check UNRAID-SETUP.md for Unraid-spesifikke problemer
- Opprett issue på GitHub (for public repos)

---

## 📋 Quick Reference

| Feature | Privat | Public | Hybrid |
|---------|--------|--------|--------|
| Kildekode sikkerhet | ✅ | ❌ | ✅ |
| Auto Unraid templates | ❌ | ✅ | ✅ |
| GitHub Actions (gratis) | ❌ | ✅ | Delvis |
| Community bidrag | ❌ | ✅ | ❌ |
| Enkel deling | ❌ | ✅ | ✅ |
| Setup kompleksitet | Lav | Lav | Høy |

**Anbefaling:** Start med **Public** hvis du er komfortabel med åpen kildekode, eller **Privat** hvis du vil ha full kontroll. **Hybrid** er best for de som vil ha begge deler.
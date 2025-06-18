#!/bin/bash

# Script to sync only templates and documentation to public repository
# This allows keeping source code private while making templates public

set -e

# Configuration - OPPDATER DISSE MED DINE VERDIER!
PRIVATE_REPO_DIR="/Users/torsteinpaulsen/.cursor/Garaasje Avlesning"
PUBLIC_REPO_DIR="../garasje-avlesning-templates"
PUBLIC_REPO_URL="https://github.com/DIN-BRUKER/garasje-avlesning-templates.git"  # ENDRE DIN-BRUKER!

echo "🔄 Syncing templates and docs to public repository..."

# Create public repo directory if it doesn't exist
if [ ! -d "$PUBLIC_REPO_DIR" ]; then
    echo "📁 Creating public repository directory..."
    mkdir -p "$PUBLIC_REPO_DIR"
    cd "$PUBLIC_REPO_DIR"
    git init
    git remote add origin "$PUBLIC_REPO_URL"
else
    cd "$PUBLIC_REPO_DIR"
fi

# Create directory structure
mkdir -p docker docs

# Copy templates and documentation (but not source code)
echo "📋 Copying templates..."
cp "$PRIVATE_REPO_DIR/docker/unraid-template-optimized.xml" docker/
cp "$PRIVATE_REPO_DIR/docker/unraid-manual-setup.txt" docker/

echo "📖 Copying documentation..."
cp "$PRIVATE_REPO_DIR/README.md" .
cp "$PRIVATE_REPO_DIR/UNRAID-SETUP.md" docs/
cp "$PRIVATE_REPO_DIR/DEPLOYMENT.md" docs/
cp "$PRIVATE_REPO_DIR/CHANGELOG.md" docs/
cp "$PRIVATE_REPO_DIR/LICENSE" .

# Create a specific README for the templates repo
cat > README.md << 'EOF'
# Garasje Avlesning - Unraid Templates

Dette repository inneholder kun Unraid templates og dokumentasjon for Garasje Avlesning appen.

## 🚀 Hurtigstart for Unraid

### Installasjon med Add Container

1. **Gå til Docker tab** i Unraid WebUI
2. **Klikk "Add Container"**
3. **Repository**: `torsteinpaulsen/garasje-avlesning:latest`
4. **Kopier verdier** fra [docker/unraid-manual-setup.txt](docker/unraid-manual-setup.txt)
5. **Apply** og start!

### Detaljert guide

Se [docs/UNRAID-SETUP.md](docs/UNRAID-SETUP.md) for komplett setup guide.

### Template Import

Last ned template direkte:
```bash
wget -O /boot/config/plugins/dockerMan/templates-user/garasje-avlesning.xml \
https://raw.githubusercontent.com/torsteinpaulsen/garasje-avlesning-templates/main/docker/unraid-template-optimized.xml
```

## 📋 Funksjoner

- 📱 Responsivt webgrensesnitt
- 📸 Fotografering av målere
- ✋ Manuell registrering av avlesninger  
- 📊 Google Sheets synkronisering
- 📈 Historikk og rapportering
- 🐳 Docker deployment for Unraid

## 📖 Dokumentasjon

- [Unraid Setup Guide](docs/UNRAID-SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Changelog](docs/CHANGELOG.md)

## 🐳 Docker Image

Docker image er tilgjengelig på Docker Hub:
- **Repository**: `torsteinpaulsen/garasje-avlesning`
- **Tags**: `latest`, `v1.0.0`

## 📞 Support

- 🐛 Issues: [Hovedrepository issues](https://github.com/torsteinpaulsen/garasje-avlesning-private/issues)
- 📖 Dokumentasjon: Se docs/ mappen
- 💬 Diskusjoner: GitHub Discussions

## ⚠️ Merk

Dette repository inneholder kun templates og dokumentasjon. 
Kildekoden er ikke tilgjengelig i dette public repository.

## 📄 Lisens

MIT License - se [LICENSE](LICENSE) for detaljer.
EOF

echo "📝 Creating template-specific documentation..."

# Create a simplified deployment guide focused on Unraid
cat > docs/UNRAID-QUICK-START.md << 'EOF'
# Unraid Quick Start

## Enkel installasjon (5 minutter)

### 1. Add Container
1. Docker tab → "Add Container"
2. Repository: `torsteinpaulsen/garasje-avlesning:latest`
3. Port: `3000:3001`

### 2. Volumes (4 stk)
```
/app/data → /mnt/user/appdata/garasje-avlesning/data
/app/uploads → /mnt/user/appdata/garasje-avlesning/uploads  
/app/logs → /mnt/user/appdata/garasje-avlesning/logs
/app/config → /mnt/user/appdata/garasje-avlesning/config
```

### 3. Environment Variables
```
NODE_ENV=production
PORT=3001
TZ=Europe/Oslo
DATABASE_PATH=/app/data/readings.db
UPLOAD_DIR=/app/uploads
LOG_DIR=/app/logs
LOG_LEVEL=info
```

### 4. Extra Parameters
```
--restart=unless-stopped
```

### 5. Apply og Test
- Klikk Apply
- Gå til http://UNRAID-IP:3000
- Ferdig! 🎉

Se [UNRAID-SETUP.md](UNRAID-SETUP.md) for detaljert guide.
EOF

# Git operations
echo "📤 Committing to public repository..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    git commit -m "docs: sync templates and documentation from private repo

- Updated Unraid templates
- Refreshed documentation  
- Version: $(date +'%Y-%m-%d %H:%M')"
    
    echo "🚀 Pushing to public repository..."
    git push origin main
fi

echo "✅ Sync complete!"
echo "🔗 Public templates available at: $PUBLIC_REPO_URL"
EOF
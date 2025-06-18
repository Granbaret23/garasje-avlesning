# Garasje Avlesning - Docker Image

Docker-basert webapplikasjon for registrering og sporing av målerverdier (minusmålere) i garasje, med automatisk synkronisering til Google Sheets.

## Quick Start

```bash
docker run -d \
  --name garasje-avlesning \
  -p 3000:3001 \
  -v /path/to/data:/app/data \
  -v /path/to/uploads:/app/uploads \
  -v /path/to/logs:/app/logs \
  -v /path/to/config:/app/config \
  granbaret/garasje-avlesning:latest
```

## Unraid Installation

1. Go to Docker tab in Unraid WebUI
2. Click "Add Container"
3. Repository: `granbaret/garasje-avlesning:latest`
4. Configure port and volume mappings
5. Apply and start

## Environment Variables

See [GitHub Repository](https://github.com/Granbaret23/garasje-avlesning) for full documentation.

## Status

- ✅ Docker image builds and runs
- ⚠️ Unit tests temporarily disabled (work in progress)
- ✅ Application fully functional

## Support

- GitHub: https://github.com/Granbaret23/garasje-avlesning
- Issues: https://github.com/Granbaret23/garasje-avlesning/issues
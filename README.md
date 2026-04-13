# Restroom Hygiene Monitor

Fast full-stack IoT dashboard ready for GitHub publication.

- Frontend: `restroom-final/frontend`
- Backend: `restroom-final/backend`
- Python analysis: `restroom-final/python`
- n8n workflow: `restroom-final/n8n/workflow.json`

## Quick start

```bash
cd restroom-final/frontend
npm install
npm start
```

## Build

```bash
cd restroom-final/frontend
npm run build
```

## Deploy

- Netlify config: `restroom-final/netlify.toml`
- GitHub Pages workflow: `.github/workflows/deploy-gh-pages.yml`
- Build output: `restroom-final/frontend/build`

## Notes

- Supabase tables: `toilet_readings`, `staff_locations`
- Admin login configured in `restroom-final/frontend/src/config.js`
- Use `README.me` for the ultra concise summary.

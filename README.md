# Currency Converter

A simple, fast currency converter for 5 major currencies: USD, EUR, JPY, GBP, CNY. Live conversion as you type, with a built-in table showing all conversions at once.

## Features

- Live conversion as you type (no submit button)
- Swap button to flip source and target currencies
- Shows conversion table for all 5 currencies
- Displays the exchange rate used and last updated timestamp
- Graceful error handling with cached rates fallback
- Clean, modern UI with dark mode support
- Fully responsive and mobile-friendly
- Accessible keyboard navigation

## Local Setup

### Prerequisites
- Node.js (v14+)

### Install and Run

```bash
# Install dependencies
npm install

# Start the server (listens on http://localhost:3000)
npm start
```

Visit `http://localhost:3000` in your browser.

## API

### GET /api/rates
Returns the cached exchange rates and metadata.

**Response:**
```json
{
  "rates": {
    "EUR": 1,
    "USD": 1.08,
    "JPY": 160.5,
    "GBP": 0.86,
    "CNY": 7.75
  },
  "timestamp": 1699500000000,
  "error": null
}
```

### GET /health
Health check endpoint for deployment platforms. Returns `200 OK`.

## Exchange Rate Source

Rates are fetched server-side from the free [Frankfurter API](https://api.frankfurter.dev) and cached in memory for 1 hour. If the API fails, cached rates are used with a warning banner displayed to the user.

## Deployment on Railway

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: currency converter"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to main
git branch -M main
git push -u origin main
```

### Step 2: Connect to Railway

1. Go to [railway.app](https://railway.app) and log in
2. Click **+ New Project**
3. Select **Deploy from GitHub repo**
4. Authorize and select your repository
5. Railway will automatically detect the Node.js app and deploy it

### Step 3: Generate a Public Domain

1. Go to your Railway project dashboard
2. Click on the **Deployments** tab
3. Under **Settings > Networking**, click **+ Generate Domain**
4. Your app is now live at the generated URL

The app will redeploy automatically whenever you push to the `main` branch.

## Environment Variables

No environment variables are required. The app will automatically:
- Use `PORT` from the environment (default: 3000)
- Bind to `0.0.0.0` for Railway deployment
- Fetch rates from Frankfurter API on startup and cache them

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Rates API:** Frankfurter (free, no API key required)

## Building

Before pushing to GitHub/Railway, ensure the app builds and runs:

```bash
npm run build  # If you added a build step later
npm start      # Test locally first
```

## License

MIT

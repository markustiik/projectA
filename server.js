const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Currencies: code, flag, name
const CURRENCIES = {
  USD: { flag: '🇺🇸', name: 'US Dollar' },
  EUR: { flag: '🇪🇺', name: 'Euro' },
  JPY: { flag: '🇯🇵', name: 'Japanese Yen' },
  GBP: { flag: '🇬🇧', name: 'British Pound' },
  CNY: { flag: '🇨🇳', name: 'Chinese Yuan' }
};

// Cache state
let ratesCache = null;
let lastFetchTime = null;
let fetchError = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fetch rates from Frankfurter API
function fetchRates() {
  return new Promise((resolve) => {
    const url = 'https://api.frankfurter.dev/latest?from=EUR&to=USD,JPY,GBP,CNY';
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Convert to our format: { code: rate, ... }
          const rates = { EUR: 1 }; // EUR is always the base
          Object.entries(json.rates).forEach(([code, rate]) => {
            rates[code] = rate;
          });
          ratesCache = rates;
          lastFetchTime = Date.now();
          fetchError = null;
          console.log('Rates cached successfully:', rates);
          resolve(rates);
        } catch (err) {
          console.error('Parse error:', err.message);
          fetchError = 'Failed to parse rates';
          resolve(ratesCache || {});
        }
      });
    }).on('error', (err) => {
      console.error('Fetch error:', err.message);
      fetchError = 'Failed to fetch rates from API';
      resolve(ratesCache || {});
    });
  });
}

// Refresh rates if cache expired
async function ensureRatesValid() {
  if (!ratesCache || Date.now() - lastFetchTime > CACHE_DURATION) {
    await fetchRates();
  }
}

// Initialize rates on startup
(async () => {
  await ensureRatesValid();
})();

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API endpoint: return cached rates
app.get('/api/rates', async (req, res) => {
  await ensureRatesValid();
  res.json({
    rates: ratesCache || {},
    timestamp: lastFetchTime,
    error: fetchError
  });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all: serve index.html for SPA-like behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Currency converter running on http://0.0.0.0:${PORT}`);
});

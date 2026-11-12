const express = require('express');
const https = require('https');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

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
async function fetchRates() {
  const url = 'https://api.frankfurter.app/latest?from=EUR&to=USD,JPY,GBP,CNY';
  console.log(`Fetching rates from ${url}...`);

  try {
    const response = await fetch(url, { timeout: 10000 });
    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`API returned status ${response.status}`);
      fetchError = `API error: ${response.status}`;
      return ratesCache || {};
    }

    const json = await response.json();
    if (!json.rates) {
      throw new Error('No rates in response');
    }

    // Convert to our format: { code: rate, ... }
    const rates = { EUR: 1 }; // EUR is always the base
    Object.entries(json.rates).forEach(([code, rate]) => {
      rates[code] = rate;
    });
    ratesCache = rates;
    lastFetchTime = Date.now();
    fetchError = null;
    console.log('✓ Rates fetched successfully:', rates);
    return rates;
  } catch (err) {
    console.error('✗ Error fetching rates:', err.message);
    fetchError = `Error: ${err.message}`;
    return ratesCache || {};
  }
}

// Refresh rates if cache expired
async function ensureRatesValid() {
  if (!ratesCache || !lastFetchTime || Date.now() - lastFetchTime > CACHE_DURATION) {
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

// API endpoint: save conversion to database
app.post('/api/conversions', express.json(), async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency, result, exchangeRate } = req.body;

    const conversion = await prisma.conversion.create({
      data: {
        amount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        result: parseFloat(result),
        exchangeRate: parseFloat(exchangeRate)
      }
    });

    res.json({ success: true, id: conversion.id });
  } catch (err) {
    console.error('Error saving conversion:', err.message);
    res.status(500).json({ error: 'Failed to save conversion' });
  }
});

// API endpoint: get conversion history
app.get('/api/conversions', async (req, res) => {
  try {
    const conversions = await prisma.conversion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(conversions);
  } catch (err) {
    console.error('Error fetching conversions:', err.message);
    res.status(500).json({ error: 'Failed to fetch conversions' });
  }
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

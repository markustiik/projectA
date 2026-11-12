const CURRENCIES = {
  USD: { flag: '🇺🇸', name: 'US Dollar' },
  EUR: { flag: '🇪🇺', name: 'Euro' },
  JPY: { flag: '🇯🇵', name: 'Japanese Yen' },
  GBP: { flag: '🇬🇧', name: 'British Pound' },
  CNY: { flag: '🇨🇳', name: 'Chinese Yuan' }
};

const CURRENCY_DECIMALS = {
  USD: 2,
  EUR: 2,
  JPY: 0,
  GBP: 2,
  CNY: 2
};

// State
let rates = null;
let lastUpdated = null;
let hasError = false;

const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const resultAmount = document.getElementById('resultAmount');
const resultCurrency = document.getElementById('resultCurrency');
const rateInfo = document.getElementById('rateInfo');
const timestamp = document.getElementById('timestamp');
const errorBanner = document.getElementById('errorBanner');
const errorText = document.getElementById('errorText');
const conversionTable = document.getElementById('tableBody');

// Populate currency dropdowns
function populateCurrencies() {
  Object.entries(CURRENCIES).forEach(([code, { flag, name }]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${flag} ${code} - ${name}`;
    fromSelect.appendChild(option);

    const optionTo = option.cloneNode(true);
    toSelect.appendChild(optionTo);
  });

  // Default: EUR to USD
  fromSelect.value = 'EUR';
  toSelect.value = 'USD';
}

// Format number with proper decimal places
function formatNumber(value, currencyCode) {
  const decimals = CURRENCY_DECIMALS[currencyCode] || 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Fetch rates from backend
async function fetchRates() {
  try {
    const response = await fetch('/api/rates');
    const data = await response.json();

    if (data.rates && Object.keys(data.rates).length > 0) {
      rates = data.rates;
      lastUpdated = data.timestamp ? new Date(data.timestamp) : new Date();

      if (data.error) {
        showError(`Using cached rates: ${data.error}`);
      } else {
        hideError();
      }
    } else {
      showError('Unable to load exchange rates');
    }
  } catch (err) {
    showError('Failed to fetch rates: ' + err.message);
  }

  // Always attempt conversion even if rates failed
  convert();
}

// Show error banner
function showError(message) {
  hasError = true;
  errorText.textContent = message;
  errorBanner.classList.remove('hidden');
}

// Hide error banner
function hideError() {
  hasError = false;
  errorBanner.classList.add('hidden');
}

// Convert amount
function convert() {
  if (!rates) return;

  const amount = parseFloat(amountInput.value) || 0;
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;

  // Get conversion rate: amount in fromCurrency to toCurrency
  // rates are all relative to EUR
  const fromToEur = rates[fromCurrency];
  const toToEur = rates[toCurrency];

  if (!fromToEur || !toToEur) {
    resultAmount.textContent = '—';
    rateInfo.textContent = 'Rate unavailable';
    return;
  }

  // Convert: amount in fromCurrency -> EUR -> toCurrency
  const amountInEur = amount / fromToEur;
  const converted = amountInEur * toToEur;

  // Display result
  resultAmount.textContent = formatNumber(converted, toCurrency);
  resultCurrency.textContent = toCurrency;

  // Display exchange rate
  const rateValue = toToEur / fromToEur;
  const rateText = `1 ${fromCurrency} = ${formatNumber(rateValue, toCurrency)} ${toCurrency}`;
  rateInfo.textContent = rateText;

  // Display timestamp
  if (lastUpdated) {
    const timeString = lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    timestamp.textContent = `Updated ${timeString}`;
  }

  // Update conversion table
  updateConversionTable(amount, fromCurrency);
}

// Update the conversion table showing all 5 currencies
function updateConversionTable(amount, fromCurrency) {
  if (!rates) return;

  conversionTable.innerHTML = '';

  const fromToEur = rates[fromCurrency];
  if (!fromToEur) return;

  const amountInEur = amount / fromToEur;

  Object.entries(CURRENCIES).forEach(([code, { flag, name }]) => {
    const rate = rates[code];
    if (!rate) return;

    const converted = amountInEur * rate;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span>${flag}</span> <strong>${code}</strong> — ${name}</td>
      <td style="text-align: right;">${formatNumber(converted, code)}</td>
    `;
    conversionTable.appendChild(row);
  });
}

// Swap currencies
function swap() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convert();
}

// Event listeners
amountInput.addEventListener('input', convert);
fromSelect.addEventListener('change', convert);
toSelect.addEventListener('change', convert);
swapBtn.addEventListener('click', swap);

// Initialize
populateCurrencies();
fetchRates();

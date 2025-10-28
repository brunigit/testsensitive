#!/usr/bin/env node

/**
 * Generatore di dati di test per Excel
 *
 * Genera un file Excel con dati fake per testare
 * il sistema di anonimizzazione.
 *
 * Uso: node generate-test-data.js [numero-righe] [output-file]
 */

const path = require('path');

// Colori per output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Dati fake per generazione
const firstNames = [
  'Mario', 'Luigi', 'Giuseppe', 'Francesco', 'Antonio',
  'Laura', 'Anna', 'Maria', 'Giulia', 'Francesca',
  'Giovanni', 'Marco', 'Alessandro', 'Luca', 'Andrea',
  'Sara', 'Chiara', 'Elena', 'Valentina', 'Martina'
];

const lastNames = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi',
  'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
  'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa',
  'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti'
];

const cities = [
  'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo',
  'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania',
  'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste'
];

const domains = [
  'example.com', 'test.it', 'mail.com', 'email.it',
  'company.com', 'business.it', 'corp.com', 'org.it'
];

const socialPlatforms = [
  '', 'Instagram:', 'Twitter:', 'TikTok:', 'LinkedIn:', 'Facebook:'
];

const streets = [
  'Via Roma', 'Via Milano', 'Corso Italia', 'Piazza Garibaldi',
  'Via Nazionale', 'Corso Vittorio Emanuele', 'Via Giuseppe Verdi',
  'Piazza del Duomo', 'Via Dante', 'Corso Buenos Aires'
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName() {
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
}

function generateEmail(name) {
  const cleanName = name.toLowerCase()
    .replace(/\s+/g, '.')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `${cleanName}@${randomItem(domains)}`;
}

function generatePhone() {
  const formats = [
    `+39 ${randomInt(300, 399)} ${randomInt(1000000, 9999999)}`,
    `+39 0${randomInt(1, 9)} ${randomInt(10000000, 99999999)}`,
    `0${randomInt(1, 9)}-${randomInt(10000000, 99999999)}`
  ];
  return randomItem(formats);
}

function generateSocial(name) {
  const username = name.toLowerCase()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 15);

  const platform = randomItem(socialPlatforms);
  return platform ? `${platform} @${username}${randomInt(1, 999)}` : `@${username}`;
}

function generateAddress() {
  const street = randomItem(streets);
  const number = randomInt(1, 200);
  const city = randomItem(cities);
  return `${street} ${number}, ${city}`;
}

function generateNotes() {
  const notes = [
    'Cliente VIP',
    'Follow up richiesto',
    'Contattare per rinnovo',
    'Nuovo cliente',
    'Reclamo in corso',
    'Pagamento in sospeso',
    'Contratto scaduto',
    'Meeting programmato',
    'Da richiamare',
    ''
  ];
  return randomItem(notes);
}

function generateCreditCard() {
  // Genera numero carta fake (non valido)
  const part1 = randomInt(1000, 9999);
  const part2 = randomInt(1000, 9999);
  const part3 = randomInt(1000, 9999);
  const part4 = randomInt(1000, 9999);
  return `${part1}-${part2}-${part3}-${part4}`;
}

function generateData(numRows) {
  const data = [];

  for (let i = 0; i < numRows; i++) {
    const name = generateName();
    const row = {
      Nome: name,
      Email: generateEmail(name),
      Telefono: generatePhone(),
      Social: generateSocial(name),
      Indirizzo: generateAddress(),
      Città: randomItem(cities),
      Note: generateNotes()
    };

    // Aggiungi dati finanziari casualmente
    if (Math.random() > 0.7) {
      row['Carta'] = generateCreditCard();
    }

    data.push(row);
  }

  return data;
}

function dataToCSV(data) {
  if (data.length === 0) return '';

  // Headers
  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';

  // Rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  }

  return csv;
}

async function main() {
  const args = process.argv.slice(2);
  const numRows = parseInt(args[0]) || 100;
  const outputFile = args[1] || 'sample-data.csv';

  log('\n📊 Generatore Dati di Test\n', 'bright');
  log(`Generazione di ${numRows} righe...`, 'cyan');

  const data = generateData(numRows);

  log('✅ Dati generati!', 'green');
  log('\n📋 Anteprima (prime 5 righe):\n', 'bright');

  // Mostra anteprima
  for (let i = 0; i < Math.min(5, data.length); i++) {
    log(`Riga ${i + 1}:`, 'cyan');
    for (const [key, value] of Object.entries(data[i])) {
      log(`  ${key}: ${value}`, 'reset');
    }
    log('', 'reset');
  }

  // Salva come CSV
  const fs = require('fs');
  const csv = dataToCSV(data);
  const outputPath = path.join(__dirname, '..', 'examples', outputFile);

  fs.writeFileSync(outputPath, csv, 'utf8');

  log(`✅ File salvato: ${outputPath}`, 'green');
  log(`\n💡 Per convertire in Excel:`, 'cyan');
  log(`   1. Apri il file CSV con Excel/LibreOffice`, 'yellow');
  log(`   2. Salva come .xlsx`, 'yellow');
  log(`   3. Oppure usa: node convert-csv-to-xlsx.js`, 'yellow');

  log(`\n📊 Statistiche:`, 'bright');
  log(`   ✓ Righe generate: ${data.length}`, 'green');
  log(`   ✓ Colonne: ${Object.keys(data[0]).length}`, 'green');
  log(`   ✓ File size: ${(csv.length / 1024).toFixed(2)} KB`, 'green');

  log('\n🚀 Pronto per il test!', 'bright');
}

if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Errore: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { generateData, dataToCSV };

#!/usr/bin/env node

/**
 * Script di test per il webhook n8n
 *
 * Questo script invia un file Excel al webhook n8n
 * per testare il flusso completo di anonimizzazione.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configurazione
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/upload-excel';
const TEST_EMAIL = process.env.TEST_EMAIL || 'your-email@gmail.com';
const EXCEL_FILE = path.join(__dirname, '..', 'examples', 'sample-data.xlsx');

// Colori per output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testWebhook() {
  log('\n🚀 Test n8n Webhook - Excel Anonymizer\n', 'bright');

  try {
    // Verifica configurazione
    log('📋 Configurazione:', 'cyan');
    log(`   Webhook URL: ${WEBHOOK_URL}`, 'reset');
    log(`   Email destinazione: ${TEST_EMAIL}`, 'reset');
    log(`   File Excel: ${EXCEL_FILE}`, 'reset');

    if (TEST_EMAIL === 'your-email@gmail.com') {
      log('\n❌ ERRORE: Configura l\'email!', 'red');
      log('   Esporta la variabile: export TEST_EMAIL=your-actual-email@gmail.com', 'yellow');
      process.exit(1);
    }

    // Verifica che il file Excel esista
    if (!fs.existsSync(EXCEL_FILE)) {
      log('\n❌ ERRORE: File Excel non trovato!', 'red');
      log(`   Crea un file Excel in: ${EXCEL_FILE}`, 'yellow');
      log('   Oppure crea manualmente un file .xlsx con dati di test', 'yellow');
      process.exit(1);
    }

    log('\n📤 Preparazione upload...', 'cyan');

    // Crea form data
    const form = new FormData();
    form.append('file', fs.createReadStream(EXCEL_FILE));
    form.append('email', TEST_EMAIL);

    log('✅ Form data pronto', 'green');

    // Invia richiesta
    log('\n🌐 Invio richiesta al webhook n8n...', 'cyan');

    const response = await axios.post(WEBHOOK_URL, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 60000 // 60 secondi
    });

    log('✅ Richiesta inviata con successo!', 'green');

    // Mostra risposta
    log('\n📩 RISPOSTA DAL SERVER:\n', 'bright');
    log(JSON.stringify(response.data, null, 2), 'yellow');

    if (response.data.success) {
      log('\n✅ File elaborato con successo!', 'green');
      log(`   ✓ Righe elaborate: ${response.data.rowsProcessed}`, 'green');
      log(`   ✓ Email inviata a: ${response.data.emailSentTo}`, 'green');
      log('\n📧 Controlla la tua email per il file anonimizzato!', 'cyan');
    } else {
      log('\n⚠️  Elaborazione fallita', 'yellow');
      log(`   Messaggio: ${response.data.message}`, 'yellow');
    }

    log('\n💡 Suggerimenti:', 'cyan');
    log('   1. Controlla le executions in n8n per vedere i dettagli', 'cyan');
    log('   2. Verifica che il workflow sia "Active"', 'cyan');
    log('   3. Controlla la cartella Spam se non ricevi l\'email', 'cyan');

  } catch (error) {
    log('\n❌ ERRORE durante il test:', 'red');

    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Messaggio: ${JSON.stringify(error.response.data)}`, 'red');
    } else if (error.code === 'ECONNREFUSED') {
      log('   Impossibile connettersi al webhook', 'red');
      log('\n💡 Suggerimenti:', 'yellow');
      log('   1. Verifica che n8n sia in esecuzione', 'yellow');
      log('   2. Controlla che l\'URL del webhook sia corretto', 'yellow');
      log('   3. Verifica che il workflow sia attivato', 'yellow');
    } else {
      log(`   ${error.message}`, 'red');
    }

    process.exit(1);
  }
}

// Esegui il test
if (require.main === module) {
  testWebhook().catch(console.error);
}

module.exports = { testWebhook };

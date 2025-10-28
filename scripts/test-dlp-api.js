#!/usr/bin/env node

/**
 * Script di test per Google Sensitive Data Protection API
 *
 * Questo script testa l'anonimizzazione di dati tabulari
 * simulando il flusso del workflow n8n.
 */

const { DlpServiceClient } = require('@google-cloud/dlp');
const path = require('path');

// Configurazione
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
const KEY_FILE = path.join(__dirname, '..', 'config', 'service-account-key.json');

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

// Dati di test (simula un file Excel)
const testData = {
  headers: [
    { name: 'Nome' },
    { name: 'Email' },
    { name: 'Telefono' },
    { name: 'Social' },
    { name: 'Note' }
  ],
  rows: [
    {
      values: [
        { stringValue: 'Mario Rossi' },
        { stringValue: 'mario.rossi@example.com' },
        { stringValue: '+39 333 1234567' },
        { stringValue: '@mariorossi' },
        { stringValue: 'Cliente VIP' }
      ]
    },
    {
      values: [
        { stringValue: 'Laura Bianchi' },
        { stringValue: 'laura.bianchi@test.it' },
        { stringValue: '+39 348 9876543' },
        { stringValue: '@laurab Instagram: @laurabianchi' },
        { stringValue: 'Follow up richiesto' }
      ]
    },
    {
      values: [
        { stringValue: 'Giovanni Verdi' },
        { stringValue: 'g.verdi@mail.com' },
        { stringValue: '+39 02 12345678' },
        { stringValue: 'Twitter: @gioverdi' },
        { stringValue: 'Indirizzo: Via Roma 123, Milano' }
      ]
    },
    {
      values: [
        { stringValue: 'Anna Neri' },
        { stringValue: 'anna.neri@company.com' },
        { stringValue: '02-87654321' },
        { stringValue: '@annaneri TikTok: @anna_neri' },
        { stringValue: 'Carta: 4532-1234-5678-9010' }
      ]
    }
  ]
};

async function testDlpApi() {
  log('\n🚀 Test Google Sensitive Data Protection API\n', 'bright');

  try {
    // Verifica configurazione
    log('📋 Verifica configurazione...', 'cyan');
    log(`   Project ID: ${PROJECT_ID}`, 'reset');
    log(`   Key File: ${KEY_FILE}`, 'reset');

    if (PROJECT_ID === 'your-project-id') {
      log('\n❌ ERRORE: Configura il PROJECT_ID!', 'red');
      log('   Esporta la variabile: export GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id', 'yellow');
      process.exit(1);
    }

    // Inizializza client DLP
    log('\n🔌 Connessione a Google DLP API...', 'cyan');
    const dlp = new DlpServiceClient({
      keyFilename: KEY_FILE,
      projectId: PROJECT_ID
    });

    log('✅ Client DLP inizializzato con successo', 'green');

    // Prepara la richiesta
    log('\n📊 Preparazione dati di test...', 'cyan');
    log(`   Righe: ${testData.rows.length}`, 'reset');
    log(`   Colonne: ${testData.headers.length}`, 'reset');

    const request = {
      parent: `projects/${PROJECT_ID}/locations/global`,
      item: {
        table: testData
      },
      deidentifyConfig: {
        recordTransformations: {
          fieldTransformations: [
            {
              fields: testData.headers,
              infoTypeTransformations: {
                transformations: [
                  {
                    primitiveTransformation: {
                      characterMaskConfig: {
                        maskingCharacter: '*',
                        numberToMask: 0,
                        reverseOrder: false
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      inspectConfig: {
        infoTypes: [
          { name: 'EMAIL_ADDRESS' },
          { name: 'PHONE_NUMBER' },
          { name: 'PERSON_NAME' },
          { name: 'STREET_ADDRESS' },
          { name: 'IP_ADDRESS' },
          { name: 'CREDIT_CARD_NUMBER' },
          { name: 'DATE_OF_BIRTH' },
          { name: 'LOCATION' },
          { name: 'URL' }
        ],
        customInfoTypes: [
          {
            infoType: { name: 'SOCIAL_MEDIA_USERNAME' },
            regex: { pattern: '@[A-Za-z0-9_]{1,30}' },
            likelihood: 'LIKELY'
          },
          {
            infoType: { name: 'TWITTER_HANDLE' },
            regex: { pattern: '(?:^|[^@\\w])@([A-Za-z0-9_]{1,15})\\b' },
            likelihood: 'LIKELY'
          },
          {
            infoType: { name: 'INSTAGRAM_HANDLE' },
            regex: { pattern: '(?:@|(?:instagram\\.com/))([A-Za-z0-9_.]{1,30})' },
            likelihood: 'LIKELY'
          },
          {
            infoType: { name: 'TIKTOK_HANDLE' },
            regex: { pattern: '(?:@|(?:tiktok\\.com/@))([A-Za-z0-9_.]{1,24})' },
            likelihood: 'LIKELY'
          }
        ],
        minLikelihood: 'POSSIBLE',
        includeQuote: true
      }
    };

    log('\n🔍 Invio richiesta di de-identificazione...', 'cyan');
    log('   Tipi di dati rilevati: EMAIL, PHONE, PERSON_NAME, STREET_ADDRESS, SOCIAL_MEDIA', 'reset');

    const [response] = await dlp.deidentifyContent(request);

    log('✅ De-identificazione completata!', 'green');

    // Mostra risultati
    log('\n📋 RISULTATI:\n', 'bright');

    // Header della tabella
    log('╔═══════════════════════════════════════════════════════════════════════════════╗', 'blue');
    log('║                           DATI ORIGINALI                                      ║', 'blue');
    log('╚═══════════════════════════════════════════════════════════════════════════════╝', 'blue');

    // Mostra dati originali
    const originalHeaders = testData.headers.map(h => h.name).join(' | ');
    log(`\n${originalHeaders}`, 'cyan');
    log('-'.repeat(80), 'reset');

    testData.rows.forEach((row, idx) => {
      const values = row.values.map(v => v.stringValue).join(' | ');
      log(values, 'reset');
    });

    // Dati anonimizzati
    log('\n╔═══════════════════════════════════════════════════════════════════════════════╗', 'green');
    log('║                        DATI ANONIMIZZATI                                      ║', 'green');
    log('╚═══════════════════════════════════════════════════════════════════════════════╝', 'green');

    const anonymizedHeaders = response.item.table.headers.map(h => h.name).join(' | ');
    log(`\n${anonymizedHeaders}`, 'cyan');
    log('-'.repeat(80), 'reset');

    response.item.table.rows.forEach((row, idx) => {
      const values = row.values.map(v => v.stringValue).join(' | ');
      log(values, 'yellow');
    });

    // Statistiche
    log('\n📊 STATISTICHE:', 'bright');
    log(`   ✓ Righe elaborate: ${response.item.table.rows.length}`, 'green');
    log(`   ✓ Colonne elaborate: ${response.item.table.headers.length}`, 'green');

    // Calcola quanti campi sono stati modificati
    let modifiedFields = 0;
    let totalFields = 0;

    for (let i = 0; i < testData.rows.length; i++) {
      for (let j = 0; j < testData.rows[i].values.length; j++) {
        totalFields++;
        const original = testData.rows[i].values[j].stringValue;
        const anonymized = response.item.table.rows[i].values[j].stringValue;
        if (original !== anonymized) {
          modifiedFields++;
        }
      }
    }

    log(`   ✓ Campi modificati: ${modifiedFields}/${totalFields}`, 'green');
    log(`   ✓ Percentuale anonimizzazione: ${((modifiedFields/totalFields)*100).toFixed(1)}%`, 'green');

    // Dettaglio trasformazioni
    log('\n🔍 DETTAGLIO TRASFORMAZIONI:', 'bright');

    for (let i = 0; i < testData.rows.length; i++) {
      log(`\n   Riga ${i + 1}:`, 'cyan');
      for (let j = 0; j < testData.rows[i].values.length; j++) {
        const original = testData.rows[i].values[j].stringValue;
        const anonymized = response.item.table.rows[i].values[j].stringValue;
        const header = testData.headers[j].name;

        if (original !== anonymized) {
          log(`      ${header}: "${original}" → "${anonymized}"`, 'yellow');
        } else {
          log(`      ${header}: "${original}" (non modificato)`, 'reset');
        }
      }
    }

    log('\n✅ Test completato con successo!\n', 'green');
    log('💡 Ora puoi importare il workflow in n8n e testare il flusso completo.', 'cyan');

  } catch (error) {
    log('\n❌ ERRORE durante il test:', 'red');
    log(`   ${error.message}`, 'red');

    if (error.code === 7) {
      log('\n💡 Suggerimenti:', 'yellow');
      log('   1. Verifica che il Service Account abbia il ruolo "roles/dlp.user"', 'yellow');
      log('   2. Controlla che l\'API DLP sia abilitata nel progetto', 'yellow');
      log('   3. Verifica che il file service-account-key.json sia valido', 'yellow');
    }

    if (error.code === 16) {
      log('\n💡 Suggerimenti:', 'yellow');
      log('   1. Verifica che il file config/service-account-key.json esista', 'yellow');
      log('   2. Controlla che le credenziali siano valide', 'yellow');
    }

    process.exit(1);
  }
}

// Esegui il test
if (require.main === module) {
  testDlpApi().catch(console.error);
}

module.exports = { testDlpApi };

# 🛠️ Scripts

Questa cartella contiene script utility per testare e sviluppare il sistema di anonimizzazione.

## 📋 Script Disponibili

### 1. test-dlp-api.js
**Test dell'API Google DLP**

Testa direttamente l'API Google Sensitive Data Protection con dati di esempio.

**Prerequisiti:**
```bash
npm install
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

**Uso:**
```bash
node test-dlp-api.js
```

**Output:**
- Mostra dati originali e anonimizzati
- Statistiche sull'anonimizzazione
- Dettaglio delle trasformazioni

---

### 2. test-webhook.js
**Test del webhook n8n**

Invia un file Excel al webhook n8n per testare il flusso completo.

**Prerequisiti:**
```bash
npm install
export TEST_EMAIL=your-email@gmail.com
```

**Uso:**
```bash
# Test con file di default
node test-webhook.js

# Test con file personalizzato
N8N_WEBHOOK_URL=http://your-n8n.com/webhook/upload-excel node test-webhook.js
```

---

### 3. generate-test-data.js
**Generatore di dati fake**

Genera file CSV con dati fake per testare l'anonimizzazione.

**Uso:**
```bash
# Genera 100 righe (default)
node generate-test-data.js

# Genera 1000 righe
node generate-test-data.js 1000

# Genera con nome file personalizzato
node generate-test-data.js 500 my-test-data.csv
```

**Output:**
- File CSV in `examples/`
- Contiene nomi, email, telefoni, social media, indirizzi
- Alcuni record contengono numeri carta di credito

---

## 🚀 Quick Start

### Setup iniziale
```bash
cd scripts
npm install
```

### Test completo
```bash
# 1. Genera dati di test
node generate-test-data.js 100

# 2. Converti in Excel (manualmente o con tool)
# Apri sample-data.csv con Excel e salva come .xlsx

# 3. Testa l'API DLP
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
node test-dlp-api.js

# 4. Testa il webhook n8n
export TEST_EMAIL=your-email@gmail.com
node test-webhook.js
```

---

## 📦 Dipendenze

### Produzione
- `@google-cloud/dlp` - Client Google DLP API
- `axios` - HTTP client per webhook
- `form-data` - Upload multipart/form-data

### Development (opzionali)
- `xlsx` - Lettura/scrittura Excel
- `faker` - Generazione dati fake avanzati

**Installazione:**
```bash
npm install

# Opzionali per funzionalità avanzate
npm install --save-dev xlsx faker
```

---

## 🔧 Configurazione

### Variabili d'ambiente

Crea un file `.env` nella cartella root:
```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account-key.json

# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/upload-excel

# Test
TEST_EMAIL=your-email@gmail.com
```

---

## 📊 Esempi di Uso

### Test rapido API DLP
```bash
node test-dlp-api.js
```

Output:
```
🚀 Test Google Sensitive Data Protection API

📋 Verifica configurazione...
   Project ID: my-project-123
   Key File: /path/to/service-account-key.json

🔌 Connessione a Google DLP API...
✅ Client DLP inizializzato con successo

📊 Preparazione dati di test...
   Righe: 4
   Colonne: 5

🔍 Invio richiesta di de-identificazione...
✅ De-identificazione completata!

📋 RISULTATI:

╔═══════════════════════════════════════════════════════════════╗
║                      DATI ORIGINALI                           ║
╚═══════════════════════════════════════════════════════════════╝

Nome | Email | Telefono | Social | Note
------------------------------------------------------------
Mario Rossi | mario.rossi@example.com | +39 333 1234567 | @mariorossi | Cliente VIP

╔═══════════════════════════════════════════════════════════════╗
║                   DATI ANONIMIZZATI                           ║
╚═══════════════════════════════════════════════════════════════╝

Nome | Email | Telefono | Social | Note
------------------------------------------------------------
M**** R**** | m****.*****@*******.com | +** *** ******* | @m******** | Cliente VIP

📊 STATISTICHE:
   ✓ Righe elaborate: 4
   ✓ Colonne elaborate: 5
   ✓ Campi modificati: 16/20
   ✓ Percentuale anonimizzazione: 80.0%
```

### Test webhook con file personalizzato
```bash
export TEST_EMAIL=myemail@gmail.com
node test-webhook.js
```

### Genera dataset grande
```bash
# Genera 10,000 righe per stress test
node generate-test-data.js 10000 large-dataset.csv
```

---

## 🐛 Troubleshooting

### Errore: "Cannot find module '@google-cloud/dlp'"
```bash
npm install @google-cloud/dlp
```

### Errore: "PROJECT_ID not configured"
```bash
export GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
```

### Errore: "ECONNREFUSED"
Verifica che n8n sia in esecuzione:
```bash
# Verifica se n8n è attivo
ps aux | grep n8n

# Avvia n8n se necessario
n8n start
```

### Errore: "Permission denied"
Verifica i permessi del Service Account:
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:dlp-anonymizer"
```

---

## 🧪 Test Avanzati

### Benchmark performance
```bash
# Testa con diversi volumi di dati
for size in 100 500 1000 5000; do
  echo "Testing with $size rows..."
  node generate-test-data.js $size test-$size.csv
  time node test-dlp-api.js
done
```

### Test concorrenza
```bash
# Esegui 10 richieste in parallelo
for i in {1..10}; do
  node test-webhook.js &
done
wait
echo "All tests completed"
```

### Validazione output
```bash
# Script per verificare che non ci siano dati sensibili residui
node -e "
const fs = require('fs');
const csv = fs.readFileSync('anonymized-output.csv', 'utf8');
const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const matches = csv.match(emailRegex);
console.log('Emails found:', matches ? matches.length : 0);
"
```

---

## 📚 Risorse

- [Google DLP API Docs](https://cloud.google.com/dlp/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🤝 Contributi

Vuoi aggiungere nuovi script? Apri una PR!

**Idee per nuovi script:**
- [ ] Script per comparare file originale vs anonimizzato
- [ ] Script per validare compliance GDPR
- [ ] Script per analizzare costi API
- [ ] Script per generare report di anonimizzazione
- [ ] Script per batch processing di multipli file

---

**Creato con ❤️ per testare l'anonimizzazione dati**

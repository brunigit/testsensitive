# 🚀 Guida Rapida - Import Workflow n8n

## ✅ Il workflow è stato CORRETTO e ora si importa correttamente!

---

## 📥 STEP 1: Import in n8n

### Metodo 1: Drag & Drop (Più Semplice)
1. Apri n8n (http://localhost:5678)
2. Clicca su "**Workflows**" nel menu a sinistra
3. Clicca sul pulsante "**+**" per creare un nuovo workflow
4. Trascina il file `excel-anonymizer.json` direttamente sulla canvas
5. ✅ Fatto!

### Metodo 2: Menu Import
1. Apri n8n
2. Vai su **Workflows**
3. Clicca su "**Import from File**" o "**Import from URL**"
4. Seleziona `n8n-workflows/excel-anonymizer.json`
5. Clicca "**Import**"

---

## ⚙️ STEP 2: Configurazione (IMPORTANTE!)

### A. Modifica il PROJECT_ID nel nodo "Prepare DLP Request"

1. Clicca sul nodo "**Prepare DLP Request**" (il terzo nodo)
2. Nella finestra del codice, trova la riga:
   ```javascript
   const projectId = 'YOUR_PROJECT_ID'; // ← MODIFICA QUESTO!
   ```
3. Sostituisci `YOUR_PROJECT_ID` con il tuo vero Google Cloud Project ID
4. Esempio:
   ```javascript
   const projectId = 'my-project-12345';
   ```
5. Clicca "**Save**"

### B. Configura le Credenziali Google Cloud

1. Clicca sul nodo "**Google DLP API**" (quarto nodo)
2. Nel pannello a destra, trova "**Credentials**"
3. Clicca su "**Create New Credential**"
4. Seleziona "**Google Service Account API**"
5. Compila:
   - **Name**: `Google DLP Service Account`
   - **Service Account Email**: `dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com`
   - **Private Key**: Apri il file `config/service-account-key.json` e **copia tutto il contenuto JSON**
6. Clicca "**Save**"

### C. Configura Gmail

1. Clicca sul nodo "**Send Email**" (settimo nodo)
2. Nel pannello a destra, trova "**Credentials**"
3. Clicca su "**Create New Credential**"
4. Seleziona "**Gmail OAuth2 API**"
5. Segui la procedura OAuth:
   - Inserisci Client ID e Client Secret da Google Cloud Console
   - Clicca "**Connect my account**"
   - Autorizza l'accesso a Gmail
6. Clicca "**Save**"

---

## 🔍 STEP 3: Verifica la Struttura del Workflow

Il workflow dovrebbe avere **8 nodi** in questa sequenza:

```
1. [Webhook]
   ↓
2. [Read Excel]
   ↓
3. [Prepare DLP Request] ← MODIFICA PROJECT_ID QUI!
   ↓
4. [Google DLP API] ← Configura credenziali Google
   ↓
5. [Process DLP Response]
   ↓
6. [Create Excel]
   ↓
7. [Prepare Email]
   ↓
8. [Send Email] ← Configura credenziali Gmail
   ↓
9. [Webhook Response]
```

---

## ✅ STEP 4: Attiva il Workflow

1. Clicca sul toggle in alto a destra: **"Inactive"** → **"Active"**
2. Il workflow ora è LIVE e pronto a ricevere richieste!
3. Copia l'URL del webhook che appare nel nodo "Webhook"
   - Esempio: `http://localhost:5678/webhook/upload-excel`

---

## 🧪 STEP 5: Test Rapido

### Test Manuale in n8n
1. Clicca sul nodo "**Webhook**"
2. Clicca su "**Listen for Test Event**"
3. Apri il form `examples/upload-form.html` nel browser
4. Carica un file Excel di test
5. Inserisci la tua email
6. Clicca "**Anonimizza e Invia**"
7. Torna in n8n e dovresti vedere l'esecuzione completata!

### Test con Script
```bash
cd scripts
npm install
export TEST_EMAIL=your-email@gmail.com
node test-webhook.js
```

---

## 🐛 Troubleshooting

### ❌ Errore: "Workflow could not be imported"
**Causa**: Il JSON è corrotto o incompatibile

**Soluzione**:
1. Verifica che il file `excel-anonymizer.json` sia valido
2. Prova a copiare il contenuto e incollarlo direttamente nell'editor n8n
3. Se hai modificato il JSON manualmente, usa un validator: https://jsonlint.com/

---

### ❌ Errore: "Missing credentials" sul nodo Google DLP API
**Causa**: Credenziali Google non configurate

**Soluzione**:
1. Clicca sul nodo "Google DLP API"
2. Verifica che ci sia una credenziale selezionata
3. Se non c'è, segui la sezione "B. Configura le Credenziali Google Cloud"

---

### ❌ Errore: "PROJECT_ID not found"
**Causa**: Non hai modificato il PROJECT_ID nel nodo "Prepare DLP Request"

**Soluzione**:
1. Apri il nodo "Prepare DLP Request"
2. Modifica la riga `const projectId = 'YOUR_PROJECT_ID';`
3. Inserisci il tuo vero Project ID
4. Salva il nodo

---

### ❌ Errore: "Permission denied" quando chiami l'API DLP
**Causa**: Il Service Account non ha i permessi corretti

**Soluzione**:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/dlp.user"
```

---

### ❌ Webhook non risponde
**Causa**: Workflow non attivato

**Soluzione**:
1. Verifica che il toggle in alto a destra sia su "**Active**"
2. Riavvia n8n se necessario
3. Controlla che l'URL del webhook sia corretto

---

### ❌ Email non ricevuta
**Causa**: Configurazione Gmail OAuth2 non corretta

**Soluzione**:
1. Verifica che le credenziali Gmail siano connesse
2. Controlla la cartella **Spam** nella tua email
3. Verifica l'esecuzione in n8n per vedere eventuali errori
4. Ri-connetti l'account Gmail se necessario

---

## 📊 Struttura dei Nodi - Dettaglio

### 1. Webhook
- **Tipo**: Trigger (attiva il workflow)
- **Metodo**: POST
- **Path**: `/upload-excel`
- **Configurazione**: Nessuna modifica necessaria

### 2. Read Excel
- **Tipo**: Spreadsheet File
- **Operazione**: From File
- **Configurazione**: Nessuna modifica necessaria

### 3. Prepare DLP Request ⚠️ MODIFICA QUI
- **Tipo**: Code
- **Linguaggio**: JavaScript
- **Configurazione**:
  - ✏️ Modifica `const projectId = 'YOUR_PROJECT_ID';`
  - Inserisci il tuo Google Cloud Project ID

### 4. Google DLP API 🔑 CREDENZIALI QUI
- **Tipo**: HTTP Request
- **URL**: `https://dlp.googleapis.com/v2/projects/{{projectId}}/content:deidentify`
- **Configurazione**:
  - 🔑 Aggiungi credenziali Google Service Account

### 5. Process DLP Response
- **Tipo**: Code
- **Configurazione**: Nessuna modifica necessaria

### 6. Create Excel
- **Tipo**: Spreadsheet File
- **Operazione**: To File
- **Configurazione**: Nessuna modifica necessaria

### 7. Prepare Email
- **Tipo**: Code
- **Configurazione**: Nessuna modifica necessaria

### 8. Send Email 🔑 CREDENZIALI QUI
- **Tipo**: Gmail
- **Configurazione**:
  - 🔑 Aggiungi credenziali Gmail OAuth2

### 9. Webhook Response
- **Tipo**: Respond to Webhook
- **Configurazione**: Nessuna modifica necessaria

---

## 📝 Note Importanti

1. **Non dimenticare di modificare il PROJECT_ID** nel nodo "Prepare DLP Request"!
2. **Le credenziali non sono salvate nel JSON** per sicurezza - devi configurarle manualmente
3. **Attiva il workflow** prima di testare
4. **Primi 50,000 API calls/mese sono GRATIS** su Google DLP

---

## 🎉 Fatto!

Ora il tuo workflow dovrebbe funzionare perfettamente!

Se hai altri problemi, consulta la guida completa: `docs/SETUP-GUIDA.md`

---

**Creato con ❤️ usando n8n e Google Sensitive Data Protection**

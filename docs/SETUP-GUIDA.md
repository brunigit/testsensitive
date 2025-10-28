# 📘 Guida Setup Completa - Excel Data Anonymizer

Questa guida ti accompagnerà passo-passo nella configurazione completa del sistema di anonimizzazione dati con Google Sensitive Data Protection e n8n.

## 📑 Indice

1. [Prerequisiti](#1-prerequisiti)
2. [Setup Google Cloud](#2-setup-google-cloud)
3. [Configurazione Service Account](#3-configurazione-service-account)
4. [Setup n8n](#4-setup-n8n)
5. [Configurazione Gmail](#5-configurazione-gmail)
6. [Import Workflow](#6-import-workflow)
7. [Test del Sistema](#7-test-del-sistema)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisiti

Prima di iniziare, assicurati di avere:

- ✅ Account Google Cloud attivo
- ✅ n8n installato e funzionante
- ✅ Account Gmail per l'invio email
- ✅ Node.js (v16+) installato (per script di test)
- ✅ Accesso alla console Google Cloud
- ✅ Carta di credito collegata a Google Cloud (per abilitare API)

---

## 2. Setup Google Cloud

### 2.1 Accedi alla Console Google Cloud

1. Vai su [console.cloud.google.com](https://console.cloud.google.com)
2. Seleziona o crea un progetto
3. Annota il **Project ID** (lo userai dopo)

### 2.2 Abilita l'API Sensitive Data Protection

**Opzione A: Tramite Console Web**
1. Vai su **API & Services** > **Library**
2. Cerca "**Cloud Data Loss Prevention (DLP) API**"
3. Clicca su "**ENABLE**"
4. Attendi che l'API venga abilitata (richiede ~2 minuti)

**Opzione B: Tramite gcloud CLI**
```bash
# Installa gcloud se non l'hai già fatto
# https://cloud.google.com/sdk/docs/install

# Configura il progetto
gcloud config set project YOUR_PROJECT_ID

# Abilita l'API
gcloud services enable dlp.googleapis.com

# Verifica che sia abilitata
gcloud services list --enabled | grep dlp
```

### 2.3 Verifica Billing

⚠️ **IMPORTANTE**: L'API DLP richiede che il billing sia abilitato.

1. Vai su **Billing** nella console
2. Verifica che il progetto abbia un account di fatturazione collegato
3. Se non collegato, clicca su "**Link a billing account**"

**Prezzi Google DLP** (aggiornati al 2025):
- Primi 50,000 unità/mese: **GRATIS**
- Unità successive: $1.00 per 1,000 unità
- 1 unità = 1 campo analizzato

💡 **Per uso personale/testing**: rimarrai nel tier gratuito!

---

## 3. Configurazione Service Account

### 3.1 Crea un Service Account

**Tramite Console Web:**

1. Vai su **IAM & Admin** > **Service Accounts**
2. Clicca "**+ CREATE SERVICE ACCOUNT**"
3. Compila i campi:
   - **Name**: `dlp-anonymizer`
   - **Description**: `Service account per anonimizzazione dati con DLP`
4. Clicca "**CREATE AND CONTINUE**"

### 3.2 Assegna i Permessi

1. Nella sezione "**Grant this service account access to project**":
   - Clicca su "**Select a role**"
   - Cerca e seleziona: **Cloud DLP > DLP User**
   - (Ruolo completo: `roles/dlp.user`)
2. Clicca "**CONTINUE**"
3. Clicca "**DONE**"

**Tramite gcloud CLI:**
```bash
# Crea il service account
gcloud iam service-accounts create dlp-anonymizer \
    --display-name="DLP Anonymizer Service Account" \
    --description="Service account per anonimizzazione dati"

# Assegna il ruolo DLP User
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/dlp.user"
```

### 3.3 Crea e Scarica la Chiave JSON

**Tramite Console Web:**

1. Nella pagina **Service Accounts**, trova `dlp-anonymizer`
2. Clicca sui tre puntini (⋮) > "**Manage keys**"
3. Clicca "**ADD KEY**" > "**Create new key**"
4. Seleziona formato: **JSON**
5. Clicca "**CREATE**"
6. Il file JSON verrà scaricato automaticamente
7. **RINOMINA** il file in `service-account-key.json`
8. **SPOSTA** il file nella cartella del progetto: `/config/`

**Tramite gcloud CLI:**
```bash
# Crea e scarica la chiave
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Sposta nella cartella config
mv service-account-key.json ./config/
```

⚠️ **SICUREZZA CRITICA:**
- ❌ NON committare MAI questo file in Git
- ❌ NON condividere MAI questo file
- ✅ Il file è già escluso dal `.gitignore`
- ✅ Tratta questo file come una password

---

## 4. Setup n8n

### 4.1 Verifica Installazione n8n

```bash
# Verifica che n8n sia installato
n8n --version

# Se non installato:
npm install -g n8n

# Oppure con Docker:
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 4.2 Avvia n8n

```bash
# Avvio normale
n8n start

# Oppure con Docker
docker start n8n
```

Accedi a: [http://localhost:5678](http://localhost:5678)

### 4.3 Crea Account (prima volta)

Se è la prima volta che usi n8n:
1. Crea username e password
2. Completa il setup iniziale

---

## 5. Configurazione Gmail

### 5.1 Abilita OAuth2 per Gmail

**Passo 1: Crea OAuth2 Credentials in Google Cloud**

1. Vai su [console.cloud.google.com](https://console.cloud.google.com)
2. **API & Services** > **Credentials**
3. Clicca "**+ CREATE CREDENTIALS**" > "**OAuth client ID**"
4. Se richiesto, configura la schermata di consenso OAuth:
   - User Type: **External**
   - App name: `n8n Excel Anonymizer`
   - User support email: tua email
   - Developer contact: tua email
   - Clicca "**SAVE AND CONTINUE**"
5. Aggiungi gli scope:
   - Clicca "**ADD OR REMOVE SCOPES**"
   - Cerca e aggiungi: `https://www.googleapis.com/auth/gmail.send`
   - Clicca "**UPDATE**"
6. Aggiungi test users:
   - Clicca "**ADD USERS**"
   - Inserisci la tua email Gmail
   - Clicca "**SAVE AND CONTINUE**"
7. Torna a **Credentials** > "**+ CREATE CREDENTIALS**" > "**OAuth client ID**"
8. Application type: **Web application**
9. Name: `n8n Gmail Integration`
10. **Authorized redirect URIs**: `https://localhost:5678/rest/oauth2-credential/callback`
    - ⚠️ Se usi n8n cloud: `https://YOUR_N8N_URL/rest/oauth2-credential/callback`
11. Clicca "**CREATE**"
12. **Copia** Client ID e Client Secret (li userai in n8n)

### 5.2 Configura Credenziali Gmail in n8n

1. In n8n, vai su **Credentials** (icona chiave in alto a destra)
2. Clicca "**+ Add Credential**"
3. Cerca e seleziona "**Gmail OAuth2 API**"
4. Compila i campi:
   - **Name**: `Gmail OAuth2`
   - **Client ID**: incolla da Google Cloud
   - **Client Secret**: incolla da Google Cloud
5. Clicca "**Connect my account**"
6. Si aprirà una finestra di login Google:
   - Accedi con il tuo account Gmail
   - Clicca "**Continue**" (anche se dice "app non verificata")
   - Autorizza l'accesso a Gmail
7. Chiudi la finestra - dovresti vedere "**Connected**"
8. Clicca "**Save**"

---

## 6. Import Workflow

### 6.1 Importa il Workflow in n8n

1. In n8n, clicca su "**+ Add workflow**" (o usa uno esistente)
2. Clicca sul menu (☰) in alto a sinistra
3. Seleziona "**Import from File**"
4. Seleziona il file: `n8n-workflows/excel-anonymizer.json`
5. Clicca "**Import**"

### 6.2 Configura le Credenziali nel Workflow

**A. Configura Google Service Account**

1. Clicca sul nodo "**Google DLP - De-identify**"
2. Nel pannello a destra, trova "**Credentials**"
3. Clicca "**Create New Credential**"
4. Seleziona "**Google Service Account**"
5. Compila i campi:
   - **Name**: `Google DLP Service Account`
   - **Service Account Email**: `dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com`
   - **Private Key**: Apri il file `config/service-account-key.json` e copia **TUTTO** il contenuto
6. Clicca "**Save**"

**B. Configura Gmail OAuth2**

1. Clicca sul nodo "**Send Email - Gmail**"
2. Nel pannello a destra, trova "**Credentials**"
3. Seleziona la credenziale "**Gmail OAuth2**" creata in precedenza
4. Se non c'è, creane una seguendo i passi della sezione 5.2

**C. Configura Variabili d'Ambiente**

1. Copia il file di esempio:
```bash
cp config/.env.example config/.env
```

2. Modifica `config/.env`:
```bash
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id  # ← Inserisci il tuo Project ID
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account-key.json
GMAIL_USER=your-email@gmail.com  # ← Tua email Gmail
EMAIL_SENDER=your-email@gmail.com
```

3. Nel nodo "**Prepare DLP Request**", verifica che la variabile `$env.GOOGLE_CLOUD_PROJECT_ID` sia configurata:
   - Se n8n non legge il file `.env`, puoi impostare la variabile direttamente nel codice:
   ```javascript
   const projectId = 'your-project-id'; // ← Sostituisci con il tuo
   ```

### 6.3 Attiva il Workflow

1. Clicca sul toggle in alto a destra: **"Inactive"** → **"Active"**
2. Il webhook ora è attivo e pronto a ricevere richieste!

### 6.4 Ottieni l'URL del Webhook

1. Clicca sul nodo "**Webhook - Upload Excel**"
2. Copia l'URL del webhook (es: `http://localhost:5678/webhook/upload-excel`)
3. Questo è l'endpoint dove invierai i file Excel

---

## 7. Test del Sistema

### 7.1 Crea un File Excel di Test

Crea un file `test-data.xlsx` con questi dati:

| Nome | Email | Telefono | Social | Note |
|------|-------|----------|--------|------|
| Mario Rossi | mario.rossi@example.com | +39 333 1234567 | @mariorossi | Cliente VIP |
| Laura Bianchi | laura.bianchi@test.it | +39 348 9876543 | @laurab | Follow up richiesto |
| Giovanni Verdi | g.verdi@mail.com | +39 02 12345678 | @gioverdi | Instagram: @giovanniv |

### 7.2 Test tramite cURL

```bash
# Sostituisci YOUR_EMAIL con la tua email Gmail
curl -X POST http://localhost:5678/webhook/upload-excel \
  -F "file=@test-data.xlsx" \
  -F "email=YOUR_EMAIL@gmail.com"
```

### 7.3 Test tramite Script Node.js

```bash
cd scripts
node test-dlp-api.js
```

(Lo script verrà creato nel passo successivo)

### 7.4 Verifica il Risultato

1. **Nell'interfaccia n8n:**
   - Vai su **Executions** (icona orologio)
   - Dovresti vedere l'esecuzione completata
   - Clicca per vedere i dettagli di ogni nodo

2. **Nella tua email:**
   - Riceverai un'email con il file Excel anonimizzato
   - Apri il file e verifica che i dati siano mascherati

**Esempio di output atteso:**

| Nome | Email | Telefono | Social | Note |
|------|-------|----------|--------|------|
| M**** R**** | m****@*******.com | +** *** ******* | @m******** | Cliente VIP |
| L**** B****** | l****@****.it | +** *** ******* | @l***** | Follow up richiesto |
| G******* V**** | g****@****.com | +** ** ******** | @g******* | Instagram: @g******** |

---

## 8. Troubleshooting

### Errore: "Permission denied calling DLP API"

**Causa**: Service Account non ha i permessi corretti

**Soluzione**:
```bash
# Verifica i ruoli assegnati
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com"

# Ri-assegna il ruolo
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/dlp.user"
```

### Errore: "API DLP not enabled"

**Soluzione**:
```bash
# Verifica se l'API è abilitata
gcloud services list --enabled | grep dlp

# Se non è abilitata
gcloud services enable dlp.googleapis.com
```

### Errore: "Invalid credentials" in n8n

**Causa**: File JSON delle credenziali non valido o non configurato

**Soluzione**:
1. Verifica che il file `service-account-key.json` sia nella cartella `config/`
2. Apri il file e verifica che sia un JSON valido
3. In n8n, ri-crea la credenziale copiando **tutto** il contenuto del JSON
4. Assicurati di non avere spazi o caratteri extra

### Errore: "Gmail authentication failed"

**Soluzione**:
1. Verifica che l'OAuth2 sia configurato correttamente in Google Cloud
2. Assicurati di aver aggiunto la tua email come "test user"
3. Ri-connetti l'account Gmail in n8n:
   - Credentials > Gmail OAuth2 > "Reconnect"

### File Excel non elaborato correttamente

**Causa**: Formato file non supportato o headers mancanti

**Soluzione**:
1. Verifica che il file sia in formato `.xlsx` (non `.xls`)
2. Assicurati che la prima riga contenga gli header delle colonne
3. Verifica che non ci siano celle unite o formule complesse

### Webhook non risponde

**Causa**: n8n non è in esecuzione o workflow non attivato

**Soluzione**:
```bash
# Verifica che n8n sia in esecuzione
ps aux | grep n8n

# Riavvia n8n
n8n start

# Verifica che il workflow sia "Active" nell'interfaccia
```

### Nessuna email ricevuta

**Causa**: Configurazione Gmail o filtri antispam

**Soluzione**:
1. Controlla la cartella **Spam** nella tua email
2. Verifica che l'esecuzione in n8n sia completata senza errori
3. Controlla i log del nodo "Send Email - Gmail" per errori
4. Verifica che l'email di destinazione sia corretta

---

## 🎉 Congratulazioni!

Hai configurato con successo il sistema di anonimizzazione dati!

### Prossimi Passi

1. **Personalizza il workflow**:
   - Aggiungi altri tipi di dati da rilevare
   - Modifica il template dell'email
   - Aggiungi logging o notifiche

2. **Metti in produzione**:
   - Usa n8n cloud per un endpoint pubblico
   - Configura un dominio personalizzato
   - Implementa autenticazione per il webhook

3. **Ottimizza i costi**:
   - Monitora l'uso dell'API DLP nella console Google Cloud
   - Riduci i tipi di dati rilevati se non necessari
   - Usa caching per file ripetuti

### Risorse Utili

- [Documentazione Google DLP](https://cloud.google.com/sensitive-data-protection/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Google Cloud Free Tier](https://cloud.google.com/free)

### Supporto

Se hai problemi o domande, apri una issue nel repository!

---

**Creato con ❤️ usando Google Sensitive Data Protection e n8n**

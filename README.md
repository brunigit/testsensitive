# 🛡️ Excel Data Anonymizer - Google Sensitive Data Protection + n8n

Sistema completo per l'anonimizzazione automatica di dati sensibili in file Excel utilizzando Google Sensitive Data Protection API e n8n workflow automation.

## 🎯 Funzionalità

- 📤 **Upload file Excel** tramite form web
- 🔍 **Rilevamento automatico** di dati sensibili (PII):
  - Email, telefoni, nomi
  - Indirizzi fisici e IP
  - Numeri carta di credito, SSN
  - **Social media mentions** (@username, handle Twitter/Instagram/etc)
  - Date di nascita
  - E molto altro...
- 🎭 **Anonimizzazione con masking** (es: `jo**@ex*****.com`, `+39 3** *** ****`)
- 📧 **Invio automatico** del file anonimizzato via Gmail
- ⚡ **Completamente automatizzato** con n8n

## 📋 Requisiti

- [x] Account Google Cloud con API Sensitive Data Protection abilitata
- [x] Service Account Google Cloud con permessi DLP
- [x] n8n installato e configurato
- [x] Account Gmail per invio email

## 🚀 Quick Start

### 1. Clona il repository
```bash
git clone <your-repo>
cd testsensitive
```

### 2. Configura Google Cloud
Segui la guida dettagliata: [docs/SETUP-GUIDA.md](docs/SETUP-GUIDA.md)

### 3. Configura le variabili d'ambiente
```bash
cp config/.env.example config/.env
# Modifica config/.env con i tuoi dati
```

### 4. Importa il workflow in n8n
1. Apri n8n
2. Clicca su "Import from File"
3. Seleziona `n8n-workflows/excel-anonymizer.json`
4. Configura le credenziali (Google Cloud, Gmail)
5. Attiva il workflow

### 5. Testa il sistema
```bash
cd scripts
node test-dlp-api.js
```

## 📁 Struttura del Progetto

```
testsensitive/
├── README.md                           # Questo file
├── .gitignore                         # File da ignorare in git
├── n8n-workflows/                     # Workflow n8n
│   └── excel-anonymizer.json          # Workflow principale
├── scripts/                           # Script di test
│   └── test-dlp-api.js               # Test API Google DLP
├── config/                            # Configurazioni
│   ├── .env.example                  # Template variabili ambiente
│   └── transformation-config.json    # Config trasformazioni DLP
├── docs/                              # Documentazione
│   ├── SETUP-GUIDA.md                # Guida setup completa
│   └── API-REFERENCE.md              # Riferimento API
└── examples/                          # File di esempio
    └── sample-data.xlsx              # Excel di test
```

## 🔧 Configurazione Google Cloud

### Abilita l'API
```bash
gcloud services enable dlp.googleapis.com
```

### Crea Service Account
```bash
gcloud iam service-accounts create dlp-anonymizer \
    --display-name="DLP Anonymizer Service Account"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/dlp.user"

gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=dlp-anonymizer@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## 🎨 Workflow n8n - Dettagli

Il workflow è composto da 5 nodi principali:

1. **Webhook Trigger** - Riceve upload file Excel
2. **Spreadsheet File** - Legge e converte Excel in formato tabellare
3. **HTTP Request - Google DLP** - Anonimizza i dati
4. **Spreadsheet File** - Genera nuovo Excel anonimizzato
5. **Gmail** - Invia file via email

### Tipi di dati rilevati automaticamente

Il workflow rileva oltre 150+ tipi di dati sensibili, tra cui:
- `EMAIL_ADDRESS`
- `PHONE_NUMBER`
- `PERSON_NAME`
- `STREET_ADDRESS`
- `IP_ADDRESS`
- `CREDIT_CARD_NUMBER`
- `DATE_OF_BIRTH`
- `SOCIAL_MEDIA_USERNAME` (Twitter, Instagram, Facebook, LinkedIn)
- E molti altri...

## 📊 Esempio di Trasformazione

### Prima dell'anonimizzazione:
| Nome | Email | Telefono | Social |
|------|-------|----------|--------|
| Mario Rossi | mario.rossi@email.com | +39 333 1234567 | @mariorossi |

### Dopo l'anonimizzazione:
| Nome | Email | Telefono | Social |
|------|-------|----------|--------|
| M**** R**** | m****@*****.com | +** *** ******* | @m******** |

## 🔐 Sicurezza

- ⚠️ **NON committare** le credenziali Google Cloud nel repository
- ⚠️ **NON condividere** il file `service-account-key.json`
- ✅ Le credenziali sono escluse tramite `.gitignore`
- ✅ Usa sempre Service Account con permessi minimi necessari
- ✅ Ruota periodicamente le chiavi del Service Account

## 📚 Documentazione

- [Guida Setup Completa](docs/SETUP-GUIDA.md) - Configurazione passo-passo
- [Google Sensitive Data Protection](https://cloud.google.com/sensitive-data-protection/docs)
- [n8n Documentation](https://docs.n8n.io)

## 🐛 Troubleshooting

### Errore: "Permission denied calling DLP API"
- Verifica che il Service Account abbia il ruolo `roles/dlp.user`
- Controlla che l'API Sensitive Data Protection sia abilitata

### Errore: "Invalid credentials"
- Verifica che il file JSON delle credenziali sia valido
- Controlla che le credenziali siano configurate correttamente in n8n

### File Excel non elaborato correttamente
- Verifica che il file sia in formato `.xlsx` (non `.xls`)
- Controlla che le colonne abbiano header validi

## 🤝 Contributi

Contributi, issues e feature requests sono benvenuti!

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT.

## 👤 Autore

Creato con ❤️ usando Google Sensitive Data Protection API e n8n

---

**⚠️ Disclaimer**: Questo tool è progettato per aiutare nella protezione dei dati sensibili, ma è responsabilità dell'utente verificare che l'anonimizzazione soddisfi i requisiti legali e di compliance della propria organizzazione (GDPR, CCPA, etc).

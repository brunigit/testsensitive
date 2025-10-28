# 📖 API Reference - Google Sensitive Data Protection

Questa guida fornisce una panoramica dettagliata dell'API Google Sensitive Data Protection utilizzata nel progetto.

## 📑 Indice

1. [Overview](#overview)
2. [Endpoint API](#endpoint-api)
3. [Autenticazione](#autenticazione)
4. [Request Structure](#request-structure)
5. [Response Structure](#response-structure)
6. [Info Types](#info-types)
7. [Transformation Methods](#transformation-methods)
8. [Esempi di Codice](#esempi-di-codice)
9. [Limiti e Quote](#limiti-e-quote)
10. [Best Practices](#best-practices)

---

## Overview

Google Sensitive Data Protection API (precedentemente Cloud DLP) è un servizio per:
- **Rilevare** automaticamente dati sensibili (PII)
- **Classificare** i dati per tipo (email, telefoni, nomi, etc)
- **Anonimizzare** i dati con vari metodi di trasformazione

### Caratteristiche Principali

- ✅ Supporto per 150+ tipi di dati sensibili predefiniti
- ✅ Custom regex per rilevamento personalizzato
- ✅ Multipli metodi di anonimizzazione
- ✅ Supporto per dati tabulari (CSV, Excel, database)
- ✅ API RESTful e librerie client

---

## Endpoint API

### Base URL
```
https://dlp.googleapis.com/v2
```

### Metodo: De-identify Content

**Endpoint:**
```
POST /projects/{projectId}/content:deidentify
POST /projects/{projectId}/locations/{locationId}/content:deidentify
```

**Scopes OAuth2:**
```
https://www.googleapis.com/auth/cloud-platform
```

---

## Autenticazione

### Service Account (Raccomandato per server)

```javascript
const { DlpServiceClient } = require('@google-cloud/dlp');

const dlp = new DlpServiceClient({
  keyFilename: './service-account-key.json',
  projectId: 'your-project-id'
});
```

### OAuth2 (Per applicazioni client)

```bash
gcloud auth application-default login
```

---

## Request Structure

### Struttura Base

```json
{
  "parent": "projects/{PROJECT_ID}/locations/global",
  "item": {
    "table": {
      "headers": [
        { "name": "Nome" },
        { "name": "Email" }
      ],
      "rows": [
        {
          "values": [
            { "stringValue": "Mario Rossi" },
            { "stringValue": "mario@example.com" }
          ]
        }
      ]
    }
  },
  "deidentifyConfig": { ... },
  "inspectConfig": { ... }
}
```

### InspectConfig

Definisce **cosa** rilevare:

```json
{
  "inspectConfig": {
    "infoTypes": [
      { "name": "EMAIL_ADDRESS" },
      { "name": "PHONE_NUMBER" },
      { "name": "PERSON_NAME" }
    ],
    "customInfoTypes": [
      {
        "infoType": { "name": "SOCIAL_MEDIA" },
        "regex": { "pattern": "@[A-Za-z0-9_]+" },
        "likelihood": "LIKELY"
      }
    ],
    "minLikelihood": "POSSIBLE",
    "includeQuote": true,
    "limits": {
      "maxFindingsPerItem": 0,
      "maxFindingsPerRequest": 0
    }
  }
}
```

**Parametri:**
- `infoTypes`: Tipi di dati predefiniti da rilevare
- `customInfoTypes`: Pattern personalizzati (regex)
- `minLikelihood`: Soglia minima di confidenza
  - `VERY_UNLIKELY`, `UNLIKELY`, `POSSIBLE`, `LIKELY`, `VERY_LIKELY`
- `includeQuote`: Include il valore originale trovato
- `limits`: Limiti sui risultati (0 = illimitato)

### DeidentifyConfig

Definisce **come** anonimizzare:

```json
{
  "deidentifyConfig": {
    "recordTransformations": {
      "fieldTransformations": [
        {
          "fields": [{ "name": "*" }],
          "infoTypeTransformations": {
            "transformations": [
              {
                "primitiveTransformation": {
                  "characterMaskConfig": {
                    "maskingCharacter": "*",
                    "numberToMask": 0,
                    "reverseOrder": false
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

**Tipi di trasformazioni:**
- `characterMaskConfig` - Masking con caratteri
- `replaceConfig` - Sostituzione con valore fisso
- `redactConfig` - Rimozione completa
- `cryptoHashConfig` - Hash crittografico
- `cryptoReplaceFfxFpeConfig` - Format-preserving encryption
- `dateShiftConfig` - Spostamento date
- `bucketingConfig` - Ragguppamento valori

---

## Response Structure

```json
{
  "item": {
    "table": {
      "headers": [
        { "name": "Nome" },
        { "name": "Email" }
      ],
      "rows": [
        {
          "values": [
            { "stringValue": "M**** R****" },
            { "stringValue": "m****@*******.com" }
          ]
        }
      ]
    }
  },
  "overview": {
    "transformedBytes": "256",
    "transformationSummaries": [
      {
        "infoType": { "name": "EMAIL_ADDRESS" },
        "transformation": {
          "characterMaskConfig": {
            "maskingCharacter": "*"
          }
        },
        "results": [
          {
            "count": "1",
            "code": "SUCCESS"
          }
        ]
      }
    ]
  }
}
```

---

## Info Types

### Tipi Predefiniti Comuni

#### Informazioni Personali
- `PERSON_NAME` - Nomi di persona
- `FIRST_NAME` - Nome
- `LAST_NAME` - Cognome
- `GENDER` - Genere
- `DATE_OF_BIRTH` - Data di nascita
- `AGE` - Età

#### Contatti
- `EMAIL_ADDRESS` - Indirizzi email
- `PHONE_NUMBER` - Numeri telefono (internazionali)
- `ITALY_FISCAL_CODE` - Codice fiscale italiano
- `ITALY_VAT_NUMBER` - Partita IVA italiana

#### Indirizzi
- `STREET_ADDRESS` - Indirizzo completo
- `LOCATION` - Luoghi generici
- `CITY` - Città
- `ZIP_CODE` - Codici postali

#### Finanziari
- `CREDIT_CARD_NUMBER` - Numeri carta di credito
- `IBAN_CODE` - Codici IBAN
- `SWIFT_CODE` - Codici SWIFT
- `CREDIT_CARD_TRACK_NUMBER` - Track number carte

#### Network
- `IP_ADDRESS` - Indirizzi IP
- `MAC_ADDRESS` - Indirizzi MAC
- `URL` - URL completi
- `DOMAIN_NAME` - Nomi di dominio

#### Documenti
- `PASSPORT` - Numeri passaporto
- `ITALY_DRIVERS_LICENSE_NUMBER` - Patente italiana
- `VEHICLE_IDENTIFICATION_NUMBER` - Numero telaio
- `MEDICAL_RECORD_NUMBER` - Numeri cartelle cliniche

#### Social & Online
- `USERNAME` - Username generici
- `PASSWORD` - Password

### Custom Info Types per Social Media

```json
{
  "customInfoTypes": [
    {
      "infoType": { "name": "TWITTER_HANDLE" },
      "regex": {
        "pattern": "(?:^|[^@\\w])@([A-Za-z0-9_]{1,15})\\b"
      },
      "likelihood": "LIKELY"
    },
    {
      "infoType": { "name": "INSTAGRAM_HANDLE" },
      "regex": {
        "pattern": "(?:@|(?:instagram\\.com/))([A-Za-z0-9_.]{1,30})"
      },
      "likelihood": "LIKELY"
    },
    {
      "infoType": { "name": "FACEBOOK_PROFILE" },
      "regex": {
        "pattern": "(?:facebook\\.com/|fb\\.com/)([A-Za-z0-9.]{5,})"
      },
      "likelihood": "LIKELY"
    },
    {
      "infoType": { "name": "LINKEDIN_PROFILE" },
      "regex": {
        "pattern": "(?:linkedin\\.com/in/)([A-Za-z0-9-]{3,100})"
      },
      "likelihood": "LIKELY"
    },
    {
      "infoType": { "name": "TIKTOK_HANDLE" },
      "regex": {
        "pattern": "(?:@|(?:tiktok\\.com/@))([A-Za-z0-9_.]{1,24})"
      },
      "likelihood": "LIKELY"
    },
    {
      "infoType": { "name": "YOUTUBE_CHANNEL" },
      "regex": {
        "pattern": "(?:youtube\\.com/(?:c/|channel/|@))([A-Za-z0-9_-]{1,100})"
      },
      "likelihood": "LIKELY"
    }
  ]
}
```

---

## Transformation Methods

### 1. Character Masking

**Descrizione:** Maschera caratteri con un simbolo

```json
{
  "characterMaskConfig": {
    "maskingCharacter": "*",
    "numberToMask": 0,
    "reverseOrder": false,
    "charactersToIgnore": [
      { "charactersToSkip": "@." }
    ]
  }
}
```

**Esempio:**
- Input: `mario.rossi@example.com`
- Output: `m****.*****@*******.com`

**Parametri:**
- `maskingCharacter`: Carattere da usare per mascherare
- `numberToMask`: Numero di caratteri da mascherare (0 = tutti)
- `reverseOrder`: Maschera dalla fine invece che dall'inizio
- `charactersToIgnore`: Caratteri da non mascherare

### 2. Replacement

**Descrizione:** Sostituisce con valore fisso

```json
{
  "replaceConfig": {
    "newValue": {
      "stringValue": "[REDACTED]"
    }
  }
}
```

**Esempio:**
- Input: `mario.rossi@example.com`
- Output: `[REDACTED]`

### 3. Redaction

**Descrizione:** Rimuove completamente il dato

```json
{
  "redactConfig": {}
}
```

**Esempio:**
- Input: `Nome: Mario, Email: mario@example.com`
- Output: `Nome: Mario, Email: `

### 4. Crypto Hash

**Descrizione:** Hash crittografico (irreversibile)

```json
{
  "cryptoHashConfig": {
    "cryptoKey": {
      "transient": {
        "name": "YOUR_KEY_NAME"
      }
    }
  }
}
```

**Esempio:**
- Input: `mario@example.com`
- Output: `7a8f9d3e4b5c2a1f9e8d7c6b5a4d3e2c`

### 5. Format-Preserving Encryption (FPE)

**Descrizione:** Crittografia reversibile che mantiene il formato

```json
{
  "cryptoReplaceFfxFpeConfig": {
    "cryptoKey": {
      "kmsWrapped": {
        "wrappedKey": "...",
        "cryptoKeyName": "projects/.../keyRings/.../cryptoKeys/..."
      }
    },
    "alphabet": "ALPHA_NUMERIC"
  }
}
```

**Esempio:**
- Input: `1234-5678-9012-3456` (carta credito)
- Output: `9847-2341-6523-8790` (stesso formato)

### 6. Date Shifting

**Descrizione:** Sposta date mantenendo gli intervalli

```json
{
  "dateShiftConfig": {
    "upperBoundDays": 30,
    "lowerBoundDays": -30,
    "context": {
      "name": "user_id"
    }
  }
}
```

**Esempio:**
- Input: `2024-01-15`
- Output: `2024-02-03` (spostato di +19 giorni)

### 7. Bucketing

**Descrizione:** Raggruppa valori in bucket

```json
{
  "bucketingConfig": {
    "buckets": [
      {
        "min": { "integerValue": "0" },
        "max": { "integerValue": "18" },
        "replacementValue": { "stringValue": "Minorenne" }
      },
      {
        "min": { "integerValue": "18" },
        "max": { "integerValue": "65" },
        "replacementValue": { "stringValue": "Adulto" }
      },
      {
        "min": { "integerValue": "65" },
        "replacementValue": { "stringValue": "Senior" }
      }
    ]
  }
}
```

**Esempio:**
- Input: `Età: 32`
- Output: `Età: Adulto`

---

## Esempi di Codice

### Node.js - De-identify Text

```javascript
const { DlpServiceClient } = require('@google-cloud/dlp');
const dlp = new DlpServiceClient();

async function deidentifyText(projectId, text) {
  const request = {
    parent: `projects/${projectId}/locations/global`,
    item: {
      value: text
    },
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: {
              characterMaskConfig: {
                maskingCharacter: '*'
              }
            }
          }
        ]
      }
    },
    inspectConfig: {
      infoTypes: [
        { name: 'EMAIL_ADDRESS' },
        { name: 'PHONE_NUMBER' }
      ]
    }
  };

  const [response] = await dlp.deidentifyContent(request);
  return response.item.value;
}
```

### Node.js - De-identify Table

```javascript
async function deidentifyTable(projectId, tableData) {
  const request = {
    parent: `projects/${projectId}/locations/global`,
    item: {
      table: {
        headers: tableData.headers,
        rows: tableData.rows
      }
    },
    deidentifyConfig: {
      recordTransformations: {
        fieldTransformations: [
          {
            fields: tableData.headers,
            infoTypeTransformations: {
              transformations: [
                {
                  primitiveTransformation: {
                    characterMaskConfig: {
                      maskingCharacter: '*'
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
        { name: 'PERSON_NAME' }
      ]
    }
  };

  const [response] = await dlp.deidentifyContent(request);
  return response.item.table;
}
```

### cURL - REST API

```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "item": {
      "value": "My email is john.doe@example.com"
    },
    "deidentifyConfig": {
      "infoTypeTransformations": {
        "transformations": [{
          "primitiveTransformation": {
            "characterMaskConfig": {
              "maskingCharacter": "*"
            }
          }
        }]
      }
    },
    "inspectConfig": {
      "infoTypes": [{"name": "EMAIL_ADDRESS"}]
    }
  }' \
  "https://dlp.googleapis.com/v2/projects/YOUR_PROJECT_ID/content:deidentify"
```

---

## Limiti e Quote

### Quote Predefinite (per progetto)

| Risorsa | Limite |
|---------|--------|
| Richieste al minuto | 600 |
| Byte processati al minuto | 1 GB |
| Richieste al giorno | 10,000 |
| Concurrent requests | 100 |

### Limiti per Request

| Parametro | Limite |
|-----------|--------|
| Dimensione massima request | 524 KB (512 KB) |
| Campi in una tabella | 1,000 |
| Righe in una tabella | 50,000 |
| Celle in una tabella | 50,000 |
| Custom info types | 100 per request |

### Aumentare le Quote

```bash
# Richiedi aumento quote
gcloud alpha services quota update \
  --service=dlp.googleapis.com \
  --consumer=projects/YOUR_PROJECT_ID \
  --metric=dlp.googleapis.com/quota/user/read_requests \
  --value=10000 \
  --unit=1/min/{project}
```

Oppure tramite console:
[https://console.cloud.google.com/apis/api/dlp.googleapis.com/quotas](https://console.cloud.google.com/apis/api/dlp.googleapis.com/quotas)

---

## Best Practices

### 1. Performance

✅ **Specifica info types espliciti**
```javascript
// ✅ BUONO - Specifica solo cosa serve
infoTypes: [
  { name: 'EMAIL_ADDRESS' },
  { name: 'PHONE_NUMBER' }
]

// ❌ CATTIVO - Rileva tutto (lento)
infoTypes: []
```

✅ **Batch processing per grandi dataset**
```javascript
// Processa in batch di 50,000 righe
const batchSize = 50000;
for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  await deidentifyTable(batch);
}
```

### 2. Costi

✅ **Usa il tier gratuito**
- Primi 50,000 unità/mese: GRATIS
- 1 unità = 1 campo analizzato

✅ **Monitora l'uso**
```bash
gcloud logging read "resource.type=dlp_project" \
  --format="table(timestamp, severity, jsonPayload.methodName)"
```

### 3. Sicurezza

✅ **Usa Service Accounts con permessi minimi**
```bash
# Solo permessi necessari
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/dlp.user"
```

✅ **Ruota le chiavi regolarmente**
```bash
# Crea nuova chiave
gcloud iam service-accounts keys create new-key.json \
  --iam-account=sa@PROJECT_ID.iam.gserviceaccount.com

# Elimina vecchia chiave
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=sa@PROJECT_ID.iam.gserviceaccount.com
```

### 4. Reliability

✅ **Implementa retry logic**
```javascript
async function deidentifyWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await dlp.deidentifyContent(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

✅ **Gestisci errori gracefully**
```javascript
try {
  const result = await dlp.deidentifyContent(request);
  return result;
} catch (error) {
  if (error.code === 7) {
    // Permission denied
    console.error('Check IAM permissions');
  } else if (error.code === 8) {
    // Resource exhausted (quota)
    console.error('Quota exceeded - retry later');
  }
  throw error;
}
```

---

## Risorse Aggiuntive

### Documentazione Ufficiale
- [DLP API Reference](https://cloud.google.com/dlp/docs/reference/rest)
- [Node.js Client Library](https://googleapis.dev/nodejs/dlp/latest/)
- [Info Types Reference](https://cloud.google.com/dlp/docs/infotypes-reference)

### Tools
- [DLP API Explorer](https://cloud.google.com/dlp/docs/quickstart-api)
- [DLP Content Inspector UI](https://cloud.google.com/dlp/docs/inspecting-text)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

### Community
- [Stack Overflow - google-cloud-dlp](https://stackoverflow.com/questions/tagged/google-cloud-dlp)
- [GitHub - googleapis/nodejs-dlp](https://github.com/googleapis/nodejs-dlp)
- [Google Cloud Community](https://www.googlecloudcommunity.com/)

---

**Ultimo aggiornamento:** Gennaio 2025

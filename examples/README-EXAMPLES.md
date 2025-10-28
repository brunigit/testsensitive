# 📁 Examples - File di Esempio

Questa cartella contiene file di esempio per testare il sistema di anonimizzazione.

## 📄 File Disponibili

### 1. upload-form.html
**Form HTML per upload file Excel**

Un'interfaccia web completa per caricare file Excel e ricevere il file anonimizzato via email.

**Come usare:**
```bash
# Apri il file nel browser
open examples/upload-form.html

# Oppure usa un server HTTP
cd examples
python3 -m http.server 8000
# Poi apri: http://localhost:8000/upload-form.html
```

**Configurazione:**
1. Apri `upload-form.html` con un editor
2. Trova la riga: `const WEBHOOK_URL = 'http://localhost:5678/webhook/upload-excel';`
3. Sostituisci con il tuo URL webhook n8n
4. Salva e ricarica la pagina

---

### 2. sample-data.xlsx
**File Excel di esempio con dati sensibili**

Per creare un file di test, usa Excel/LibreOffice/Google Sheets con questi dati:

| Nome | Email | Telefono | Social | Note | Città |
|------|-------|----------|--------|------|-------|
| Mario Rossi | mario.rossi@example.com | +39 333 1234567 | @mariorossi | Cliente VIP | Milano |
| Laura Bianchi | laura.bianchi@test.it | +39 348 9876543 | @laurab Instagram: @laurabianchi | Follow up | Roma |
| Giovanni Verdi | g.verdi@mail.com | +39 02 12345678 | Twitter: @gioverdi | Sede: Via Roma 123 | Milano |
| Anna Neri | anna.neri@company.com | 02-87654321 | @annaneri TikTok: @anna_neri | Card: 4532-1234-5678-9010 | Napoli |
| Paolo Blu | paolo.blu@email.it | +39 345 1112223 | LinkedIn: linkedin.com/in/paolob | IP: 192.168.1.100 | Torino |

**Salva come:** `sample-data.xlsx` in questa cartella

---

## 🧪 Test Scenarios

### Scenario 1: Test Base
**Obiettivo:** Verificare che il sistema funzioni end-to-end

1. Crea `sample-data.xlsx` con i dati sopra
2. Apri `upload-form.html` nel browser
3. Inserisci la tua email
4. Carica il file
5. Clicca "Anonimizza e Invia"
6. Attendi l'email con il file anonimizzato

**Risultato atteso:**
- Email, telefoni, nomi mascherati con `*`
- Social media handles mascherati
- Indirizzi e numeri carta mascherati
- Altre info non sensibili rimangono intatte

---

### Scenario 2: Test Social Media
**Obiettivo:** Verificare il rilevamento delle menzioni social

**Dati di test:**
| Social |
|--------|
| @username |
| Instagram: @myprofile |
| Twitter: @tweeter123 |
| TikTok: @tiktoker |
| facebook.com/mypage |
| linkedin.com/in/johndoe |

**Risultato atteso:** Tutti gli handle/username mascherati

---

### Scenario 3: Test Dati Finanziari
**Obiettivo:** Verificare anonimizzazione dati sensibili

**Dati di test:**
| Pagamento |
|-----------|
| Carta: 4532-1234-5678-9010 |
| IBAN: IT60X0542811101000000123456 |
| CVV: 123 |

**Risultato atteso:** Numeri carta e IBAN mascherati

---

### Scenario 4: Test Grandi Volumi
**Obiettivo:** Testare performance con molte righe

1. Crea un file Excel con 1000+ righe
2. Usa un script per generare dati fake:

```javascript
// generate-test-data.js
const faker = require('faker');
const XLSX = require('xlsx');

const data = [];
for (let i = 0; i < 1000; i++) {
  data.push({
    Nome: faker.name.findName(),
    Email: faker.internet.email(),
    Telefono: faker.phone.phoneNumber(),
    Social: `@${faker.internet.userName()}`,
    Città: faker.address.city()
  });
}

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Data');
XLSX.writeFile(wb, 'large-sample.xlsx');
```

---

## 🎨 Personalizzazione Form

### Cambiare i colori
Nel file `upload-form.html`, modifica i CSS:

```css
/* Gradiente principale */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cambia con i tuoi colori brand */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Aggiungere logo
Sostituisci l'emoji con un'immagine:

```html
<!-- Al posto di -->
<div class="icon">🛡️</div>

<!-- Usa -->
<img src="your-logo.png" alt="Logo" style="width: 100px; height: auto;">
```

### Personalizzare messaggi
Modifica i testi nel file HTML cercando le stringhe che vuoi cambiare.

---

## 📊 Dati di Test Realistici

### E-commerce
| Cliente | Email | Telefono | Indirizzo | Carta |
|---------|-------|----------|-----------|-------|
| Mario Rossi | mario@example.com | +39 333 1234567 | Via Roma 1, Milano | 4532-****-****-1234 |

### CRM
| Nome | Email | Azienda | Social | Note |
|------|-------|---------|--------|------|
| Laura B. | laura@company.it | Acme Corp | @laurab | Contattare Q1 2025 |

### HR / Dipendenti
| Dipendente | Email | Tel Interno | Ufficio | Data Nascita |
|------------|-------|-------------|---------|--------------|
| Giovanni V. | g.verdi@company.com | 1234 | Milano - Piano 3 | 15/03/1985 |

---

## 🛠️ Script Utility

### Genera dati fake per test
```bash
npm install -g faker xlsx
node scripts/generate-test-data.js
```

### Confronta file originale vs anonimizzato
```bash
# Usa diff o un tool Excel
diff original.xlsx anonymized.xlsx
```

### Valida anonimizzazione
```bash
# Script per verificare che non ci siano dati sensibili
node scripts/validate-anonymization.js anonymized.xlsx
```

---

## ⚠️ Note Importanti

1. **Non committare file con dati reali** - Usa solo dati di test
2. **Testa con dati fake** - Mai usare dati veri in sviluppo
3. **Valida sempre i risultati** - Verifica che l'anonimizzazione sia efficace
4. **Rispetta il GDPR** - Anche in test, tratta i dati con cura

---

## 📚 Risorse

- [Faker.js](https://github.com/marak/Faker.js/) - Genera dati fake
- [xlsx](https://github.com/SheetJS/sheetjs) - Libreria Excel per Node.js
- [Mockaroo](https://www.mockaroo.com/) - Genera dataset online

---

**Creato con ❤️ per testare l'anonimizzazione dati**

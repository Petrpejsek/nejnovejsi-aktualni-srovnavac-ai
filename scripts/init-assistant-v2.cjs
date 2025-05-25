const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
require('dotenv').config();

async function main() {
  try {
    console.log('=== INIT ASSISTANT V2 ===');
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY není nastaveno');
      process.exit(1);
    }

    // 1) Export produktů do souboru (předpokládáme, že už existuje nebo použij vlastní export)
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    if (!fs.existsSync(filePath)) {
      console.error('Soubor s produkty neexistuje:', filePath);
      process.exit(1);
    }
    console.log('Export hotov:', filePath);

    // 2) Nahrajeme soubor do OpenAI
    const fileData = fs.readFileSync(filePath);
    const uploadRes = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: (() => {
        const form = new (require('form-data'))();
        form.append('file', fileData, { filename: 'products.json', contentType: 'application/json' });
        form.append('purpose', 'assistants');
        return form;
      })()
    });
    const fileJson = await uploadRes.json();
    if (!fileJson.id) throw new Error('Chyba při nahrávání souboru: ' + JSON.stringify(fileJson));
    console.log('Soubor nahrán, fileId:', fileJson.id);

    // 3) Vytvoříme asistenta přes v2 endpoint (přidáme file_ids)
    const assistantRes = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        name: 'Product Recommendation Assistant',
        instructions: 'Jsi asistent pro doporučování AI nástrojů. Při dotazu najdi nejrelevantnější produkty v připojeném souboru a vrať je jako JSON.',
        model: 'gpt-4-turbo',
        tools: [{ type: 'file_search' }],
        file_ids: [fileJson.id]
      })
    });
    const assistantJson = await assistantRes.json();
    if (!assistantJson.id) throw new Error('Chyba při vytváření asistenta: ' + JSON.stringify(assistantJson));
    console.log('Assistant vytvořen, ID:', assistantJson.id);

    // 5) Uložíme metadata
    const meta = {
      assistantId: assistantJson.id,
      fileId: fileJson.id,
    };
    const metaPath = path.join(process.cwd(), 'data', 'assistant-meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    console.log('Metadata uložena do', metaPath);
    console.log('=== INIT ASSISTANT V2 - HOTOVO ===');
  } catch (err) {
    console.error('Chyba při initu asistenta:', err);
    process.exit(1);
  }
}

main(); 
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { exportProductsToFile } from '../lib/exportProducts.ts';
import fetch from 'node-fetch';

(async () => {
  try {
    console.log('=== INIT ASSISTANT ===');
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY není nastaveno');
      process.exit(1);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1) Exportujeme produkty do souboru
    const filePath = await exportProductsToFile();
    console.log('Export hotov:', filePath);

    // 2) Nahrajeme soubor do OpenAI
    const fileRes = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });
    console.log('Soubor nahrán, fileId:', fileRes.id);

    // 3) Vytvoříme asistenta bez file_ids
    const assistant = await openai.beta.assistants.create({
      name: 'Product Recommendation Assistant',
      description: 'Doporučuje AI nástroje z naší databáze',
      model: 'gpt-4-turbo-preview',
      instructions: 'Jsi asistent pro doporučování AI nástrojů. Při dotazu najdi nejrelevantnější produkty v připojeném souboru a vrať je jako JSON.',
      tools: [{ type: 'file_search' }]
    });
    console.log('Assistant vytvořen, ID:', assistant.id);

    // 4) Připojíme soubor k asistentovi pomocí HTTP requestu
    const resp = await fetch('https://api.openai.com/v1/assistants/' + assistant.id + '/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ file_id: fileRes.id })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error('Chyba při připojování souboru k asistentovi: ' + errText);
    }
    console.log('Soubor připojen k asistentovi:', fileRes.id);

    // 5) Uložíme metadata
    const meta = {
      assistantId: assistant.id,
      fileId: fileRes.id,
    };
    const metaPath = path.join(process.cwd(), 'data', 'assistant-meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    console.log('Metadata uložena do', metaPath);
    console.log('=== INIT ASSISTANT - HOTOVO ===');
  } catch (err) {
    console.error('Chyba při initu asistenta:', err);
    process.exit(1);
  }
})(); 
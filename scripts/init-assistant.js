import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { exportProductsToFile } from '../lib/exportProducts.js';

(async () => {
  try {
    console.log('=== INIT ASSISTANT ===');
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY není nastaveno');
      process.exit(1);
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const filePath = await exportProductsToFile();
    console.log('Export hotov:', filePath);

    const fileRes = await openai.files.create({ file: fs.createReadStream(filePath), purpose: 'assistants' });
    console.log('Soubor nahrán, fileId:', fileRes.id);

    const assistant = await openai.beta.assistants.create({
      name: 'Product Recommendation Assistant',
      description: 'Doporučuje AI nástroje z naší databáze',
      model: 'gpt-4-turbo',
      instructions: 'Asistent pro doporučování AI nástrojů.',
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: { file_ids: [fileRes.id] }
      },
      response_format: { type: 'json_object' }
    });
    console.log('Assistant vytvořen, ID:', assistant.id);

    const metaPath = path.join(process.cwd(), 'data', 'assistant-meta.json');
    fs.writeFileSync(metaPath, JSON.stringify({ assistantId: assistant.id, fileId: fileRes.id }, null, 2), 'utf-8');
    console.log('Metadata uložena do', metaPath);
    console.log('=== INIT ASSISTANT - HOTOVO ===');
  } catch (err) {
    console.error('Chyba při initu asistenta:', err);
    process.exit(1);
  }
})(); 
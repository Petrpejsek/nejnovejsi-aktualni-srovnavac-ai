# Doporučovací systém AI nástrojů

Tento systém doporučuje uživatelům vhodné AI nástroje z databáze na základě jejich dotazu. Systém používá OpenAI API a umí personalizovat doporučení pro konkrétní potřeby uživatele.

## Fungování systému

1. **Export produktů**: Data o produktech se exportují z databáze do JSON souboru.
2. **Nahrání na OpenAI**: JSON soubor se nahraje do OpenAI jako zdroj znalostí.
3. **Vytvoření asistenta**: Vytvoří se asistent s nástrojem `file_search` pro přístup k datům.
4. **Generování doporučení**: Na základě dotazu uživatele asistent vyhledá a doporučí vhodné produkty.
5. **Zpracování odpovědi**: Systém zpracuje JSON odpověď a získá z ní doporučení.

## Řešené problémy

1. **Vymyšlené produkty**: Asistent někdy doporučoval neexistující produkty s ID jako "tool-1", "tool-2". To je nyní vyřešeno:
   - Jasnějšími instrukcemi pro asistenta
   - Dodatečnou validací vracených ID proti seznamu platných ID
   - Příklady skutečných ID v instrukcích

2. **Markdown formátování**: Asistent vracel JSON v Markdown bloku. To je nyní vyřešeno:
   - Nastavením `response_format: { type: "json_object" }` při volání API
   - Instrukcemi k vracení pouze čistého JSON
   - Robustním zpracováním odpovědi, které zvládne i případný Markdown

3. **Problematické JSON**: Některé produkty měly nevalidní JSON struktury. To je nyní vyřešeno:
   - Skriptem pro opravu problematických produktů
   - Bezpečným parsováním a převáděním polí v databázi
   - Speciálním zpracováním známého problematického produktu

4. **Problém se zastaralým typem nástroje**: Používání zastaralého nástroje `retrieval` bylo nahrazeno novým `file_search`.

## Složky a soubory

- `/lib/exportProducts.ts` - Export produktů z databáze do JSON souboru
- `/lib/uploadToOpenAI.ts` - Nahrání souborů do OpenAI a vytvoření asistenta
- `/lib/openai.ts` - Hlavní funkce pro generování doporučení
- `/scripts/fix-products.js` - Skript pro opravu problematických produktů
- `/test-assistant.js` - Testování doporučení pomocí asistenta
- `/refresh-recommendations.js` - Komplexní skript pro aktualizaci celého systému

## Jak použít

### Aktualizace doporučovacího systému

```bash
node refresh-recommendations.js
```

Tento příkaz provede kompletní aktualizaci systému:
1. Opraví problematické produkty v databázi
2. Exportuje produkty do JSON souboru
3. Vytvoří/aktualizuje asistenta s nahraným souborem
4. Otestuje funkčnost doporučení

### Jen otestování doporučení

```bash
node test-assistant.js
```

### Oprava problematických produktů

```bash
node scripts/fix-products.js
```

## Doporučení pro další vývoj

1. **Cachování doporučení**: Implementovat cachování doporučení pro často kladené dotazy
2. **Hodnocení relevance**: Umožnit uživatelům hodnotit relevanci doporučení pro zlepšení systému
3. **Vlastní embeddingy**: Místo použití OpenAI file_search vytvořit vlastní embeddingy pro rychlejší a levnější přístup
4. **A/B testování**: Implementovat A/B testování různých variant instrukcí a promptů

## Důležité poznámky

- Asistent vrací doporučení v angličtině i při dotazu v češtině (podle specifikace)
- Procentuální shody jsou vždy v rozmezí 82-99% (nikdy 100%) pro realistické výsledky
- Systém zvládá zpracovat i odpovědi, které neodpovídají očekávanému formátu (robustní parsování)
- V případě problémů zkontrolujte logy, které obsahují detailní informace o každém kroku 
# AI Srovnávač

Webová aplikace pro srovnávání AI nástrojů a služeb.

## Lokální vývoj

1. Naklonujte repozitář:
```bash
git clone https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai.git
cd nejnovejsi-aktualni-srovnavac-ai
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte `.env` soubor podle `.env.example` a nastavte proměnné prostředí

4. Spusťte vývojový server:
```bash
npm run dev
```

## Produkční nasazení na Vercel

1. Vytvořte účet na [Vercel](https://vercel.com)
2. Propojte váš GitHub repozitář s Vercel
3. Nastavte proměnné prostředí v Vercel dashboardu
4. Nasaďte aplikaci jedním kliknutím

## Technologie

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- SQLite (vývoj) / PostgreSQL (produkce)

## Funkce

- Přehled AI nástrojů a služeb
- Detailní informace o každém nástroji
- Filtrování podle kategorií
- Porovnávání nástrojů
- Admin rozhraní pro správu produktů

## Licence

MIT 
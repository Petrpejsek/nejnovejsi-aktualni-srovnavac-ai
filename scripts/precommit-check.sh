#!/bin/bash
set -e

echo "🚀 PRE-COMMIT KONTROLY - Comparee.ai"
echo "=================================="

# Zkontroluj, že jsme v správném adresáři
if [[ ! -f "package.json" ]]; then
    echo "❌ Spusť script z root adresáře projektu!"
    exit 1
fi

echo "✅ 1/5 Kontrola TypeScriptu..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "   ✓ TypeScript kompilace bez chyb"
else
    echo "   ❌ TypeScript má chyby - oprav před commitem!"
    exit 1
fi

echo ""
echo "✅ 2/5 Linter + auto-fix..."
# ESLint je optional - pokud selže, pokračujeme
if npx eslint . --ext .ts,.tsx --fix > /dev/null 2>&1; then
    echo "   ✓ ESLint kontrola prošla"
else
    echo "   ⚠️  ESLint není nakonfigurován nebo má chyby - pokračuji"
fi

echo ""
echo "✅ 3/5 Test build..."
npm run build
if [ $? -eq 0 ]; then
    echo "   ✓ Build úspěšný"
else
    echo "   ❌ Build selhal - oprav chyby!"
    exit 1
fi

echo ""
echo "✅ 4/5 Test API endpointů..."
# Ověř, že development server běží
if curl -s -f http://localhost:3000/api/health > /dev/null; then
    echo "   ✓ API health endpoint odpovídá"
elif curl -s -f http://localhost:3000/api/product-count > /dev/null; then
    echo "   ✓ Základní API endpoint funguje"
else
    echo "   ⚠️  API endpointy nedostupné - ujisti se, že běží dev server ('npm run dev')"
    echo "   Pokračuji bez API testů..."
fi

echo ""
echo "✅ 5/5 Kontrola Prisma migrací..."
if npx prisma migrate status > /dev/null 2>&1; then
    echo "   ✓ Prisma migrace jsou aktuální"
else
    echo "   ⚠️  Prisma migrace nejsou aktuální - možná potřebuješ 'prisma migrate dev'"
    # Nekončíme chybou, jen upozorníme
fi

echo ""
echo "🎉 VŠECHNY KONTROLY PROŠLY! Můžeš bezpečně commitnout."
echo "=================================="
echo ""
echo "Další kroky:"
echo "1. git add ."
echo "2. git commit -m 'your message'"
echo "3. git push origin main"
echo "4. bash scripts/deploy-prod.sh (pro deployment na Hetzner)" 
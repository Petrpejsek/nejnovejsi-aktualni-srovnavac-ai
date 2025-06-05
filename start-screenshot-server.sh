#!/bin/bash

echo "🚀 Spouštím Screenshot Server..."

# Kontrola že jsme ve správném adresáři
if [ ! -f "screenshot-server.py" ]; then
    echo "❌ Soubor screenshot-server.py nenalezen!"
    echo "Prosím spusťte script z root adresáře projektu."
    exit 1
fi

# Aktivace virtual environment (pokud existuje)
if [ -d "venv" ]; then
    echo "📦 Aktivuji virtual environment..."
    source venv/bin/activate
elif [ -d "venv_new" ]; then
    echo "📦 Aktivuji virtual environment..."
    source venv_new/bin/activate
else
    echo "⚠️ Virtual environment nenalezen, pokračujem s globálním Pythonem..."
fi

# Instalace dependencies
echo "📋 Instaluji závislosti..."
pip install -r requirements-screenshot-server.txt

# Vytvoření screenshots složky
echo "📁 Vytvářím screenshots složku..."
mkdir -p public/screenshots

# Spuštění serveru
echo "🎯 Spouštím Flask server na portu 5000..."
python screenshot-server.py 
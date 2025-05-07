#!/bin/bash

# Skript pro vyčištění nepotřebných admin stránek a API endpointů
echo "Začínám čištění nepotřebných souborů..."

# Odstraňuji alternativní verze admin stránek
echo "Odstraňuji alternativní verze admin stránek..."
rm -rf app/admin/nova-sprava-produktu
rm -rf app/admin/products-fixed
rm -rf app/admin/simple-products
rm -rf app/admin/simple-products-new
rm -rf app/admin/super-simple
rm -rf app/admin/produkty

# Odstraňuji nadbytečné API endpointy
echo "Odstraňuji nadbytečné API endpointy..."
rm -rf app/api/admin-products
rm -rf app/api/simple-products

echo "Čištění dokončeno."
echo "Ponechána pouze hlavní správa produktů v /admin/products a API endpoint v /api/products" 
# Nová registrace firmy

✅ **Úspěšně zaregistrovaná firma pro PPC systém:**

**ID:** `a0aba0b7-863b-4fdb-a1aa-0d3a4102ed68`

Firma se úspěšně zaregistrovala do nového PPC advertiser systému. Data jsou uložena v tabulce `Company`, zatímco admin interface zatím čte z tabulky `CompanyApplications`.

## Jak zkontrolovat:

1. **Databáze:** Přes Prisma Studio na `http://localhost:5555` - tabulka `Company`
2. **API test:** `curl http://localhost:3002/api/admin/advertisers` (vyžaduje admin přihlášení)

## Next steps:
- Upravit admin interface pro zobrazení PPC advertiserů
- Přidat tab "PPC Advertisers" na `/admin/companies` 
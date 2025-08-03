# 🔐 SSH TUNNEL DEPLOYMENT SETUP

## 📝 POTŘEBUJI TYTO ÚDAJE:

### 🌐 SSH Tunel pro Production Server:
- **Jump server (bastion):** `?` 
- **Jump server port:** `?`
- **Jump server user:** `?`
- **Target server:** `23.88.98.49`
- **Target port:** `22` (SSH) nebo `?`
- **Final user:** `comparee`

### 🔧 Typický SSH tunel příkaz by byl:
```bash
# Vytvoření SSH tunelu
ssh -L local_port:23.88.98.49:22 user@jump_server -p jump_port

# Pak připojení přes tunel
ssh comparee@localhost -p local_port
```

### 🚀 Pro automatizovaný deployment script budu potřebovat:
1. **Jump server address:** ?
2. **Jump server port:** ?
3. **Jump server username:** ?
4. **Local port pro tunel:** ? (např. 2222)
5. **SSH key path** (pokud se používá)

---

## 🎯 PO ZÍSKÁNÍ ÚDAJŮ VYTVOŘÍM:
- ✅ SSH tunnel deployment script
- ✅ Automatizovaný production deploy
- ✅ Bezpečné příkazy bez resetování DB

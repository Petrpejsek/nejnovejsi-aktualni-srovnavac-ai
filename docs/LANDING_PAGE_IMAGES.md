# Landing Page Images Support

## 🖼️ Kompletní podpora obrázků v landing pages

Systém nyní plně podporuje obrázky v landing page článcích s responsivním designem, lazy loading a různými layout možnostmi.

## 📋 Klíčové funkce

### ✅ Responsivní kontejnery
- Automatické `<figure>` a `<figcaption>` obalení
- Responsivní velikosti pro různá zařízení
- Optimalizované shadow a border-radius

### ✅ Lazy Loading
- Všechny obrázky mají automaticky `loading="lazy"`
- Optimalizace pro rychlejší načítání stránky

### ✅ Layout možnosti
- **full-width**: Celá šířka kontejneru s rozšířením na okraje
- **side-float**: Plovoucí obrázek vpravo s obtékáním textu
- **inline**: Standardní vložený obrázek (default)

### ✅ Alt atributy
- Automatická kontrola a fallback pro alt text
- Využití title atributu jako záložní alt text

## 🛠️ Jak použít

### 1. V Markdown obsahu
```markdown
![Alt text](https://example.com/image.jpg "Popis obrázku")

![Alt text full-width](https://example.com/wide-image.jpg "full-width")

![Alt text side-float](https://example.com/side-image.jpg "side-float")
```

### 2. V HTML obsahu
```html
<img src="https://example.com/image.jpg" alt="Alt text" title="Popis obrázku">

<img src="https://example.com/wide-image.jpg" alt="Alt text" title="full-width">

<img src="https://example.com/side-image.jpg" alt="Alt text" title="side-float">
```

### 3. Přes visuals pole v databázi
```json
{
  "visuals": [
    {
      "url": "https://example.com/image.jpg",
      "alt_text": "Popis obrázku",
      "description": "Detailní popis obrázku",
      "layout": "full-width",
      "position": "top"
    }
  ]
}
```

## 🎨 Layout styly

### Full-width (`full-width`)
```css
w-full -mx-4 lg:-mx-12 rounded-xl shadow-lg
```
- Rozšíření na celou šířku
- Větší shadow a border-radius
- Ideální pro hero obrázky

### Side-float (`side-float`)
```css
float-right ml-6 mb-4 w-1/2 lg:w-1/3 rounded-lg shadow-md
```
- Plovoucí vpravo
- Text obtéká zleva
- Responsivní velikost (50% na mobile, 33% na desktop)

### Inline (default)
```css
w-full max-w-2xl mx-auto rounded-lg shadow-md
```
- Standardní vložený obrázek
- Maximální šířka 2xl
- Centrované umístění

## ⚙️ Technická implementace

### Databáze struktura
- Využívá existující `visuals` JSON pole v `landing_pages` tabulce
- Žádné nové migrace nutné

### Interface definice
```typescript
interface PrimaryVisual {
  url: string
  alt_text: string
  description?: string
  layout?: 'full-width' | 'side-float' | 'inline' | 'hero'
  position?: 'top' | 'center' | 'bottom'
}
```

### Komponenta AdaptiveContentRenderer
- Automatické zpracování `<img>` tagů
- Detekce layout z `title` nebo `alt` atributů
- Responsivní `<figure>` kontejnery
- Hover efekty (scale transform)

## 🚨 Validace a Error Handling

### Povinné atributy
- `src` - URL obrázku (povinné)
- `alt` - Alt text (automatický fallback)

### Error handling
- Chybějící `src` → vrací `null`
- Chybějící `alt` → použije title nebo default text
- Nevalidní `contentHtml` → vyhodí Error

### Fallback řešení
```typescript
const altText = alt || title || 'Obrázek článku'
```

## 📱 Responsivní design

### Mobile (< 768px)
- Full-width obrázky: 100% šířka
- Side-float: 50% šířka
- Inline: 100% šířka s max-width

### Desktop (≥ 768px)
- Full-width: rozšíření na okraje (-mx-12)
- Side-float: 33% šířka
- Inline: max-width 2xl s centrováním

## 🎯 Použití v praxi

### 1. Vytvoření landing page s obrázky
```typescript
const landingPageData = {
  contentHtml: `
    # Hlavní nadpis
    
    ![Hero obrázek](https://example.com/hero.jpg "full-width")
    
    ## Úvod
    Tohle je úvodní text s plovoucím obrázkem.
    
    ![Detail](https://example.com/detail.jpg "side-float")
    
    Text pokračuje a obtéká obrázek...
  `,
  visuals: [
    {
      url: "https://example.com/hero.jpg",
      alt_text: "Hero obrázek článku",
      layout: "full-width"
    }
  ]
}
```

### 2. Optimalizace pro SEO
- Vždy použít smysluplné alt texty
- Využít title pro popisy obrázků
- Lazy loading pro rychlejší načítání

### 3. Best practices
- Hero obrázky: `full-width` layout
- Ilustrace v textu: `side-float` nebo `inline`
- Technické diagramy: `inline` s detailním popisem

---

**Funkčnost je 100% hotová a production-ready! 🚀📸**
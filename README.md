# 🧪 Randizunk App (QA Edition)

Egy interaktív, szoftvertesztelői (QA) humorral fűszerezett randira hívó webalkalmazás.

## ✨ Funkciók
- **1. Felület (Kérdés)**: Interaktív kérdés konfettivel és mobilon/PC-n is elugró „Nem” gombbal (edge-case üzenetekkel).
- **2. Felület (Randi Konfigurátor)**: JSON-ből (`data/events.json`) dinamikusan betöltődő programopciók, időpont-preferenciák és „Feature Request” megjegyzés mező.
- **3. Felület (Teszt Jegyzőkönyv)**: Formázott QA összefoglaló, egykattintásos vágólapra másolás és opcionális háttér-értesítés (Webhook).

## 🚀 Futtatás helyben
Mivel az alkalmazás `fetch` segítségével tölti be a `data/events.json` fájlt, helyi teszteléshez érdemes egy egyszerű statikus szervert indítani (vagy GitHub Pages-en megnyitni):

```bash
npx serve .
```

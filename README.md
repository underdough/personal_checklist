# 🧾 Personal Checklist

A lightweight and elegant **personal checklist web app** built with **Tailwind CSS** and **Alpine.js**.  
Fully client-side, with **local persistence**, **category filters**, and a **glassmorphism UI**.

##### preview 
(public/src/components/imgs/preview.png)
---

## ✨ Features

- ✅ Add, complete, or delete tasks with ease.
- 🗂️ Create and filter custom categories.
- ⚡ Smart task creation logic:
  - If inside a category → just type and press **Enter**.
  - If on “All” → a **select** appears to choose category.
- 🧹 Confirmation modals for deletion actions.
- 💾 Persistent data using **LocalStorage**.
- 📦 Import and export your tasks as JSON.
- 🎨 Sleek glass UI with an animated background.
- 🧭 Works fully offline (no backend required).

---

## 🧱 Project Structure

```
personal_checklist/
├─ node_modules/
├─ public/
│  └─ css/
│     └─ output.css
├─ src/
│  ├─ components/
│  │  ├─ sweet.css
│  │  └─ userExp.js
│  └─ css/
│     ├─ input.css
│     └─ output.css
├─ .gitignore
├─ index.html
├─ package.json
├─ package-lock.json
├─ postcss.config.js
└─ tailwind.config.js
```

> 💡 `src/` holds development sources, while `public/` contains deploy-ready assets.

---

## ⚙️ Setup and Usage

### 1️⃣ Requirements
- Node.js v18+

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Start development (watch mode)
```bash
npm run dev
```

### 4️⃣ Build for production
```bash
npm run build
```

---

## 🧩 Tailwind Configuration

**`src/css/input.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.js",
    "./src/**/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**`package.json`**
```json
{
  "scripts": {
    "dev": "tailwindcss -i ./src/css/input.css -o ./public/css/output.css --watch",
    "build": "tailwindcss -i ./src/css/input.css -o ./public/css/output.css --minify"
  }
}
```

---

## 🌐 Deploy to GitHub Pages

1. Run:
   ```bash
   npm run build
   ```
2. Commit and push your repository.
3. In GitHub:
   - Go to **Settings → Pages → Deploy from branch → main /root**  
   - Save and wait for GitHub Pages to publish.

Your app will be live at:
```
https://<your-username>.github.io/personal_checklist/
```

---

## 📄 License

Personal and educational use only.  
Feel free to adapt or extend it for your own needs.

---

## 👨‍💻 Author

**Kevin Chen Li**  
Software Analyst and Developer (SENA)  
📍 Colombia  
💡 Focused on simple, functional, and beautiful web tools.

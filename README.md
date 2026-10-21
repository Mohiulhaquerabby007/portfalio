# Mohiul Haque Rabby — Portfolio Website

Personal portfolio website for **Mohiul Haque Rabby**, Software Engineer and Competitive Programmer at JKKNIU.

Based on the interactive, high-performance portfolio architecture with dynamic site-data parsing, interactive achievements medal wall, KPI metrics, dynamic writeup dashboard with Medium/local markdown sync, and light/dark theme support.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

---

## 📝 Editing Site Content (`data.md`)

All portfolio content is driven by **`data.md`**:
- **Profile**: Name, handle, title, bio, contact email, phone, location, university, and social links (GitHub, LinkedIn, LeetCode, CodeChef, TryHackMe, HackerRank, StopStalk, Medium).
- **Hero & Overview**: Big headline name, taglines, CGPA ring, KPI cards.
- **Skills**: Categorized into Languages, Tools, Security, and Operating Systems.
- **Medals**: Highlight wall with gold/silver/teal/indigo podium badges.
- **Contests & Findings**: Chronological log of competitive programming, hackathons, and CTF events with interactive category filters.
- **Appendix**: Certifications, courses, academic timeline, and leadership roles.
- **Projects**: Project cards with tags and direct GitHub repository links.

Simply edit `data.md` and save — Vite reloads automatically in dev mode, and Vercel rebuilds on push.

---

## ✍️ Writing Blog Posts (`posts/`)

You can publish writeups in two ways:
1. **Local Markdown files**: Place any `.md` file inside the `posts/` directory (e.g. `posts/competitive-programming/my-topic.md`). Frontmatter supported:
   ```markdown
   ---
   title: "Your Post Title"
   date: "2024-10-22"
   tags: [c++, algorithms, dp]
   event: "Contest or Topic"
   summary: "Short preview of the article"
   ---
   ```
2. **Medium**: Connect your Medium handle `@mohiulhaquerabby` in `blog.config.json` — any new stories published on Medium are automatically fetched at build time.

---

## ☁️ Deploy to Vercel

1. Initialize git and push this repository to GitHub (`Mohiulhaquerabby007/portfolio`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Mohiul Haque Rabby portfolio"
   git branch -M main
   git remote add origin https://github.com/Mohiulhaquerabby007/portfolio.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) -> **Add New Project** -> Import your repository.
3. Framework preset **Vite** is auto-detected (`npm run build`, output: `dist`).
4. Click **Deploy**!


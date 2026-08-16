# Counsel AI Landing Page

A polished Arabic-first landing page for Counsel AI, a legal intelligence platform designed for lawyers and legal teams.

## Overview

The site presents Counsel AI's document analysis, risk review, legal assistant, security, and workflow capabilities through a responsive editorial-style experience. It includes animated visual sections, responsive navigation, FAQ interactions, product mockups, and a branded Arabic legal identity.

## Tech stack

- React + TypeScript
- Vite
- Lucide React icons
- React Three Fiber and Three.js for 3D product visuals
- IBM Plex Sans Arabic and Playfair Display typography

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/`.

## Production build

```bash
npm run build
npm run preview
```

## Project structure

- `src/App.tsx` — page sections and interactive components
- `src/styles.css` — core layout and visual system
- `src/reference-match.css` — reference-led hero, branding, and responsive refinements
- `src/components/3d/` — Three.js/R3F visual scenes
- `public/` — brand and product image assets

## Notes

The interface is Arabic-first and uses RTL-aware layout patterns. The AI output shown in the experience is illustrative and should be reviewed by a qualified legal professional before use in real legal work.

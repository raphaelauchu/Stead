# Stead

Un système de progression pour devenir l'homme que tu veux être.

Squelette Next.js 14 (App Router) + TypeScript + Tailwind, prêt à déployer sur Vercel.

## Développement local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Déploiement

Connecte ce repo sur [vercel.com](https://vercel.com) — Vercel détecte Next.js automatiquement, aucune config additionnelle requise. Chaque push sur `main` redéploie.

## Structure

- `app/` — pages (App Router)
- `components/` — composants partagés (le logo `InfinityMark` notamment)
- `app/globals.css` — tokens de couleur et polices (Spectral, Manrope, IBM Plex Mono)
- `tailwind.config.ts` — palette de marque (fond, surface, accent doré)

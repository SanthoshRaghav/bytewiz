# Bytewiz — Enterprise Technology Services site

Marketing site for Bytewiz (Home · About · AI Solutions · IT Services · Contact),
built to the approved design with **Vite + semantic HTML5 + modern CSS + vanilla JavaScript**.
No UI frameworks (no React/Vue/Tailwind).

Bytewiz's active public positioning is **AI Solutions & Intelligent Automation** and
**IT Services & Software Development** only.

## Stack & approach

- **Vite** multi-page app — one HTML entry per route.
- **Mobile-first, responsive** at 390 / 768 / 1440 px (breakpoints at `680px` and `1024px`).
- **Design tokens** in [`src/styles/tokens.css`](src/styles/tokens.css); shared components in
  [`src/styles/base.css`](src/styles/base.css); per-page styles in `src/styles/pages/`.
- **Lucide icons** for the generic, repeated UI glyphs (arrow, chevron, menu); bespoke
  illustrations (workflow/intelligence diagrams, meters) and brand glyphs are hand-authored SVG.
- **Accessibility**: real `<button>` / `<a>` / `<label>` + `<input>`, `aria-*` on icon-only
  controls, visible focus rings, and `prefers-reduced-motion` respected throughout.

## Commands

```bash
npm install     # install dependencies
npm run dev      # start the dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Project structure

```
index.html            about.html         ai-solutions.html
it-services.html      contact.html
public/favicon.svg
src/
  styles/
    tokens.css         # design tokens (color, type, shadow, radius, layout)
    base.css           # reset, buttons, header, hero, sections, footer, motion, responsive
    pages/*.css        # page-specific styles
  js/
    main.js            # Lucide icons + mobile-menu enhancements (entry)
    contact.js         # accessible contact-form validation (mockup — does not send)
scripts/
  generate.mjs         # regenerates the pages from the approved design source
```

## Pages

| Route                | Page            |
| -------------------- | --------------- |
| `index.html`         | Homepage        |
| `about.html`         | About Us        |
| `ai-solutions.html`  | AI Solutions    |
| `it-services.html`   | IT Services     |
| `contact.html`       | Contact Us      |

## Notes

- The contact form is a faithful mockup: it validates required fields and shows the approved
  focus / loading / error / success states, but is **not wired to a submission endpoint** — no
  backend or email service is configured, so nothing is transmitted. This matches the approved
  copy; a real integration is a follow-up item.
- The footer uses the current temporary blue-square "B" brand mark (the favicon artwork). The
  Instagram and X icons are non-interactive placeholders pending real, approved profile URLs;
  the email icon is a working `mailto:info@bytewiz.ai` link.
- `Privacy · Terms` in the footer is plain (non-linked) text — those pages do not exist yet and
  are intentionally not presented as working destinations.

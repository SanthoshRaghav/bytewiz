# Bytewiz — Enterprise Technology Services site

Marketing site for Bytewiz (Home · About · AI Solutions · IT Services · BPO · Contact),
built to the approved design with **Vite + semantic HTML5 + modern CSS + vanilla JavaScript**.
No UI frameworks (no React/Vue/Tailwind).

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
it-services.html      bpo-services.html  contact.html
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
| `bpo-services.html`  | BPO Services    |
| `contact.html`       | Contact Us      |

## Notes

- The contact form is a faithful mockup: it validates required fields and shows the approved
  error/success states, but does not transmit anything (matching the approved copy).
- Content placeholders (e.g. `[Approved business email]`, leadership names) are intentional and
  carried over from the approved design, to be filled in once confirmed.

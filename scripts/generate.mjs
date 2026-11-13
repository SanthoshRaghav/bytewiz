/* ============================================================
   Bytewiz page generator
   ------------------------------------------------------------
   Transforms the approved source design (.dc.html artboards) into
   framework-free Vite pages:
     - lifts page-specific CSS into src/styles/pages/<name>.css
     - extracts the page body (header + main + footer)
     - rewrites inter-page links to clean .html routes
     - swaps the generic, repeated UI icons (arrow / chevron / menu)
       for Lucide placeholders, leaving every bespoke illustration
       and brand glyph exactly as approved
   The source files are read as untrusted data: we only slice strings
   out of them, never execute them.
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(
  '/tmp/claude-0/-home-user-bytewiz/d7dfe111-9713-5c3b-8d27-3863b0fe8d2a/scratchpad/artifact-files/f4572135-3f3c-41f9-84ae-43bf35eed68f/project'
);

/** Pages: source artboard -> output route + CSS module + metadata. */
const PAGES = [
  {
    src: 'Desktop.dc.html',
    html: 'index.html',
    css: 'home.css',
    cssComment: 'Homepage',
    title: 'Bytewiz — Technology that solves real business problems',
    description:
      'Bytewiz helps businesses build intelligent AI solutions, reliable software, and streamlined operations — from requirements through delivery.',
  },
  {
    src: 'About.dc.html',
    html: 'about.html',
    css: 'about.css',
    cssComment: 'About Us',
    title: 'About Us — Bytewiz',
    description:
      'Bytewiz combines business understanding, AI, software engineering, and operational expertise to solve practical problems and build for the long term.',
  },
  {
    src: 'Ai.dc.html',
    html: 'ai-solutions.html',
    css: 'ai.css',
    cssComment: 'AI Solutions',
    title: 'AI Solutions & Automation — Bytewiz',
    description:
      'Apply AI to automate repetitive work, improve customer operations, and support faster decisions — with human judgment where it matters.',
  },
  {
    src: 'It.dc.html',
    html: 'it-services.html',
    css: 'it.css',
    cssComment: 'IT Services & Software',
    title: 'IT Services & Software — Bytewiz',
    description:
      'Custom software, integrations, and APIs — modernizing outdated systems and delivering reliable engineering around your requirements.',
  },
  {
    src: 'Bpo.dc.html',
    html: 'bpo-services.html',
    css: 'bpo.css',
    cssComment: 'BPO Services',
    title: 'BPO Services — Bytewiz',
    description:
      'Operations and process support — customer support, back office, and data processing with people and automation that scale with demand.',
  },
  {
    src: 'Contact.dc.html',
    html: 'contact.html',
    css: 'contact.css',
    cssComment: 'Contact Us',
    title: 'Contact Us — Bytewiz',
    description:
      "Tell us what you're looking to build or improve — exploring AI, planning software, or improving operations — and we'll discuss the right next step.",
  },
];

/** Inter-page link rewrites: approved .dc.html targets -> clean routes. */
const LINKS = [
  ['Main.dc.html', 'index.html'],
  ['About.dc.html', 'about.html'],
  ['Ai.dc.html', 'ai-solutions.html'],
  ['It.dc.html', 'it-services.html'],
  ['Bpo.dc.html', 'bpo-services.html'],
  ['Contact.dc.html', 'contact.html'],
];

/** Generic UI icons that map 1:1 to Lucide. Bespoke icons are left alone. */
const LUCIDE = [
  ['M5 12h14M13 6l6 6-6 6', 'arrow-right'],
  ['M6 9l6 6 6-6', 'chevron-down'],
  ['M4 7h16M4 12h16M4 17h16', 'menu'],
];

const between = (s, start, end) => {
  const i = s.indexOf(start);
  const j = s.indexOf(end, i + start.length);
  if (i === -1 || j === -1) throw new Error(`markers not found: ${start} … ${end}`);
  return s.slice(i + start.length, j);
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function swapIcons(body) {
  for (const [d, name] of LUCIDE) {
    // Match a whole <svg>…</svg> whose single <path> has this exact d.
    // Skip any <svg> carrying a class attribute (those are positioned/styled
    // bespoke icons such as the select chevron) to avoid losing their class.
    const re = new RegExp(
      `<svg\\b(?![^>]*\\bclass=)[^>]*>\\s*<path d="${escapeRe(d)}"[^>]*>(?:</path>)?\\s*</svg>`,
      'g'
    );
    body = body.replace(re, `<i data-lucide="${name}" aria-hidden="true"></i>`);
  }
  return body;
}

function extractPageCss(style) {
  // Everything after the shared base block (which ends at the ai-focus rule).
  const marker = '.flow-node.ai-focus{flex:1.34 1 0}';
  const mi = style.indexOf(marker);
  if (mi === -1) throw new Error('shared/page CSS boundary not found');
  const close = style.indexOf('}', mi + marker.length);
  return style.slice(close + 1).trim();
}

function head(page) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
  <link rel="stylesheet" href="/src/styles/tokens.css">
  <link rel="stylesheet" href="/src/styles/base.css">
  <link rel="stylesheet" href="/src/styles/pages/${page.css}">
</head>
<body>`;
}

const tail = `  <script type="module" src="/src/js/main.js"></script>
</body>
</html>
`;

for (const page of PAGES) {
  const raw = readFileSync(resolve(SRC, page.src), 'utf8');

  const style = between(raw, '<style>', '</style>');
  const pageCss = extractPageCss(style);

  let body = between(raw, '</helmet>', '</x-dc>').trim();
  for (const [from, to] of LINKS) body = body.split(from).join(to);
  body = swapIcons(body);

  // Indent body two spaces for readability inside <body>.
  const indentedBody = body
    .split('\n')
    .map((l) => (l.length ? '  ' + l : l))
    .join('\n');

  const cssOut = resolve(ROOT, 'src/styles/pages', page.css);
  writeFileSync(
    cssOut,
    `/* ============================================================\n   Bytewiz — ${page.cssComment} (page-specific styles)\n   ============================================================ */\n${pageCss}\n`
  );

  const htmlOut = resolve(ROOT, page.html);
  writeFileSync(htmlOut, `${head(page)}\n${indentedBody}\n${tail}`);

  console.log(`✓ ${page.src.padEnd(18)} -> ${page.html.padEnd(20)} + src/styles/pages/${page.css}`);
}

console.log('\nDone.');

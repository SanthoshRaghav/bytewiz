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
  '/tmp/claude-0/-home-user-bytewiz/8c3b443a-5216-5187-8f87-6f9680cbbee6/scratchpad/design/project'
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
  ['Contact.dc.html', 'contact.html'],
];

/** Footer brand symbol: normalize to the EXACT favicon artwork (public/favicon.svg)
   so the temporary footer "B" mark matches the favicon pixel-for-pixel — same
   corner radius, glyph size/baseline, and accent dot — rather than a near copy. */
const FOOT_MARK_FROM =
  '<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1D4ED8"/><text x="16" y="23" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="21" fill="#ffffff">B</text><circle cx="25" cy="23" r="2.6" fill="#0FB5A4"/></svg>';
const FOOT_MARK_TO =
  '<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1D4ED8"/><text x="50%" y="51%" dominant-baseline="central" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="800" fill="#fff">B</text><circle cx="25.5" cy="22.5" r="2.4" fill="#0FB5A4"/></svg>';

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

/** Assert-and-replace: throws if the needle is absent, so a design re-sync
   fails loudly instead of silently restoring removed placeholders. */
function mustReplace(s, from, to) {
  if (!s.includes(from)) {
    throw new Error(`contact-direct rewrite: expected markup not found:\n${from.slice(0, 80)}…`);
  }
  return s.split(from).join(to);
}

/** Contact page "Prefer to reach us directly?" card: the approved mockup keeps
   labelled email/phone/office/hours placeholders, but the live site shows only
   the real, clickable email. Strip the phone, office and hours rows, swap the
   intro copy, and make the email a working mailto. (CSS cleanup in the loop.) */
function rewriteContactDirect(body) {
  body = mustReplace(
    body,
    "<p class=\"ci-intro\">Approved contact details will appear here. They're shown as placeholders until confirmed.</p>",
    '<p class="ci-intro">Have a question or prefer email? Reach out to us directly.</p>'
  );
  body = mustReplace(
    body,
    '<div class="rv">[Approved business email]</div>',
    '<div class="rv"><a href="mailto:info@bytewiz.ai">info@bytewiz.ai</a></div>'
  );
  body = mustReplace(
    body,
    '\n        <div class="row">\n          <span class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l1 5-2 1a12 12 0 006 6l1-2 5 1v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg></span>\n          <div><div class="rk">Phone</div><div class="rv">[Approved phone number]</div></div>\n        </div>',
    ''
  );
  body = mustReplace(
    body,
    '\n        <div class="row">\n          <span class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-5.6-7-11a7 7 0 0114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span>\n          <div><div class="rk">Office</div><div class="rv">[Office address — if applicable]</div></div>\n        </div>',
    ''
  );
  body = mustReplace(
    body,
    "\n        <p class=\"ph-note\">Business hours and location will be added here once verified. We haven't published these details yet, so none are shown.</p>",
    ''
  );
  return body;
}

/** Contact page CSS: drop the placeholder-note rule and give the email link a
   subtle, on-brand hover affordance while keeping the card's existing look. */
function rewriteContactCss(css) {
  css = mustReplace(
    css,
    '.cinfo .rv{font-size:14.5px;color:var(--ink);font-weight:500}',
    '.cinfo .rv{font-size:14.5px;color:var(--ink);font-weight:500}\n.cinfo .rv a{color:inherit;text-decoration:none}\n.cinfo .rv a:hover{color:var(--brand);text-decoration:underline}'
  );
  css = mustReplace(
    css,
    '\n.cinfo .ph-note{font-size:12px;color:var(--muted-2);margin-top:16px;padding-top:14px;border-top:1px dashed var(--border-2);line-height:1.5}',
    ''
  );
  return css;
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
  let pageCss = extractPageCss(style);

  let body = between(raw, '</helmet>', '</x-dc>').trim();
  for (const [from, to] of LINKS) body = body.split(from).join(to);
  body = body.split(FOOT_MARK_FROM).join(FOOT_MARK_TO);
  if (page.html === 'contact.html') {
    body = rewriteContactDirect(body);
    pageCss = rewriteContactCss(pageCss);
  }
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

/* ============================================================
   Bytewiz — site entry
   Renders the generic Lucide icons used across the UI and wires
   up small progressive enhancements. Everything degrades: with no
   JS the pages still render and the <details> mobile menu works.
   ============================================================ */
import { createIcons, ArrowRight, ChevronDown, Menu } from 'lucide';
import { initContactForm } from './contact.js';

// Only the handful of generic icons the generator swapped to
// data-lucide placeholders. Bespoke/brand SVGs stay inline.
createIcons({
  icons: { ArrowRight, ChevronDown, Menu },
  attrs: { 'stroke-width': 2 },
});

// Close the mobile <details> menu after following an in-page link,
// and on Escape, so it never lingers open over content.
const mnav = document.querySelector('details.mnav');
if (mnav) {
  mnav.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) mnav.open = false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mnav.open) mnav.open = false;
  });
}

// Contact page form (no-op elsewhere).
initContactForm();

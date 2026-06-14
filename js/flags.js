/* ───────────────────────────────────────────────
   BlueWelcome — Bandiere SVG inline
   Le emoji-bandiera (🇬🇧 ecc.) non si vedono su Windows/alcuni browser.
   Qui ci sono bandiere SVG semplici che funzionano ovunque.
   flagSVG('en') → stringa SVG (20x14) pronta da inserire.
─────────────────────────────────────────────── */

function flagSVG(code) {
  const w = 20, h = 14;
  const open = `<svg class="flag-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 0 0 1px rgba(0,0,0,.08)">`;
  let inner = '';
  switch (code) {
    case 'en': // Union Jack semplificata
      inner = `
        <rect width="20" height="14" fill="#012169"/>
        <path d="M0,0 L20,14 M20,0 L0,14" stroke="#fff" stroke-width="2.5"/>
        <path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" stroke-width="1.2"/>
        <rect x="8" width="4" height="14" fill="#fff"/>
        <rect y="5" width="20" height="4" fill="#fff"/>
        <rect x="8.8" width="2.4" height="14" fill="#C8102E"/>
        <rect y="5.8" width="20" height="2.4" fill="#C8102E"/>`;
      break;
    case 'it': // tricolore verticale verde-bianco-rosso
      inner = `
        <rect width="6.67" height="14" fill="#009246"/>
        <rect x="6.67" width="6.67" height="14" fill="#fff"/>
        <rect x="13.34" width="6.66" height="14" fill="#CE2B37"/>`;
      break;
    case 'de': // tricolore orizzontale nero-rosso-oro
      inner = `
        <rect width="20" height="4.67" fill="#000"/>
        <rect y="4.67" width="20" height="4.67" fill="#DD0000"/>
        <rect y="9.34" width="20" height="4.66" fill="#FFCE00"/>`;
      break;
    case 'el': // Grecia: righe blu/bianche + cantone blu con croce
      inner = `
        <rect width="20" height="14" fill="#0D5EAF"/>
        <rect y="1.56" width="20" height="1.56" fill="#fff"/>
        <rect y="4.67" width="20" height="1.56" fill="#fff"/>
        <rect y="7.78" width="20" height="1.56" fill="#fff"/>
        <rect y="10.89" width="20" height="1.56" fill="#fff"/>
        <rect width="7.78" height="7.78" fill="#0D5EAF"/>
        <rect x="3.11" width="1.56" height="7.78" fill="#fff"/>
        <rect y="3.11" width="7.78" height="1.56" fill="#fff"/>`;
      break;
    default:
      inner = `<rect width="20" height="14" fill="#cbd5e1"/>`;
  }
  return open + inner + '</svg>';
}

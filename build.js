// Renders /privacy/ and /terms/ from the policy Markdown, the single source
// shared with the Word copies and the OAuth packet:
//
//   node build.js
//
// Source: ../sheets-addon-lite/verification/PRIVACY_POLICY.md and
// TERMS_OF_SERVICE.md, read through that folder's legal-md.js. The homepage
// (index.html) is hand-built and not touched here.

const fs = require('fs');
const path = require('path');
const VERIFICATION = path.join(__dirname, '..', 'sheets-addon-lite', 'verification');
const { parseLegal } = require(path.join(VERIFICATION, 'legal-md'));

const PAGES = [
  { slug: 'privacy', file: 'PRIVACY_POLICY.md', heading: 'Privacy Policy',
    blurb: 'How GW Cadet and gwcadet.com handle information.' },
  { slug: 'terms', file: 'TERMS_OF_SERVICE.md', heading: 'Terms of Service',
    blurb: 'The agreement for using GW Cadet.' },
  { slug: 'support', file: 'SUPPORT.md', heading: 'Support',
    blurb: 'How to reach us and answers to common questions.' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const runs = (rs) => rs.map((r) => {
  let h = esc(r.text).replace(/\n/g, '<br>');
  if (r.bold) h = '<strong>' + h + '</strong>';
  if (r.link) h = '<a href="' + esc(r.link) + '">' + h + '</a>';
  return h;
}).join('');

const tab = (href, label, current) =>
  `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a></li>`;

function render({ slug, file, heading, blurb }) {
  const { blocks } = parseLegal(file); // legal-md reads from its own folder
  const body = blocks.map((b) => {
    if (b.type === 'h2') return '<h2>' + runs(b.runs) + '</h2>';
    if (b.type === 'p') return '<p>' + runs(b.runs) + '</p>';
    return '<' + b.type + '>' + b.items.map((i) => '<li>' + runs(i) + '</li>').join('') + '</' + b.type + '>';
  }).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GW Cadet ${heading}</title>
<meta name="description" content="${heading} for GW Cadet, a Google Sheets add-on for Google Workspace administrators, by WolfLoop Technology.">
<link rel="canonical" href="https://www.gwcadet.com/${slug}/">
<meta name="theme-color" content="#dec492">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=20261024">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-nav">
  <div class="wrap">
    <a class="brand" href="/"><img src="/img/cadet-badge.webp" width="52" height="52" alt="">GW Cadet</a>
    <nav aria-label="Site">
      <ul class="nav-links">
        <li><a href="/#how">How it works</a></li>
        ${tab('/privacy/', 'Privacy', slug === 'privacy')}
        ${tab('/terms/', 'Terms', slug === 'terms')}
        ${tab('/support/', 'Support', slug === 'support')}
        <li class="cta"><a class="btn small" href="https://workspace.google.com/marketplace/app/gw_cadet/72688054574">Install</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="main">
  <div class="legal-head">
    <div class="wrap">
      <h1>${heading}</h1>
      <p>${blurb}</p>
    </div>
  </div>
  <div class="legal-body">
    <div class="wrap">
      <article>
${body}
      </article>
    </div>
  </div>
</main>
<footer class="foot">
  <div class="wrap">
    <p>GW Cadet is made by WolfLoop Technology, Nova Scotia, Canada. It is not made or endorsed by Google.</p>
    <nav aria-label="Footer"><a href="/">Home</a><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Service</a><a href="/support/">Support</a><a href="mailto:admin@gwcadet.com">admin@gwcadet.com</a></nav>
  </div>
</footer>
</body>
</html>
`;
}

for (const p of PAGES) {
  const dir = path.join(__dirname, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(p));
  console.log('wrote ' + p.slug + '/index.html');
}

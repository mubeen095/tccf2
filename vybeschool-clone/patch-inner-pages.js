const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'www.vybeschool.com');
const dirs = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'assets')
  .map(d => d.name);

const globalResetCSS = `      /* ── GLOBAL RESET ── */
      *, *::before, *::after { box-sizing: border-box; }
      html {
        margin: 0; padding: 0;
        width: 100%; max-width: 100%;
        background: #050505;
      }
      body {
        margin: 0; padding: 0;
        width: 100%; max-width: 100%;
        background: #050505;
      }
      #root {
        width: 100%; max-width: 100%;
        overflow-x: hidden;
        position: relative;
      }

`;

let fixed = 0;
for (const dir of dirs) {
  const fp = path.join(root, dir, 'index.html');
  if (!fs.existsSync(fp)) continue;

  let html = fs.readFileSync(fp, 'utf8');

  // 1. Fix: remove </style> that closes too early (before orphaned CSS)
  //    Pattern: the style block ends with </style> but there's more CSS after it.
  //    We remove the premature </style> so all CSS is in one block.
  //    The orphaned CSS starts with "/* ── Hide hero background videos ── */"
  //    and ends at the next <script> tag or </style>.
  
  // Remove premature </style> that is followed by orphaned CSS
  html = html.replace(
    /(\s*)(<\/style>)\s*\n\s*\/\* ── Hide hero background videos ── \*\//,
    '\n      /* ── Hide hero background videos ── */'
  );

  // 2. Add global reset after the opening <style> tag
  //    Find the first <style> tag and add reset after it
  html = html.replace(
    /(<style>)\s*\n/,
    '$1\n' + globalResetCSS
  );

  // 3. Fix .orb-bg: position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
  html = html.replace(
    /\.orb-bg \{\s*position:\s*fixed;\s*top:\s*-50%;\s*left:\s*-50%;\s*width:\s*200%;\s*height:\s*200%;/g,
    '.orb-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden;'
  );

  // 4. Fix .orb-parallax same way
  html = html.replace(
    /\.orb-parallax \{\s*position:\s*fixed;\s*top:\s*-50%;\s*left:\s*-50%;\s*width:\s*200%;\s*height:\s*200%;/g,
    '.orb-parallax { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden;'
  );

  // 5. Fix .domain-hero-glow: add overflow: hidden
  html = html.replace(
    /\.domain-hero-glow \{\s*position:\s*relative;\s*\}/g,
    '.domain-hero-glow { position: relative; overflow: hidden; }'
  );

  // 6. Remove overflow-x: hidden from html, body rules
  //    Pattern: html, body { overflow-x: hidden; width: 100%; }
  html = html.replace(
    /html,\s*body\s*\{\s*overflow-x:\s*hidden;\s*width:\s*100%;\s*\}/g,
    'html, body { width: 100%; }'
  );
  //    Also handle: html { overflow-x: hidden; ... } body { overflow-x: hidden; ... }
  html = html.replace(
    /(html\s*\{[^}]*?)overflow-x:\s*hidden;\s*/g,
    '$1'
  );
  html = html.replace(
    /(body\s*\{[^}]*?)overflow-x:\s*hidden;\s*/g,
    '$1'
  );

  // 7. Ensure the style block is properly closed before <script type="application/ld+json">
  //    If there's no </style> before the ld+json script, add one
  html = html.replace(
    /(\s*\/\* ── Respect user motion preferences ── \*\/[\s\S]*?\})\s*\n\s*<script type="application\/ld\+json">/,
    '$1\n    </style>\n    <script type="application/ld+json">'
  );

  fs.writeFileSync(fp, html, 'utf8');
  fixed++;
  console.log(`✅ ${dir}/index.html`);
}

console.log(`\n✅ Fixed ${fixed} pages`);

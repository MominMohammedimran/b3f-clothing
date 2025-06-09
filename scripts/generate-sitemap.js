import fs from 'fs';
import path from 'path';

const baseUrl = 'https://b3f-prints.pages.dev';

// Define your URLs here (you can extend this later to pull from your routes or database)
const urls = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/design-tool', changefreq: 'monthly', priority: 0.9 },
  { loc: '/about-us', changefreq: 'monthly', priority: 0.6 },
  { loc: '/contact-us', changefreq: 'monthly', priority: 0.6 },
];

function generateSitemap() {
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const footer = `</urlset>`;

  const body = urls.map(({ loc, changefreq, priority }) => {
    const lastmod = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    return `  <url>
    <loc>${baseUrl}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return header + body + '\n' + footer;
}

function writeSitemap() {
  const sitemap = generateSitemap();
  const publicDir = path.resolve(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  // Make sure public folder exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
 }

writeSitemap();

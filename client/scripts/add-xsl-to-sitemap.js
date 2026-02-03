import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapPath = path.resolve(__dirname, '../dist/sitemap.xml');

if (fs.existsSync(sitemapPath)) {
    let content = fs.readFileSync(sitemapPath, 'utf8');
    if (!content.includes('<?xml-stylesheet')) {
        // Insert stylesheet processing instruction after the XML declaration
        content = content.replace(
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'
        );
        fs.writeFileSync(sitemapPath, content);
        console.log('Successfully added XSL stylesheet reference to sitemap.xml');
    } else {
        console.log('sitemap.xml already contains a stylesheet reference');
    }
} else {
    console.warn('Warning: sitemap.xml not found in dist directory. Make sure to run this script after the build completes.');
}

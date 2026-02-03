
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 1440, height: 900 };
const OUTPUT_DIR = path.join(__dirname, '../client/public');

const CREDENTIALS = {
  email: 'test@test.com',
  password: 'User@1234'
};

const ROUTES = [
  { path: '/job-tracker', output: 'job-tracker-preview.png', delay: 3000 },
  { path: '/notes', output: 'notes-preview.png', delay: 2000 },
  { path: '/bookmarks', output: 'bookmarks-preview.png', delay: 2000 },
  { path: '/text-templates', output: 'text-templates-preview.png', delay: 8000 },
];

const wrapInBrowserFrame = async (page, imgBuffer) => {
  const imgBase64 = imgBuffer.toString('base64');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: transparent; }
        .container {
          background-color: #e2e2e2; /* Light grey background like Screely/Mockups */
          padding: 60px 80px;
          display: inline-block;
        }
        .window {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          background: white;
        }
        .title-bar {
          background: #ffffff;
          padding: 16px 20px;
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .red { background: #ff5f56; box-shadow: 0 0 0 1px #e1423c inset; }
        .yellow { background: #ffbd2e; box-shadow: 0 0 0 1px #dfa123 inset; }
        .green { background: #27c93f; box-shadow: 0 0 0 1px #1dad2b inset; }
        img {
          display: block;
          width: 1440px; /* Match viewport width */
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="window">
          <div class="title-bar">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
          <img src="data:image/png;base64,${imgBase64}" />
        </div>
      </div>
    </body>
    </html>
    `;

  // Open a new page to render the frame
  const framePage = await page.browser().newPage();
  await framePage.setContent(html);
  const element = await framePage.$('.container');
  const screenshot = await element.screenshot();
  await framePage.close();
  return screenshot;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setViewport(VIEWPORT);

  // Force Light Mode
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  console.log('Logging in...');
  await page.goto(`${BASE_URL}/auth`);

  // Also ensure localStorage says light mode
  await page.evaluate(() => {
    localStorage.setItem('chakra-ui-color-mode', 'light');
  });

  // Wait for login form
  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', CREDENTIALS.email);
  await page.type('input[name="password"]', CREDENTIALS.password);

  await page.keyboard.press('Enter');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Login successful');

  for (const route of ROUTES) {
    console.log(`Navigating to ${route.path}...`);

    // Force light mode again just in case
    await page.evaluate(() => {
      localStorage.setItem('chakra-ui-color-mode', 'light');
    });

    if (route.path === '/text-templates') {
      // Navigate to list first
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0' });

      // Try to find the "Use" button (card link)
      try {
        await page.waitForSelector('a[href^="/text-templates/"]', { timeout: 5000 });
        const links = await page.$$('a[href^="/text-templates/"]');
        let clicked = false;
        for (const link of links) {
          const href = await page.evaluate(el => el.getAttribute('href'), link);
          if (!href.includes('update') && !href.includes('create')) {
            console.log(`Clicking template link: ${href}`);
            await link.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            clicked = true;
            break;
          }
        }
        if (!clicked) console.log("No suitable template link found.");
      } catch (e) {
        console.log("Could not navigate to template detail.", e.message);
      }
    } else {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0' });
    }

    // Optional delay for animations/loading
    if (route.delay) await new Promise(r => setTimeout(r, route.delay));

    // Capture raw screenshot
    const rawScreenshot = await page.screenshot({ fullPage: false });

    // Wrap in frame
    console.log(`Framing ${route.output}...`);
    const framedScreenshot = await wrapInBrowserFrame(page, rawScreenshot);

    const outputPath = path.join(OUTPUT_DIR, route.output);
    fs.writeFileSync(outputPath, framedScreenshot);
    console.log(`Saved screenshot to ${route.output}`);
  }

  await browser.close();
  console.log('All screenshots captured!');
})();

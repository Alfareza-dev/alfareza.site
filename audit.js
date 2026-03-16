const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'Mobile_iPhone13', width: 390, height: 844, isMobile: true },
  { name: 'Tablet_iPadAir', width: 820, height: 1180, isMobile: true },
  { name: 'Desktop_Large', width: 1440, height: 900, isMobile: false }
];

const TARGET_ROUTES = [
  '/admin',
  '/admin/messages',
  '/admin/security',
  '/banned'
];

async function runAudit() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Testing authentication...');
  
  // Login Flow
  await page.goto(`${BASE_URL}/auth`);
  await page.type('#email', 'alfareza.dev@gmail.com');
  await page.type('#password', 'Alfa_reza_512');
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  
  console.log('Authenticated successfully.');
  
  const report = [];

  for (const viewport of VIEWPORTS) {
    console.log(`\n=== Testing Viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
    await page.setViewport(viewport);
    
    for (const route of TARGET_ROUTES) {
      console.log(`Checking route: ${route}`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle2' });
      
      // Allow dynamic rendering (like RadarScan)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const metrics = await page.evaluate(() => {
        // Find elements breaking layout width
        const documentWidth = document.documentElement.clientWidth;
        const bodyWidth = document.body.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        
        let overflowIssues = 0;
        let overlappingElements = 0;
        
        // Check structural overflow
        if (scrollWidth > documentWidth) {
          overflowIssues++;
        }
        
        // Extremely crude overlap check (looking for intersecting rects on critical buttons)
        const buttons = Array.from(document.querySelectorAll('a, button'));
        for (let i = 0; i < buttons.length; i++) {
          for (let j = i + 1; j < buttons.length; j++) {
            const rect1 = buttons[i].getBoundingClientRect();
            const rect2 = buttons[j].getBoundingClientRect();
            
            // If they overlap physically
            if (!(rect1.right < rect2.left || 
                  rect1.left > rect2.right || 
                  rect1.bottom < rect2.top || 
                  rect1.top > rect2.bottom) &&
                rect1.width > 0 && rect2.width > 0) {
              
              // Only count if it's significant overlap and they aren't parents/children
              if (!buttons[i].contains(buttons[j]) && !buttons[j].contains(buttons[i])) {
                  overlappingElements++;
              }
            }
          }
        }
        
        return {
          documentWidth,
          scrollWidth,
          horizontalOverflow: scrollWidth > documentWidth,
          overlappingClickables: overlappingElements
        };
      });
      
      console.log(`  -> Overflow detected: ${metrics.horizontalOverflow ? 'YES' : 'NO'} (Scroll: ${metrics.scrollWidth}px vs viewport: ${metrics.documentWidth}px)`);
      if (metrics.overlappingClickables > 0) {
        console.log(`  -> Warning: ${metrics.overlappingClickables} interactive elements may be overlapping.`);
      }
      
      report.push({
        viewport: viewport.name,
        route: route,
        passed: !metrics.horizontalOverflow && metrics.overlappingClickables === 0,
        metrics: metrics
      });
    }
  }

  await browser.close();
  
  console.log('\n=== FINAL AUDIT REPORT ===');
  const failures = report.filter(r => !r.passed);
  if (failures.length === 0) {
    console.log('✅ ALL TESTS PASSED. NO OVERFLOW DETECTED.');
  } else {
    console.log(`❌ ${failures.length} TESTS FAILED.`);
    console.log(failures);
  }
}

runAudit().catch(console.error);

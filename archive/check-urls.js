const fs = require('fs');
const path = require('path');

// Extract all URLs from Sidebar.tsx
const sidebarPath = 'd:\\KreupAI\\ManufacturingOS-1\\b3-erp\\frontend\\src\\components\\Sidebar.tsx';
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

const urlRegex = /href: '(\/[^'?]+)/g;
const urls = [];
let match;

while ((match = urlRegex.exec(sidebarContent)) !== null) {
  const url = match[1];
  if (url !== '/#' && !urls.includes(url)) {
    urls.push(url);
  }
}

// Function to check if a page file exists
function checkPageExists(url) {
  const appDir = 'd:\\KreupAI\\ManufacturingOS-1\\b3-erp\\frontend\\src\\app';

  // Remove leading slash
  const cleanUrl = url.substring(1);

  // Try different possible paths
  const possiblePaths = [
    path.join(appDir, '(modules)', cleanUrl, 'page.tsx'),
    path.join(appDir, '(dashboard)', cleanUrl, 'page.tsx'),
    path.join(appDir, cleanUrl, 'page.tsx'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return { exists: true, path: filePath };
    }
  }

  return { exists: false, path: null };
}

// Check all URLs
const missing = [];
const exists = [];

console.log('Checking', urls.length, 'URLs from sidebar...\n');

urls.forEach(url => {
  const result = checkPageExists(url);
  if (result.exists) {
    exists.push({ url, path: result.path });
  } else {
    missing.push(url);
  }
});

// Output results
console.log('========================================');
console.log('MISSING PAGES (404 errors):');
console.log('========================================');
missing.sort().forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log('\n========================================');
console.log(`SUMMARY:`);
console.log('========================================');
console.log(`Total URLs: ${urls.length}`);
console.log(`Existing pages: ${exists.length}`);
console.log(`Missing pages (404): ${missing.length}`);
console.log(`Completion: ${((exists.length / urls.length) * 100).toFixed(1)}%`);

// Save to file
const output = {
  timestamp: new Date().toISOString(),
  summary: {
    total: urls.length,
    existing: exists.length,
    missing: missing.length,
    completionPercentage: ((exists.length / urls.length) * 100).toFixed(1)
  },
  missingUrls: missing.sort(),
  existingPages: exists.sort((a, b) => a.url.localeCompare(b.url))
};

fs.writeFileSync(
  'd:\\KreupAI\\ManufacturingOS-1\\404-audit-report.json',
  JSON.stringify(output, null, 2)
);

console.log('\nReport saved to: 404-audit-report.json');

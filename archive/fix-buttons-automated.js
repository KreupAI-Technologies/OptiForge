/**
 * Automated Button Content Fixer
 *
 * This script reads the BUTTON_IMPLEMENTATION_GUIDE.csv and automatically
 * adds aria-label and title attributes to buttons based on the CSV data.
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_FILE = './BUTTON_IMPLEMENTATION_GUIDE.csv';
const DRY_RUN = process.argv.includes('--dry-run');
const MODULE_FILTER = process.argv.find(arg => arg.startsWith('--module='))?.split('=')[1];

let fixedCount = 0;
let errorCount = 0;
const errors = [];

// Icon to label mapping
const iconMapping = {
  'Eye': 'View',
  'Edit': 'Edit',
  'Edit2': 'Edit',
  'Edit3': 'Edit',
  'Trash2': 'Delete',
  'Download': 'Download',
  'Copy': 'Copy',
  'Send': 'Send',
  'Plus': 'Add',
  'PlusCircle': 'Add New',
  'Check': 'Approve',
  'CheckCircle': 'Confirm',
  'X': 'Cancel',
  'XCircle': 'Close',
  'ChevronLeft': 'Previous',
  'ChevronRight': 'Next',
  'ArrowLeft': 'Back',
  'Home': 'Home',
  'Mail': 'Email',
  'Phone': 'Call',
  'MessageSquare': 'Message',
  'Bell': 'Notifications',
  'Settings': 'Settings',
  'Cog': 'Settings',
  'Filter': 'Filter',
  'RefreshCw': 'Refresh',
  'Search': 'Search',
  'Print': 'Print',
  'Upload': 'Upload',
  'MoreVertical': 'More Options',
  'MoreHorizontal': 'More Options',
  'Play': 'Play',
  'Pause': 'Pause',
  'ZoomIn': 'Zoom In',
  'ZoomOut': 'Zoom Out',
  'BarChart3': 'View Analytics',
  'TrendingUp': 'View Trends',
  'FileText': 'View Document',
  'UserPlus': 'Add User',
  'Heart': 'Favorite',
  'Share': 'Share',
  'Share2': 'Share',
  'ThumbsUp': 'Approve',
  'Truck': 'Track Shipment',
  'Award': 'View Awards',
  'History': 'View History',
  'ExternalLink': 'Open External',
  'Undo2': 'Undo',
  'User': 'Profile',
  'UserMinus': 'Remove User',
  'LogOut': 'Log Out',
  'HelpCircle': 'Help',
  'AlertTriangle': 'Warning',
};

function fixButton(filePath, lineNumber, iconType, suggestedText) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    errors.push(`File not found: ${filePath}`);
    errorCount++;
    return false;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    // Find the button around the line number (±5 lines tolerance)
    let buttonStartLine = -1;
    let buttonEndLine = -1;
    let foundIcon = false;

    for (let i = Math.max(0, lineNumber - 10); i < Math.min(lines.length, lineNumber + 10); i++) {
      const line = lines[i];

      // Check if this line contains the icon
      if (line.includes(`<${iconType} `)) {
        foundIcon = true;

        // Search backwards for button opening
        for (let j = i; j >= Math.max(0, i - 15); j--) {
          if (lines[j].includes('<button') && !lines[j].includes('aria-label')) {
            buttonStartLine = j;
            break;
          }
        }

        // Search forwards for button closing
        for (let j = i; j < Math.min(lines.length, i + 10); j++) {
          if (lines[j].includes('</button>')) {
            buttonEndLine = j;
            break;
          }
        }

        break;
      }
    }

    if (!foundIcon || buttonStartLine === -1) {
      errors.push(`Could not find button with ${iconType} icon near line ${lineNumber} in ${filePath}`);
      errorCount++;
      return false;
    }

    // Check if already has aria-label
    const buttonLines = lines.slice(buttonStartLine, buttonEndLine + 1).join('\n');
    if (buttonLines.includes('aria-label')) {
      console.log(`✓ Already fixed: ${filePath}:${lineNumber} (${iconType})`);
      return true;
    }

    // Find the end of the opening button tag
    let buttonOpeningEnd = buttonStartLine;
    for (let i = buttonStartLine; i <= buttonEndLine; i++) {
      if (lines[i].includes('>')) {
        buttonOpeningEnd = i;
        break;
      }
    }

    // Add aria-label and title to the button
    const label = suggestedText || iconMapping[iconType] || iconType;

    // Find where to insert the attributes (before the closing >)
    const openingLine = lines[buttonOpeningEnd];
    const insertPosition = openingLine.lastIndexOf('>');

    if (insertPosition === -1) {
      errors.push(`Could not find insertion point in ${filePath}:${lineNumber}`);
      errorCount++;
      return false;
    }

    // Insert aria-label and title
    const beforeClosing = openingLine.substring(0, insertPosition);
    const afterClosing = openingLine.substring(insertPosition);

    // Determine indentation
    const indentMatch = lines[buttonOpeningEnd].match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    // Check if we need to add newline or inline
    if (beforeClosing.trim().endsWith('"')) {
      // Multi-line button, add attributes on new lines
      lines[buttonOpeningEnd] = `${beforeClosing}\n${indent}  aria-label="${label}"\n${indent}  title="${label}"\n${indent}${afterClosing}`;
    } else {
      // Inline button, add inline
      lines[buttonOpeningEnd] = `${beforeClosing} aria-label="${label}" title="${label}"${afterClosing}`;
    }

    if (!DRY_RUN) {
      fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
    }

    fixedCount++;
    console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}✓ Fixed: ${filePath}:${lineNumber} (${iconType} → "${label}")`);
    return true;

  } catch (error) {
    errors.push(`Error processing ${filePath}:${lineNumber} - ${error.message}`);
    errorCount++;
    return false;
  }
}

// Read CSV and process
const buttons = [];

fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    // Filter by module if specified
    if (MODULE_FILTER && row.Module !== MODULE_FILTER) {
      return;
    }

    buttons.push({
      module: row.Module,
      filePath: row['File Path'],
      lineNumber: parseInt(row['Line Number']),
      iconType: row['Icon Type'],
      suggestedText: row['Suggested Button Text']
    });
  })
  .on('end', () => {
    console.log(`\n🔧 Button Content Fixer ${DRY_RUN ? '(DRY RUN)' : ''}\n`);
    console.log(`📊 Found ${buttons.length} buttons to fix${MODULE_FILTER ? ` in module: ${MODULE_FILTER}` : ''}\n`);

    // Process each button
    buttons.forEach((button, index) => {
      console.log(`\n[${index + 1}/${buttons.length}] Processing ${button.filePath}:${button.lineNumber}...`);
      fixButton(button.filePath, button.lineNumber, button.iconType, button.suggestedText);
    });

    // Summary
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✓ Fixed: ${fixedCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log(`${DRY_RUN ? '\n⚠️  This was a DRY RUN - no files were modified' : '\n✅ Files have been updated'}`);

    if (errors.length > 0) {
      console.log(`\n\n❌ ERRORS:\n`);
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    console.log(`\n${'='.repeat(60)}\n`);
  });

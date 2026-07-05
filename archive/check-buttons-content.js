#!/usr/bin/env node
/*
  Button/Link content audit script
  - Scans directories for clickable elements (<button>, <a>, <Link>, role="button", <Button>, <IconButton>)
  - Flags items missing visible text or an accessible name (aria-label/title/label)
  - Writes a markdown report 'BUTTONS_CONTENT_AUDIT.md' at repo root
*/

const fs = require('fs');
const path = require('path');

// Config
const DEFAULT_SCAN_DIRS = [
  'b3-erp/frontend/src',
  'b3-erp/frontend/components',
  'b3-erp/frontend/app',
].filter(Boolean);

const INCLUDE_EXT = new Set(['.tsx', '.jsx', '.ts', '.js']);
const REPORT_FILENAME = 'BUTTONS_CONTENT_AUDIT.md';

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip some folders
      if (['node_modules', '.next', 'dist', 'build', 'out', '.git'].includes(entry.name)) continue;
      walk(full, fileList);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (INCLUDE_EXT.has(ext)) fileList.push(full);
    }
  }
  return fileList;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function hasAttr(attrs, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*([\"\'])(.*?)\\1`, 'i');
  const m = attrs.match(re);
  if (!m) return false;
  const val = (m[2] || '').trim();
  return val.length > 0;
}

function isDisabled(attrs) {
  return /\bdisabled\b/i.test(attrs) || /\baria-disabled\s*=\s*([\"\'])true\1/i.test(attrs);
}

function getLineNumberFromIndex(content, index) {
  // lines are 1-based
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Patterns to match (global, non-overlapping loops)
  const patterns = [
    {
      type: 'native-button',
      re: /<button\b([^>]*)>([\s\S]*?)<\/button>/gi,
      validator: (attrs, inner) => {
        if (isDisabled(attrs)) return null; // ignore disabled
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title') || hasAttr(attrs, 'aria-labelledby');
        if (hasName) return null;
        const text = stripTags(inner);
        if (text.length > 0) return null;
        return 'Button has no visible text or accessible name (aria-label/title)';
      },
    },
    {
      type: 'anchor',
      re: /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
      validator: (attrs, inner) => {
        // clickable either via href or onClick
        if (!/\bhref\b|\bonclick\b/i.test(attrs)) return null; // not clickable
        if (isDisabled(attrs)) return null;
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title') || hasAttr(attrs, 'aria-labelledby');
        if (hasName) return null;
        const text = stripTags(inner);
        if (text.length > 0) return null;
        return 'Anchor link has no visible text or accessible name (aria-label/title)';
      },
    },
    {
      type: 'role-button',
      re: /<([a-zA-Z0-9:_-]+)\b([^>]*\brole\s*=\s*([\"\'])button\3[^>]*)>([\s\S]*?)<\/\1>/gi,
      validator: (attrs, inner) => {
        if (isDisabled(attrs)) return null;
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title') || hasAttr(attrs, 'aria-labelledby');
        if (hasName) return null;
        const text = stripTags(inner);
        if (text.length > 0) return null;
        return 'Element with role="button" has no visible text or accessible name';
      },
    },
    {
      type: 'next-link',
      re: /<Link\b([^>]*)>([\s\S]*?)<\/Link>/g,
      validator: (attrs, inner) => {
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title') || hasAttr(attrs, 'aria-labelledby');
        if (hasName) return null;
        const text = stripTags(inner);
        if (text.length > 0) return null;
        return 'Next.js <Link> has no visible text or accessible name';
      },
    },
    {
      type: 'custom-Button',
      re: /<Button\b([^>]*)>([\s\S]*?)<\/Button>/g,
      validator: (attrs, inner) => {
        if (isDisabled(attrs)) return null;
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title') || hasAttr(attrs, 'label');
        if (hasName) return null;
        const text = stripTags(inner);
        if (text.length > 0) return null;
        return 'Custom <Button> has no visible text or accessible name';
      },
    },
    {
      type: 'custom-Button-selfclosing',
      re: /<Button\b([^>]*)\/>/g,
      validator: (attrs) => {
        if (isDisabled(attrs)) return null;
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title') || hasAttr(attrs, 'label');
        if (hasName) return null;
        return 'Self-closing <Button /> missing accessible name (aria-label/title/label)';
      },
    },
    {
      type: 'IconButton',
      re: /<IconButton\b([^>]*)\/?>(?:[\s\S]*?<\/IconButton>)?/g,
      validator: (attrs) => {
        if (isDisabled(attrs)) return null;
        const hasName = hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title');
        if (hasName) return null;
        return '<IconButton> missing accessible name (aria-label/title)';
      },
    },
  ];

  for (const { type, re, validator } of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const full = m[0];
      const startIndex = m.index;
      let attrs = '';
      let inner = '';
      if (type === 'custom-Button-selfclosing' || type === 'IconButton') {
        attrs = m[1] || '';
      } else if (type === 'role-button') {
        attrs = m[2] || '';
        inner = m[4] || '';
      } else {
        attrs = m[1] || '';
        inner = m[2] || '';
      }
      const reason = validator(attrs, inner);
      if (reason) {
        const line = getLineNumberFromIndex(content, startIndex);
        // reduce snippet size
        const snippet = full.length > 200 ? (full.slice(0, 200) + '…') : full;
        issues.push({ type, line, reason, snippet });
      }
    }
  }

  return issues;
}

function relativeToCwd(p) {
  try {
    return path.relative(process.cwd(), p).replace(/\\/g, '/');
  } catch {
    return p;
  }
}

function main() {
  const startDirs = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SCAN_DIRS)
    .map((p) => path.resolve(process.cwd(), p));

  let files = [];
  for (const d of startDirs) files = walk(d, files);

  const allResults = [];
  let totalElements = 0;

  const perTypeCounts = {};

  for (const file of files) {
    const issues = analyzeFile(file);
    totalElements += issues.length; // not exact elements scanned, but keeps non-zero metric per file
    if (issues.length) {
      allResults.push({ file, issues });
      for (const iss of issues) {
        perTypeCounts[iss.type] = (perTypeCounts[iss.type] || 0) + 1;
      }
    }
  }

  // Compose markdown
  const lines = [];
  lines.push('# Buttons/Links Content Audit');
  lines.push('');
  lines.push(`Scanned directories: ${startDirs.map((d) => '`' + relativeToCwd(d) + '`').join(', ')}`);
  lines.push('');
  lines.push('Criteria: Each clickable element must have visible text or an accessible name via aria-label/title/label. Elements detected: <button>, <a>, role="button", Next.js <Link>, <Button>, <IconButton>. Disabled elements are ignored.');
  lines.push('');

  const totalFiles = files.length;
  const totalIssues = allResults.reduce((acc, f) => acc + f.issues.length, 0);
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Files scanned: ${totalFiles}`);
  lines.push(`- Files with issues: ${allResults.length}`);
  lines.push(`- Potential accessibility issues found: ${totalIssues}`);
  if (Object.keys(perTypeCounts).length) {
    lines.push('- Issues by type:');
    for (const [k, v] of Object.entries(perTypeCounts)) {
      lines.push(`  - ${k}: ${v}`);
    }
  }
  lines.push('');

  lines.push('## Details');
  lines.push('');
  if (!allResults.length) {
    lines.push('No missing content found for clickable elements in the scanned directories.');
  } else {
    for (const { file, issues } of allResults.sort((a, b) => a.file.localeCompare(b.file))) {
      lines.push(`### ${relativeToCwd(file)}`);
      for (const iss of issues.sort((a, b) => a.line - b.line)) {
        lines.push(`- [ ] Line ${iss.line} (${iss.type}): ${iss.reason}`);
        lines.push('  ' + '```html');
        lines.push('  ' + iss.snippet.replace(/```/g, '\u0060\u0060\u0060'));
        lines.push('  ' + '```');
      }
      lines.push('');
    }
  }

  const reportPath = path.resolve(process.cwd(), REPORT_FILENAME);
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

  // Print a tiny summary to stdout
  console.log(`Audit complete. Files scanned: ${totalFiles}. Issues: ${totalIssues}. Report written to ${REPORT_FILENAME}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Error running audit:', err);
    process.exit(1);
  }
}

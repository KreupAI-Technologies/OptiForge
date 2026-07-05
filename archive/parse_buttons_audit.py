#!/usr/bin/env python3
"""
Parse BUTTONS_CONTENT_AUDIT.md and create a detailed implementation mapping
"""
import re
import csv
from pathlib import Path
from collections import defaultdict

def extract_icon_from_html(html_str):
    """Extract icon name from HTML code"""
    # Clean up the HTML string
    html_clean = html_str.replace('\n', ' ').replace('  ', ' ')

    # Look for icon components (capital letter start indicates React component)
    # Pattern 1: <IconName className=...
    icon_matches = re.findall(r'<([A-Z]\w+)\s+className', html_clean)

    # Filter out common non-icon elements
    non_icons = {'Link', 'Button', 'IconButton'}
    for icon in icon_matches:
        if icon not in non_icons:
            return icon

    # Pattern 2: Look for any capitalized component
    icon_matches = re.findall(r'<([A-Z][a-zA-Z0-9]+)[\s/>]', html_clean)
    for icon in icon_matches:
        if icon not in non_icons:
            return icon

    return "Unknown"

def suggest_button_text(icon_name, file_context):
    """Suggest appropriate button text based on icon and context"""
    icon_text_map = {
        'Bell': 'Notifications',
        'Download': 'Download',
        'Eye': 'View',
        'Edit': 'Edit',
        'Edit2': 'Edit',
        'Trash2': 'Delete',
        'Copy': 'Copy',
        'Send': 'Send',
        'Play': 'Play',
        'Pause': 'Pause',
        'Settings': 'Settings',
        'Plus': 'Add',
        'ChevronLeft': 'Previous',
        'ChevronRight': 'Next',
        'MoreVertical': 'More Options',
        'Filter': 'Filter',
        'RefreshCw': 'Refresh',
        'ArrowLeft': 'Go Back',
        'CheckCircle': 'Approve',
        'XCircle': 'Close',
        'Printer': 'Print',
        'Mail': 'Email',
        'Phone': 'Call',
        'Save': 'Save',
        'X': 'Close',
        'ZoomIn': 'Zoom In',
        'ZoomOut': 'Zoom Out',
        'BarChart3': 'View Analytics',
        'FileText': 'View Document',
        'ExternalLink': 'Open Link',
        'UserPlus': 'Add User',
        'UserMinus': 'Remove User',
        'Camera': 'View Photos',
        'HelpCircle': 'Help',
        'User': 'Profile',
        'LogOut': 'Logout',
        'Truck': 'Track Shipment',
        'History': 'View History',
        'Activity': 'View Activity',
        'Award': 'View Recognition',
        'MessageSquare': 'Add Comment',
        'Undo2': 'Revert',
        'TrendingUp': 'View Trends',
        'ToggleLeft': 'Enable',
        'ToggleRight': 'Disable',
        'Search': 'Search',
    }

    return icon_text_map.get(icon_name, f'{icon_name}')

def get_module_name(file_path):
    """Extract module name from file path"""
    parts = file_path.split('/')
    if '(modules)' in parts:
        idx = parts.index('(modules)')
        if idx + 1 < len(parts):
            return parts[idx + 1]
    elif '(dashboard)' in parts:
        return 'dashboard'
    elif 'app/hr' in file_path or '/hr/' in file_path:
        return 'hr'
    return 'other'

def parse_audit_file(audit_file_path):
    """Parse the buttons audit file and extract all button issues"""
    with open(audit_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by file sections
    file_sections = re.split(r'^### ', content, flags=re.MULTILINE)[1:]

    all_issues = []

    for section in file_sections:
        lines = section.strip().split('\n')
        file_path = lines[0].strip()

        # Find all issues in this file
        issue_pattern = r'- \[ \] Line (\d+) \(([^)]+)\): (.+?)```html\s+(.+?)```'
        matches = re.finditer(issue_pattern, section, re.DOTALL)

        for match in matches:
            line_num = match.group(1)
            element_type = match.group(2)
            description = match.group(3).strip()
            html_code = match.group(4).strip()

            # Extract icon
            icon = extract_icon_from_html(html_code)

            # Get module
            module = get_module_name(file_path)

            # Suggest button text
            suggested_text = suggest_button_text(icon, file_path)

            # Determine context from file path
            context_parts = file_path.replace('b3-erp/frontend/src/app/', '').split('/')
            if len(context_parts) > 2:
                context = ' > '.join(context_parts[-3:]).replace('.tsx', '')
            else:
                context = ' > '.join(context_parts).replace('.tsx', '')

            all_issues.append({
                'module': module.title(),
                'file_path': file_path,
                'line_number': line_num,
                'icon_type': icon,
                'suggested_text': suggested_text,
                'context': context,
                'element_type': element_type,
                'html_snippet': html_code[:100] + '...' if len(html_code) > 100 else html_code
            })

    return all_issues

def create_implementation_guide(issues, output_file):
    """Create a CSV implementation guide grouped by module"""
    # Group by module
    modules = defaultdict(list)
    for issue in issues:
        modules[issue['module']].append(issue)

    # Sort modules
    sorted_modules = sorted(modules.keys())

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)

        # Write header
        writer.writerow(['Module', 'File Path', 'Line Number', 'Icon Type',
                        'Suggested Button Text', 'Context', 'Implementation Notes'])

        # Write data grouped by module
        for module in sorted_modules:
            module_issues = sorted(modules[module], key=lambda x: (x['file_path'], int(x['line_number'])))

            for issue in module_issues:
                writer.writerow([
                    issue['module'],
                    issue['file_path'],
                    issue['line_number'],
                    issue['icon_type'],
                    issue['suggested_text'],
                    issue['context'],
                    f'Add aria-label="{issue["suggested_text"]}" or visible text'
                ])

    print(f"Created implementation guide: {output_file}")
    print(f"Total issues: {len(issues)}")
    print(f"Modules affected: {len(sorted_modules)}")

    # Print module summary
    print("\n=== MODULE SUMMARY ===")
    for module in sorted_modules:
        print(f"{module}: {len(modules[module])} issues")

def create_markdown_guide(issues, output_file):
    """Create a detailed Markdown implementation guide"""
    # Group by module and file
    modules = defaultdict(lambda: defaultdict(list))
    for issue in issues:
        modules[issue['module']][issue['file_path']].append(issue)

    # Sort modules
    sorted_modules = sorted(modules.keys())

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Button Accessibility Implementation Guide\n\n")
        f.write("This guide provides a step-by-step checklist for adding accessible text/labels to all buttons.\n\n")
        f.write(f"**Total Issues:** {len(issues)}\n\n")
        f.write(f"**Modules Affected:** {len(sorted_modules)}\n\n")

        f.write("## Implementation Approach\n\n")
        f.write("For each button, add one of the following:\n")
        f.write("1. **aria-label**: `<button aria-label=\"View Details\">...</button>`\n")
        f.write("2. **Visible text**: `<button><Eye className=\"h-4 w-4\" /> View</button>`\n")
        f.write("3. **title attribute**: `<button title=\"View Details\">...</button>`\n\n")

        f.write("---\n\n")

        # Table of Contents
        f.write("## Table of Contents\n\n")
        for module in sorted_modules:
            file_count = len(modules[module])
            issue_count = sum(len(issues) for issues in modules[module].values())
            f.write(f"- [{module}](#{module.lower().replace(' ', '-')}) ({file_count} files, {issue_count} issues)\n")
        f.write("\n---\n\n")

        # Write detailed implementation guide
        for module in sorted_modules:
            f.write(f"## {module}\n\n")

            sorted_files = sorted(modules[module].keys())

            for file_path in sorted_files:
                file_issues = sorted(modules[module][file_path],
                                   key=lambda x: int(x['line_number']))

                f.write(f"### {file_path}\n\n")
                f.write(f"**Issues to fix:** {len(file_issues)}\n\n")

                for issue in file_issues:
                    f.write(f"#### Line {issue['line_number']}\n\n")
                    f.write(f"- **Icon:** `{issue['icon_type']}`\n")
                    f.write(f"- **Suggested Text:** `{issue['suggested_text']}`\n")
                    f.write(f"- **Context:** {issue['context']}\n")
                    f.write(f"- **Implementation:**\n")
                    f.write(f"  ```tsx\n")
                    f.write(f"  // Add aria-label\n")
                    f.write(f"  <button aria-label=\"{issue['suggested_text']}\" className=\"...\">\n")
                    f.write(f"    <{issue['icon_type']} className=\"...\" />\n")
                    f.write(f"  </button>\n")
                    f.write(f"  ```\n\n")
                    f.write(f"- [ ] Fixed\n\n")

            f.write("\n---\n\n")

    print(f"Created Markdown implementation guide: {output_file}")

if __name__ == "__main__":
    audit_file = Path("BUTTONS_CONTENT_AUDIT.md")
    csv_output = Path("BUTTON_IMPLEMENTATION_GUIDE.csv")
    md_output = Path("BUTTON_IMPLEMENTATION_GUIDE.md")

    print("Parsing buttons audit file...")
    issues = parse_audit_file(audit_file)

    print("\nCreating implementation guides...")
    create_implementation_guide(issues, csv_output)
    create_markdown_guide(issues, md_output)

    print("\n[SUCCESS] Implementation guides created successfully!")
    print(f"   - CSV Guide: {csv_output}")
    print(f"   - Markdown Guide: {md_output}")

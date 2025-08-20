# Linear Issue Embeds

A focused Obsidian plugin that embeds Linear issues directly into your notes with beautiful, customizable displays. Perfect for documentation, meeting notes, project tracking, and maintaining context between your knowledge base and development work.

## Features

### Linear Issue Embeds
Embed Linear issues directly into your notes with beautiful, interactive displays:

```linear-issue
ABC-123:card
```

**Available Embed Formats:**
- **`compact`** - Single line with identifier, title, and state
- **`card`** - Rich card with full details, assignee, and description (default)
- **`detailed`** - Full information with complete description and metadata
- **`badge`** - Small badge with identifier and state
- **`progress`** - Card with progress bar based on completion status
- **`developer`** - Technical view with branches, estimates, and activity
- **`executive`** - High-level view focused on project status and deadlines

**Customization Options:**
```linear-issue
ABC-123:card
showDescription=true
showAssignee=true
showPriority=true
showTeam=false
showCreator=true
showProject=true
showLabels=true
showEstimate=true
showDueDate=true
maxDescriptionLength=100
interactive=true
```

### Key Features
- **Read-Only Design** - View Linear issues without accidentally modifying them
- **Click to Open** - Click any embed to open the issue directly in Linear
- **Manual Refresh** - Refresh button on embeds to get latest data
- **Theme Integration** - Automatically matches your Obsidian theme
- **Performance Optimized** - Cached data for fast loading
- **Rich Metadata** - Display priority, labels, assignees, due dates, and more

## Installation

### Via BRAT (Recommended)
1. Install the BRAT plugin from Obsidian Community Plugins
2. Open BRAT settings in Obsidian (Settings > Plugin Options > BRAT)
3. Click "Add Beta Plugin"
4. Enter the GitHub repository URL: `https://github.com/serabi/LinearInObsidian`
5. Click "Add Plugin"
6. BRAT will install and enable the plugin automatically

### Manual Installation
1. Download the latest release from the GitHub releases page
2. Extract the files to your vault's `.obsidian/plugins/linear-issue-embeds/` directory
3. Enable the plugin in Obsidian Settings > Community Plugins

## Setup Guide

### 1. Get Your Linear API Key

1. Go to [Linear Settings](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a descriptive name (e.g., "Obsidian Plugin")
4. Copy the generated API key (starts with `lin_api_`)

### 2. Configure the Plugin

1. Open Obsidian Settings
2. Navigate to Plugin Options > Linear Issue Embeds
3. Paste your Linear API key in the "Linear API Key" field
4. Configure your notification preferences
5. Click "Test Linear Connection" to verify your setup

### 3. Verify Connection

- Check the status bar at the bottom of Obsidian
- It should show "Linear: Connected" when properly configured
- If it shows "Linear: Not configured", double-check your API key

## How to Embed Linear Issues

### Quick Start: 3 Steps to Embed Any Linear Issue

**Step 1: Get Your Issue Identifier**
- Find any Linear issue (e.g., `DEV-123`, `BUG-456`, `FEAT-789`)
- Issue identifiers are shown in Linear's interface and URLs

**Step 2: Add the Embed Code Block**
In any Obsidian note, type:
````markdown
```linear-issue
DEV-123:card
```
````

**Step 3: Replace with Your Issue**
- Change `DEV-123` to your actual Linear issue identifier
- The embed will automatically load and display the issue

### Embed Format Options

**Default Card Format:**
````markdown
```linear-issue
ABC-123:card
```
````
*Rich card with title, description, assignee, priority, and team*

**Compact Format (Single Line):**
````markdown
```linear-issue
ABC-123:compact
```
````
*Minimal display with identifier, title, and status*

**Detailed Format (Full Information):**
````markdown
```linear-issue
ABC-123:detailed
```
````
*Complete issue details with full description and metadata*

**Badge Format (Status Indicator):**
````markdown
```linear-issue
ABC-123:badge
```
````
*Small badge showing identifier and current status*

**Progress Format (With Progress Bar):**
````markdown
```linear-issue
ABC-123:progress
```
````
*Card format with visual progress indicator*

**Developer Format (Technical Details):**
````markdown
```linear-issue
ABC-123:developer
```
````
*Optimized for developers: shows git branch, story points, comments, and attachments*

**Executive Format (High-Level Status):**
````markdown
```linear-issue
ABC-123:executive
```
````
*Optimized for leadership: shows project status, deadlines, and team assignments*

### Customization Options

**Enhanced Display Examples:**

**Developer-Focused View:**
````markdown
```linear-issue
ABC-123:card
showAssignee=true
showEstimate=true
showLabels=true
showBranch=true
showCommentCount=true
showAttachmentCount=true
```
````

**Project Manager View:**
````markdown
```linear-issue
ABC-123:card
showProject=true
showCycle=true
showDueDate=true
showProgress=true
showCreator=true
showTeam=true
```
````

**Minimal Status View:**
````markdown
```linear-issue
ABC-123:card
showDescription=false
showPriority=true
showAssignee=true
showLabels=true
showDueDate=true
```
````

**Available Customizations:**

**Core Display Options:**
- `showDescription=true/false` - Show/hide issue description
- `showAssignee=true/false` - Show/hide assignee information  
- `showPriority=true/false` - Show/hide priority level
- `showTeam=true/false` - Show/hide team information
- `showDates=true/false` - Show/hide creation/update dates
- `interactive=true/false` - Enable/disable click interactions
- `maxDescriptionLength=number` - Limit description length

**Enhanced Display Options:**
- `showCreator=true/false` - Show/hide who created the issue
- `showProject=true/false` - Show/hide associated project
- `showCycle=true/false` - Show/hide development cycle
- `showEstimate=true/false` - Show/hide story points estimate
- `showLabels=true/false` - Show/hide issue labels with colors
- `showDueDate=true/false` - Show/hide due date (highlights if overdue)
- `showCommentCount=true/false` - Show/hide number of comments
- `showAttachmentCount=true/false` - Show/hide number of attachments
- `showUrl=true/false` - Show/hide direct Linear URL
- `showBranch=true/false` - Show/hide git branch name
- `showProgress=true/false` - Show/hide project/cycle progress

### Quick Insert Methods

**Method 1: Command Palette**
1. Press `Ctrl+P` (or `Cmd+P` on Mac)
2. Type "Insert Linear Issue Embed"
3. Select your preferred format
4. Replace `ABC-123` with your issue identifier

**Method 2: Manual Typing**
1. Type three backticks: ```
2. Type `linear-issue`
3. Press Enter
4. Type your issue identifier and format
5. Close with three backticks: ```

### Pro Tips for Linear Embeds

**Manual Updates**
- Embeds display cached data for fast loading
- Use the refresh button to get the latest data
- Click-to-open always takes you to the current issue in Linear

**Interactive Features**
- **Click any embed** to open the issue in Linear
- **Refresh button** updates individual embeds instantly

**Use Cases**
- **Meeting Notes**: Embed issues being discussed with `executive` format for stakeholders
- **Project Documentation**: Show related issues in context with `detailed` format
- **Sprint Planning**: Use `developer` format to see story points and technical details
- **Status Reports**: Include `progress` format embeds with due dates and project info
- **Daily Notes**: Track assigned issues with `compact` format
- **Code Reviews**: Use `developer` format to see git branches and technical context
- **Executive Dashboards**: Use `executive` format for high-level project status

## Troubleshooting

### Common Issues

**"Linear: Not configured" in status bar**
- Verify your API key is correctly entered in settings
- Ensure the API key starts with `lin_api_`
- Use "Test Linear Connection" to validate

**Linear embeds not displaying**
- Verify the issue identifier is correct (e.g., `ABC-123`)
- Check that the issue exists and you have access to it
- Ensure the Linear API key is configured and working

**Embed shows "Loading..." indefinitely**
- Check your internet connection
- Verify the Linear API key has proper permissions
- Try refreshing the note or restarting Obsidian

**Embed shows "Issue not found"**
- Double-check the issue identifier spelling
- Ensure you have access to the team/project containing the issue
- Try accessing the issue directly in Linear first

### Developer Debugging

**Enable Debug Logging:**
1. Open Obsidian Developer Tools (`Ctrl+Shift+I` or `Cmd+Option+I`)
2. Go to the Console tab
3. Try to load your embed
4. Look for `[Linear Embed]` and `[Linear Service]` log messages

**Debug Commands:**
- `Ctrl+P` → "Debug: List Available Linear Issues" - Shows issues in your workspace

## Quick Reference

### Linear Embed Syntax Cheat Sheet

**Basic Embeds:**
```markdown
```linear-issue
ABC-123:card        # Default rich card
ABC-123:compact     # Single line
ABC-123:detailed    # Full details
ABC-123:badge       # Status badge
ABC-123:progress    # With progress bar
ABC-123:developer   # Technical view
ABC-123:executive   # Leadership view
```
```

**Commands Quick Access:**
| Shortcut | Command |
|----------|---------|
| `Ctrl+P` | Open command palette |
| "Insert Linear Issue Embed" | Insert card template |
| "Insert Linear Issue Embed (Compact)" | Insert compact template |
| "Insert Linear Issue Embed (Detailed)" | Insert detailed template |
| "Insert Linear Issue Embed (Developer)" | Insert developer template |
| "Insert Linear Issue Embed (Executive)" | Insert executive template |

**Embed Interactions:**
- **Click embed** → Open issue in Linear
- **Refresh button** → Update individual embed
- **Read-only** → No accidental modifications

## Contributing

We welcome contributions to improve the Linear Issue Embeds plugin!

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Link to your Obsidian plugins folder for testing

### Development Commands

```bash
npm run dev     # Development build with watching
npm run build   # Production build
npm run version # Update version numbers
```

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/linear-issue-embeds/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/linear-issue-embeds/discussions)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- **Initial Release**: Clean, focused Linear issue embedding plugin for Obsidian
- **Read-Only Design**: View Linear issues without accidentally modifying them
- **7 Embed Formats**: Compact, card, detailed, badge, progress, developer, and executive views
- **20+ Customization Options**: Control visibility of description, assignee, priority, labels, dates, and more
- **Click to Open**: Direct integration with Linear - click any embed to open in Linear
- **Manual Refresh**: Individual embed refresh buttons for latest data
- **Theme Integration**: Automatically matches your Obsidian theme
- **Performance Optimized**: Cached data for fast loading

---

**Made for the Obsidian and Linear communities**
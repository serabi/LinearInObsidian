// Enhanced debug for Linear embed rendering
// Copy and paste this into Obsidian Developer Console

(async () => {
    console.log('🔧 Enhanced Linear Embed Debug for HAPD-1948...');
    
    const plugin = app.plugins.plugins['linear-in-obsidian'];
    if (!plugin) {
        console.error('❌ Plugin not found');
        return;
    }
    
    if (!plugin.linearService?.isConfigured()) {
        console.error('❌ Service not configured');
        return;
    }
    
    try {
        console.log('📡 Fetching issue...');
        const issue = await plugin.linearService.getIssueByIdentifier('HAPD-1948');
        
        if (!issue) {
            console.error('❌ Issue not found');
            return;
        }
        
        // DETAILED DESCRIPTION ANALYSIS
        console.group('🔍 DETAILED DESCRIPTION ANALYSIS');
        console.log('Raw description value:', issue.description);
        console.log('Description type:', typeof issue.description);
        console.log('Description == null:', issue.description == null);
        console.log('Description === null:', issue.description === null);
        console.log('Description === undefined:', issue.description === undefined);
        console.log('Description === "":', issue.description === "");
        console.log('Boolean check (!!description):', !!issue.description);
        console.log('Truthy check (description):', issue.description ? true : false);
        console.log('Length check:', issue.description ? issue.description.length : 'N/A');
        
        if (issue.description) {
            console.log('First 200 chars:', issue.description.substring(0, 200));
            console.log('Contains only whitespace:', /^\s*$/.test(issue.description));
        }
        console.groupEnd();
        
        // TEST EMBED OPTIONS PARSING
        console.group('🎛️ EMBED OPTIONS PARSING TEST');
        
        // Test the exact code from your issue
        const yourEmbedCode = `HAPD-1948:card
showDescription=true
showAssignee=true
showPriority=true
showTeam=true`;
        
        console.log('Your embed code:');
        console.log(yourEmbedCode);
        
        // Manually parse like the plugin does
        const lines = yourEmbedCode.split('\n').map(l => l.trim()).filter(l => l);
        console.log('Parsed lines:', lines);
        
        const firstLine = lines[0];
        console.log('First line:', firstLine);
        
        // Parse first line
        const parts = firstLine.split(':');
        console.log('Split parts:', parts);
        
        const issueId = parts[0];
        const format = parts[1] || 'card';
        console.log('Issue ID:', issueId);
        console.log('Format:', format);
        
        // Parse options from remaining lines
        const options = { format: format };
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            console.log('Processing option line:', line);
            
            if (line.includes('=')) {
                const [key, value] = line.split('=', 2);
                const trimmedKey = key.trim();
                const trimmedValue = value.trim();
                console.log('Option:', trimmedKey, '=', trimmedValue);
                
                if (trimmedKey === 'showDescription') {
                    options.showDescription = trimmedValue === 'true';
                    console.log('Set showDescription to:', options.showDescription);
                }
            }
        }
        
        console.log('Final parsed options:', options);
        console.groupEnd();
        
        // TEST RENDERING LOGIC
        console.group('🎨 RENDERING LOGIC TEST');
        
        const finalOptions = {
            format: 'card',
            showDescription: true,  // This should be true from your settings
            showAssignee: true,
            showPriority: true,
            showTeam: true,
            maxDescriptionLength: 150
        };
        
        console.log('Final options for rendering:', finalOptions);
        
        // Test the exact condition from the code
        const condition1 = finalOptions.showDescription;
        const condition2 = issue.description;
        const bothConditions = condition1 && condition2;
        
        console.log('showDescription option:', condition1);
        console.log('issue.description exists:', condition2);
        console.log('Both conditions (will show):', bothConditions);
        
        if (bothConditions) {
            const maxLength = finalOptions.maxDescriptionLength || 150;
            const willTruncate = issue.description.length > maxLength;
            const displayText = willTruncate ? 
                issue.description.substring(0, maxLength) + '...' : 
                issue.description;
                
            console.log('Max length:', maxLength);
            console.log('Will truncate:', willTruncate);
            console.log('Display text:', displayText);
            console.log('✅ Description SHOULD be displayed');
        } else {
            console.log('❌ Description will NOT be displayed because:');
            if (!condition1) console.log('  - showDescription is false');
            if (!condition2) console.log('  - issue.description is falsy');
        }
        
        console.groupEnd();
        
        console.log('🎯 Enhanced debug complete!');
        
    } catch (error) {
        console.error('❌ Error during enhanced debug:', error);
    }
})();
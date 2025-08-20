// Simple debug script for HAPD-1948
// Copy and paste this into Obsidian Developer Console (Ctrl+Shift+I -> Console)

(async () => {
    console.log('🔍 Debugging HAPD-1948 issue...');
    
    // Get the Linear plugin
    const plugin = app.plugins.plugins['linear-in-obsidian'];
    if (!plugin) {
        console.error('❌ Linear plugin not found');
        return;
    }
    
    console.log('✅ Found Linear plugin');
    
    // Check if configured
    if (!plugin.linearService?.isConfigured()) {
        console.error('❌ Linear service not configured');
        return;
    }
    
    console.log('✅ Linear service is configured');
    
    try {
        // Fetch the specific issue
        console.log('📡 Fetching HAPD-1948...');
        const issue = await plugin.linearService.getIssueByIdentifier('HAPD-1948');
        
        if (!issue) {
            console.error('❌ HAPD-1948 not found');
            return;
        }
        
        // Log comprehensive issue details
        console.log('✅ HAPD-1948 Found!');
        console.group('📋 Issue Details:');
        console.log('ID:', issue.id);
        console.log('Identifier:', issue.identifier);
        console.log('Title:', issue.title);
        console.log('Team:', issue.team.name);
        console.log('State:', issue.state.name);
        console.log('Assignee:', issue.assignee ? issue.assignee.name : 'Unassigned');
        console.log('Priority:', issue.priority);
        console.groupEnd();
        
        // Focus on description
        console.group('📝 Description Analysis:');
        console.log('Description exists:', !!issue.description);
        console.log('Description type:', typeof issue.description);
        console.log('Description length:', issue.description ? issue.description.length : 0);
        console.log('Description preview:', issue.description ? 
            (issue.description.length > 100 ? 
                issue.description.substring(0, 100) + '...' : 
                issue.description) : 
            'NO DESCRIPTION');
        console.log('Full description:', issue.description);
        console.groupEnd();
        
        // Test embed option parsing
        console.group('🎛️ Embed Options Test:');
        const testEmbedSource = `HAPD-1948:card
showDescription=true
showAssignee=true
showPriority=true
showTeam=true`;
        
        console.log('Test source:', testEmbedSource);
        
        // Test the rendering conditions
        const options = {
            format: 'card',
            showDescription: true,
            showAssignee: true,
            showPriority: true,
            showTeam: true,
            maxDescriptionLength: 150
        };
        
        console.log('Options:', options);
        
        // Check what would be shown
        const shouldShowDescription = options.showDescription && issue.description;
        console.log('Should show description:', shouldShowDescription);
        
        if (shouldShowDescription) {
            const displayDescription = issue.description.length > options.maxDescriptionLength
                ? issue.description.substring(0, options.maxDescriptionLength) + '...'
                : issue.description;
            console.log('Display description:', displayDescription);
        } else {
            console.log('Why not showing:', {
                showDescriptionOption: options.showDescription,
                hasDescription: !!issue.description,
                both: options.showDescription && !!issue.description
            });
        }
        console.groupEnd();
        
        console.log('🎯 Debug complete!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
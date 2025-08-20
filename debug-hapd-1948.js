// Debug script for HAPD-1948 issue
// Run this in Obsidian Developer Console (Ctrl+Shift+I -> Console)

console.log('🔍 Starting debug for HAPD-1948...');

// Function to debug the Linear embed
async function debugHAPD1948() {
    // Check if the Linear plugin is loaded
    const plugin = app.plugins.plugins['linear-in-obsidian'];
    if (!plugin) {
        console.error('❌ Linear plugin not found!');
        console.log('Available plugins:', Object.keys(app.plugins.plugins));
        return;
    }
    console.log('✅ Linear plugin found');

    // Check if Linear service is configured
    if (!plugin.linearService || !plugin.linearService.isConfigured()) {
        console.error('❌ Linear service not configured!');
        return;
    }
    console.log('✅ Linear service configured');

    try {
        // Test the specific issue lookup
        console.log('🔍 Testing HAPD-1948 lookup...');
        const issue = await plugin.linearService.getIssueByIdentifier('HAPD-1948');
        
        if (!issue) {
            console.error('❌ HAPD-1948 not found');
            return;
        }

        console.log('✅ HAPD-1948 found!');
        console.log('📄 Issue details:', {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            description: issue.description,
            descriptionExists: !!issue.description,
            descriptionLength: issue.description ? issue.description.length : 0,
            team: issue.team.name,
            state: issue.state.name,
            assignee: issue.assignee ? issue.assignee.name : 'Unassigned',
            priority: issue.priority
        });

        // Test the embed options parsing
        console.log('🎛️ Testing embed options parsing...');
        const embedProcessor = new plugin.constructor.prototype.constructor.LinearEmbedProcessor || plugin.embedProcessor;
        
        if (embedProcessor) {
            // Test parsing the embed source
            const testSource = `HAPD-1948:card
showDescription=true
showAssignee=true
showPriority=true
showTeam=true`;

            console.log('📝 Test embed source:', testSource);
            
            // We need to access the private parseEmbedSource method
            // This is a bit hacky but needed for debugging
            const parsed = embedProcessor.parseEmbedSource ? 
                embedProcessor.parseEmbedSource(testSource) : 
                'parseEmbedSource method not accessible';
                
            console.log('🔧 Parsed options:', parsed);
        }

        // Check the description in the actual issue rendering
        console.log('🎨 Testing description rendering logic...');
        const testOptions = {
            format: 'card',
            showDescription: true,
            showAssignee: true,
            showPriority: true,
            showTeam: true,
            maxDescriptionLength: 150
        };

        console.log('🎯 Test render options:', testOptions);
        
        // Test what would be rendered
        if (testOptions.showDescription && issue.description) {
            const truncatedDescription = issue.description.length > testOptions.maxDescriptionLength
                ? issue.description.substring(0, testOptions.maxDescriptionLength) + '...'
                : issue.description;
            console.log('✂️ Truncated description:', truncatedDescription);
        } else {
            console.log('⚠️ Description not shown because:', {
                showDescription: testOptions.showDescription,
                descriptionExists: !!issue.description,
                reason: !testOptions.showDescription ? 'showDescription=false' : 
                       !issue.description ? 'No description in issue' : 'Unknown'
            });
        }

    } catch (error) {
        console.error('❌ Error during debug:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
    }
}

// Run the debug
debugHAPD1948();
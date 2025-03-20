// Debug tools for Net Worth Tracker
console.log('Debug tools loaded - Press Alt+D for debug panel');

// Create debug navigation panel
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        background: #333;
        color: white;
        padding: 10px;
        border-top-left-radius: 8px;
        z-index: 1000;
        font-family: monospace;
        font-size: 12px;
        max-width: 400px;
        max-height: 300px;
        overflow: auto;
    `;
    
    const content = `
        <h3>Debug Panel</h3>
        <p><strong>Keyboard Shortcuts:</strong></p>
        <ul>
            <li>Alt+1: Dashboard</li>
            <li>Alt+2: Assets & Liabilities</li>
            <li>Alt+3: Trends</li>
            <li>Alt+4: Goals</li>
            <li>Alt+C: Check page structure</li>
            <li>Alt+R: Reset page styles</li>
            <li>Alt+F: Fix navigation</li>
        </ul>
        <p><strong>Section Status:</strong></p>
        <div id="debug-section-status"></div>
        <p><button id="hide-debug">Close</button></p>
    `;
    
    debugPanel.innerHTML = content;
    document.body.appendChild(debugPanel);
    
    document.getElementById('hide-debug').addEventListener('click', () => {
        debugPanel.remove();
    });
    
    updateDebugStatus();
}

// Update section status in debug panel
function updateDebugStatus() {
    const statusDiv = document.getElementById('debug-section-status');
    if (!statusDiv) return;
    
    const sections = document.querySelectorAll('main > section');
    let html = '';
    
    sections.forEach(section => {
        const display = getComputedStyle(section).display;
        const visibility = getComputedStyle(section).visibility;
        const id = section.id;
        const isActive = section.classList.contains('active-section');
        const isHidden = section.classList.contains('hidden-section');
        
        html += `
            <div style="margin-bottom: 5px">
                <strong>${id}</strong>: 
                <span style="color: ${display === 'none' ? 'red' : 'lime'}">${display}</span> / 
                <span style="color: ${visibility === 'hidden' ? 'red' : 'lime'}">${visibility}</span>
                ${isActive ? '<span style="color: lime">[ACTIVE]</span>' : ''}
                ${isHidden ? '<span style="color: red">[HIDDEN]</span>' : ''}
            </div>
        `;
    });
    
    statusDiv.innerHTML = html;
}

// Direct navigation function
function debugNavigate(sectionId) {
    console.log(`Debug navigation to ${sectionId}`);
    
    // Update URL
    history.pushState(null, null, `#${sectionId}`);
    
    // Try multiple methods to navigate
    
    // 1. Try forceNavigate if available
    if (window.forceNavigate) {
        window.forceNavigate(sectionId);
    }
    
    // 2. Direct DOM manipulation
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        // Hide all sections with multiple methods
        section.style.display = 'none';
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
        section.classList.remove('active-section');
        section.classList.add('hidden-section');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        // Show target section with multiple methods
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
        targetSection.style.opacity = '1';
        targetSection.style.height = 'auto';
        targetSection.style.overflow = 'visible';
        targetSection.classList.add('active-section');
        targetSection.classList.remove('hidden-section');
    }
    
    // 3. Update nav link status
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${sectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update debug panel if visible
    updateDebugStatus();
}

// Function to reset all styles to default
function resetPageStyles() {
    console.log('Resetting page styles');
    
    // Get all sections
    const sections = document.querySelectorAll('main > section');
    
    // Reset section styles
    sections.forEach(section => {
        section.style = '';
    });
    
    // Show only the section that matches the current hash
    const hash = window.location.hash.substring(1) || 'dashboard';
    debugNavigate(hash);
}

// Function to check page structure
function checkPageStructure() {
    console.log('====== PAGE STRUCTURE DIAGNOSTIC ======');
    
    // Check main element
    const main = document.querySelector('main');
    console.log('Main element:', main ? 'Found' : 'MISSING');
    
    // Check sections
    const sections = document.querySelectorAll('section');
    console.log(`Found ${sections.length} sections`);
    
    sections.forEach(section => {
        console.log(`Section: ${section.id || 'NO ID'}
        - Parent: ${section.parentElement.tagName}
        - Display: ${getComputedStyle(section).display}
        - Visibility: ${getComputedStyle(section).visibility}
        - Height: ${getComputedStyle(section).height}
        - Classes: ${section.className}`);
    });
    
    // Check navigation
    const navLinks = document.querySelectorAll('#main-nav a');
    console.log(`Found ${navLinks.length} navigation links`);
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const targetId = href?.substring(1);
        const targetElement = targetId ? document.getElementById(targetId) : null;
        
        console.log(`Link: ${href}
        - Target exists: ${targetElement ? 'Yes' : 'NO'}
        - Active class: ${link.classList.contains('active')}`);
    });
    
    console.log('====== END DIAGNOSTIC ======');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch (e.key) {
            case 'd':
                createDebugPanel();
                e.preventDefault();
                break;
            case '1':
                debugNavigate('dashboard');
                e.preventDefault();
                break;
            case '2':
                debugNavigate('assets-liabilities');
                e.preventDefault();
                break;
            case '3':
                debugNavigate('trends');
                e.preventDefault();
                break;
            case '4':
                debugNavigate('goals');
                e.preventDefault();
                break;
            case 'c':
                checkPageStructure();
                e.preventDefault();
                break;
            case 'r':
                resetPageStyles();
                e.preventDefault();
                break;
            case 'f':
                // Fix navigation by re-running handlers
                const hash = window.location.hash.substring(1) || 'dashboard';
                debugNavigate(hash);
                e.preventDefault();
                break;
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Debug tools initialized - Press Alt+D to open debug panel');
}); 
// Default content
    const defaultMarkdown = `# Welcome to my VS Code Style Previewer!

## This is a sub-heading...
### Features:

- VS Code-like interface
- Tab system
- Real-time preview
- Dark/light mode toggle

\`\`\`javascript
// Example code
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

**Bold text** and *italic text*

[Visit freeCodeCamp](https://www.freecodecamp.org)

> Blockquote example

![Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)
`;

    const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Hello World!</h1>
    <p>This is a sample HTML file</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

    const defaultCSS = `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}`;

    const defaultJS = `console.log('App loaded');

function greet(name) {
  alert(\`Hello, \${name}!\`);
}

// Sample event listener
document.querySelector('button')?.addEventListener('click', () => {
  greet('User');
});`;

    // Initialize marked
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Main App
    document.addEventListener('DOMContentLoaded', () => {
      const root = document.getElementById('root');
      
      // State
      let state = {
        activeTab: 'markdown',
        markdown: defaultMarkdown,
        html: defaultHTML,
        css: defaultCSS,
        js: defaultJS,
        isDarkMode: true,
        isPreviewOpen: true,
        openTabs: ['markdown', 'html', 'css', 'js']
      };

      // Render function
      function render() {
        // Clear root
        root.innerHTML = '';

        // Set body class for theme
        document.body.classList.toggle('light-mode', !state.isDarkMode);

        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        toolbar.innerHTML = `
          <div class="app-title">VS Code Style Markdown Previewer</div>
          <div class="toolbar-actions">
            <button id="theme-toggle" class="toolbar-btn" title="Toggle Dark Mode">
              <i class="fas ${state.isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
            </button>
            <button id="new-tab" class="toolbar-btn" title="Open Preview in New Tab">
              <i class="fas fa-external-link-alt"></i>
            </button>
          </div>
        `;
        root.appendChild(toolbar);

        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'main-container';
        root.appendChild(mainContainer);

        // Editor panel
        const editorPanel = document.createElement('div');
        editorPanel.className = 'editor-panel';
        mainContainer.appendChild(editorPanel);

        // Tabs
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        editorPanel.appendChild(tabs);

        // Add tabs
        state.openTabs.forEach(tab => {
          const tabEl = document.createElement('div');
          tabEl.className = `tab ${state.activeTab === tab ? 'active' : ''}`;
          tabEl.innerHTML = `
            <i class="fab fa-${tab === 'markdown' ? 'markdown' : tab === 'html' ? 'html5' : tab === 'css' ? 'css3-alt' : 'js-square'}"></i>
            ${tab === 'markdown' ? 'markdown.md' : tab === 'html' ? 'index.html' : tab === 'css' ? 'style.css' : 'script.js'}
            <span class="tab-close"><i class="fas fa-times"></i></span>
          `;
          
          tabEl.addEventListener('click', () => {
            state.activeTab = tab;
            render();
          });
          
          const closeBtn = tabEl.querySelector('.tab-close');
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.openTabs = state.openTabs.filter(t => t !== tab);
            if (state.activeTab === tab) {
              state.activeTab = state.openTabs[0] || '';
            }
            render();
          });
          
          tabs.appendChild(tabEl);
        });

        // Add new tab button
        const newTabBtn = document.createElement('div');
        newTabBtn.className = 'tab';
        newTabBtn.innerHTML = '<i class="fas fa-plus"></i>';
        newTabBtn.addEventListener('click', () => {
          // Simple implementation - in real app you'd have a menu
          if (!state.openTabs.includes('markdown')) {
            state.openTabs.push('markdown');
            state.activeTab = 'markdown';
          } else if (!state.openTabs.includes('html')) {
            state.openTabs.push('html');
            state.activeTab = 'html';
          } else if (!state.openTabs.includes('css')) {
            state.openTabs.push('css');
            state.activeTab = 'css';
          } else if (!state.openTabs.includes('js')) {
            state.openTabs.push('js');
            state.activeTab = 'js';
          }
          render();
        });
        tabs.appendChild(newTabBtn);

        // Editor wrapper
        const editorWrapper = document.createElement('div');
        editorWrapper.className = 'editor-wrapper';
        editorPanel.appendChild(editorWrapper);

        // Line numbers
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        editorWrapper.appendChild(lineNumbers);

        // Editor
        const editor = document.createElement('textarea');
        editor.className = 'editor';
        editor.id = 'editor';
        editor.spellcheck = false;
        
        // Set editor value based on active tab
        switch (state.activeTab) {
          case 'markdown': editor.value = state.markdown; break;
          case 'html': editor.value = state.html; break;
          case 'css': editor.value = state.css; break;
          case 'js': editor.value = state.js; break;
        }
        
        editor.addEventListener('input', (e) => {
          switch (state.activeTab) {
            case 'markdown': state.markdown = e.target.value; break;
            case 'html': state.html = e.target.value; break;
            case 'css': state.css = e.target.value; break;
            case 'js': state.js = e.target.value; break;
          }
          updatePreview();
          updateLineNumbers();
        });

        editor.addEventListener('scroll', () => {
          lineNumbers.scrollTop = editor.scrollTop;
        });
        
        editorWrapper.appendChild(editor);

        // Update line numbers
        function updateLineNumbers() {
          const lines = editor.value.split('\n').length;
          let numbers = '';
          for (let i = 1; i <= lines; i++) {
            numbers += `${i}\n`;
          }
          lineNumbers.innerHTML = numbers;
        }
        
        updateLineNumbers();

        // Preview panel
        if (state.isPreviewOpen) {
          const previewPanel = document.createElement('div');
          previewPanel.className = 'preview-panel';
          mainContainer.appendChild(previewPanel);

          // Preview header
          const previewHeader = document.createElement('div');
          previewHeader.className = 'preview-header';
          previewHeader.innerHTML = `
            <div class="preview-title">
              <i class="fas fa-eye"></i>
              <span>Preview</span>
            </div>
            <button id="close-preview" class="close-preview" title="Close Preview">
              <i class="fas fa-times"></i>
            </button>
          `;
          previewPanel.appendChild(previewHeader);

          // Preview content
          const previewContent = document.createElement('div');
          previewContent.className = 'preview-content';
          previewContent.id = 'preview';
          previewPanel.appendChild(previewContent);
          
          // Close preview button
          const closePreviewBtn = previewHeader.querySelector('#close-preview');
          closePreviewBtn.addEventListener('click', () => {
            state.isPreviewOpen = false;
            render();
          });
        } else {
          // Floating preview button
          const floatingBtn = document.createElement('div');
          floatingBtn.className = 'floating-btn';
          floatingBtn.innerHTML = '<i class="fas fa-eye"></i>';
          floatingBtn.addEventListener('click', () => {
            state.isPreviewOpen = true;
            render();
          });
          root.appendChild(floatingBtn);
        }

        // Update preview
        function updatePreview() {
          if (!state.isPreviewOpen) return;
          
          const preview = document.getElementById('preview');
          if (!preview) return;
          
          if (state.activeTab === 'markdown') {
            preview.innerHTML = marked.parse(state.markdown);
          } else {
            // For HTML/CSS/JS, we could create an iframe to show the actual rendered output
            // But for simplicity, we'll just show the code
            preview.innerHTML = `<pre><code>${state.activeTab === 'html' ? state.html : state.activeTab === 'css' ? state.css : state.js}</code></pre>`;
          }
        }
        
        updatePreview();

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
          state.isDarkMode = !state.isDarkMode;
          render();
        });

        // New tab button
        const newTabButton = document.getElementById('new-tab');
        newTabButton.addEventListener('click', () => {
          let content = '';
          if (state.activeTab === 'markdown') {
            content = marked.parse(state.markdown);
          } else {
            content = `
              <!DOCTYPE html>
              <html>
              <head>
                <style>${state.css}</style>
              </head>
              <body>
                ${state.html}
                <script>${state.js}<\/script>
              </body>
              </html>
            `;
          }
          
          const newWindow = window.open('', '_blank');
          newWindow.document.write(content);
          newWindow.document.close();
        });
      }

      // Initial render
      render();
    });
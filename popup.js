document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
  
    chrome.storage.local.get('focusModeEnabled', (data) => {
      if (data.focusModeEnabled) {
        toggleButton.textContent = 'Turn off Focus Mode';
        toggleButton.classList.add('off');
      } else {
        toggleButton.textContent = 'Turn on Focus Mode';
        toggleButton.classList.remove('off');
      }
    });
  
    toggleButton.addEventListener('click', () => {
      chrome.storage.local.get('focusModeEnabled', (data) => {
        const newValue = !data.focusModeEnabled;
        chrome.storage.local.set({ focusModeEnabled: newValue }, () => {
          if (newValue) {
            toggleButton.textContent = 'Turn off Focus Mode';
            toggleButton.classList.add('off');
          } else {
            toggleButton.textContent = 'Turn on Focus Mode';
            toggleButton.classList.remove('off');
          }
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            });
          });
        });
      });
    });
  });
  





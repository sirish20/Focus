(function() {
  // Overlay elements for focus mode
  const topOverlay = document.createElement('div');
  topOverlay.id = 'focus-top-overlay';
  const bottomOverlay = document.createElement('div');
  bottomOverlay.id = 'focus-bottom-overlay';
  const leftOverlay = document.createElement('div');
  leftOverlay.id = 'focus-left-overlay';
  const rightOverlay = document.createElement('div');
  rightOverlay.id = 'focus-right-overlay';

  document.body.appendChild(topOverlay);
  document.body.appendChild(bottomOverlay);
  document.body.appendChild(leftOverlay);
  document.body.appendChild(rightOverlay);

  let isVideoShrunk = false;
  let isPiPActive = false;

  function updateOverlay() {
    chrome.storage.local.get('focusModeEnabled', (data) => {
      const path = window.location.pathname;
      const isHomePage = path === '/' || path.startsWith('/feed');
      const video = document.querySelector('video');

      if (isHomePage || !data.focusModeEnabled) {
        topOverlay.style.display = bottomOverlay.style.display = leftOverlay.style.display = rightOverlay.style.display = 'none';
        return;
      }

      if (video) {
        const rect = video.getBoundingClientRect();

        topOverlay.style.height = `${rect.top}px`;
        topOverlay.style.width = '100%';

        bottomOverlay.style.top = `${rect.bottom}px`;
        bottomOverlay.style.height = `calc(100% - ${rect.bottom}px)`;
        bottomOverlay.style.width = '100%';

        leftOverlay.style.top = `${rect.top}px`;
        leftOverlay.style.height = `${rect.height}px`;
        leftOverlay.style.width = `${rect.left}px`;

        rightOverlay.style.top = `${rect.top}px`;
        rightOverlay.style.height = `${rect.height}px`;
        rightOverlay.style.left = `${rect.right}px`;
        rightOverlay.style.width = `calc(100% - ${rect.right}px)`;

        topOverlay.style.display = bottomOverlay.style.display = leftOverlay.style.display = rightOverlay.style.display = 'block';
      }
    });
  }

  function handleVisibilityChange() {
    chrome.storage.local.get('focusModeEnabled', (data) => {
      const video = document.querySelector('video');
      if (!video) return;

      if (data.focusModeEnabled) {
        if (document.hidden) {
          video.pause();
        } else {
          video.play();
        }
      }
    });
  }

  async function activatePiP() {
    const video = document.querySelector('video');
    if (!video) return;

    if (!isPiPActive) {
      try {
        await video.requestPictureInPicture();
        isPiPActive = true;
      } catch (error) {
        console.error('Failed to enter Picture-in-Picture mode:', error);
      }
    } else {
      try {
        document.exitPictureInPicture();
        isPiPActive = false;
      } catch (error) {
        console.error('Failed to exit Picture-in-Picture mode:', error);
      }
    }
  }

  // Listen for the key combination (e.g., Ctrl + Shift + P) for PiP and VS Code switch
  document.addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyZ') {
      await activatePiP();
      switchToVSCode();
    }
  });

  // Function to switch to VS Code
  function switchToVSCode() {
    // Send a message to a background script or use a platform-specific script (AHK for Windows or AppleScript for macOS)
    chrome.runtime.sendMessage({ action: 'switchToVSCode' });
  }

  // Reset video size if you navigate to a different page
  window.addEventListener('yt-navigate-finish', resetVideoSize);

  function resetVideoSize() {
    const video = document.querySelector('video');
    if (!video) return;

    video.style.position = '';
    video.style.bottom = '';
    video.style.left = '';
    video.style.width = '';
    video.style.height = '';
    video.style.zIndex = '';
    isVideoShrunk = false;
  }

  // Initialize everything
  function initialize() {
    updateOverlay();

    window.addEventListener('resize', updateOverlay);
    document.addEventListener('play', updateOverlay, true);
    document.addEventListener('pause', updateOverlay, true);
    document.addEventListener('seeked', updateOverlay, true);
    window.addEventListener('yt-navigate-finish', updateOverlay);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.focusModeEnabled) {
        updateOverlay();
        handleVisibilityChange(); // Update visibility change handling when the button state changes
      }
    });
  }

  initialize();
})();

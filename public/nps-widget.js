;(function () {
  if (window.__npsWidgetInitialized) return
  window.__npsWidgetInitialized = true

  const WIDGET_URL =
    window.NPS_WIDGET_URL || 'https://your-production-domain.com' // replace after deployment
  const widgetOrigin = (() => {
    try {
      return new URL(WIDGET_URL).origin
    } catch (error) {
      console.error('Invalid WIDGET_URL for NPS widget', error)
      return '*'
    }
  })()

  const styles = `
    .nps-launcher-btn {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 150px;
      border-radius: 12px 0 0 12px;
      background: #215fff;
      color: #fff;
      border: none;
      cursor: pointer;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .nps-launcher-btn:hover {
      transform: translateY(-50%) translateX(-4px);
      box-shadow: -6px 0 16px rgba(33, 95, 255, 0.4);
    }
    .nps-launcher-btn-text {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #fff;
      white-space: nowrap;
    }
    .nps-launcher-btn-icon {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: #fff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .nps-widget-overlay {
      position: fixed;
      inset: 0;
      background: transparent;
      display: none;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 0 26px 110px;
      z-index: 9999;
    }
    .nps-widget-overlay.active {
      display: flex;
    }
    .nps-widget-panel {
      position: relative;
      pointer-events: auto;
      border-radius: 16px;
      box-shadow: 0 35px 80px rgba(15, 23, 42, 0.35);
      background: #fff;
      overflow: hidden;
      animation: nps-slide-up 0.25s ease;
    }
    .nps-widget-frame {
      width: min(420px, 90vw);
      height: min(640px, 80vh);
      border: none;
    }
    .nps-widget-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background: rgba(15, 23, 42, 0.75);
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
    @keyframes nps-slide-up {
      from { transform: translateY(25px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `

  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  document.head.appendChild(styleEl)

  const button = document.createElement('button')
  button.className = 'nps-launcher-btn'
  button.setAttribute('aria-label', 'Open feedback survey')
  button.innerHTML = `
    <span class="nps-launcher-btn-text">Feedback</span>
    <svg class="nps-launcher-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none"/>
      <polyline points="14 2 14 8 20 8" fill="none"/>
      <line x1="16" y1="13" x2="8" y2="13" fill="none"/>
      <line x1="16" y1="17" x2="8" y2="17" fill="none"/>
      <polyline points="10 9 9 9 8 9" fill="none"/>
    </svg>
  `

  const overlay = document.createElement('div')
  overlay.className = 'nps-widget-overlay'

  const panel = document.createElement('div')
  panel.className = 'nps-widget-panel'

  const iframe = document.createElement('iframe')
  iframe.className = 'nps-widget-frame'
  iframe.src = WIDGET_URL
  iframe.title = 'Experience survey'
  iframe.loading = 'lazy'

  const closeBtn = document.createElement('button')
  closeBtn.className = 'nps-widget-close'
  closeBtn.innerHTML = '&times;'
  closeBtn.setAttribute('aria-label', 'Close survey')

  const STORAGE_KEY = 'nps-widget-closed'
  
  const closeOverlay = () => {
    try {
      iframe.contentWindow?.postMessage({ type: 'NPS_WIDGET_RESET' }, widgetOrigin)
    } catch (error) {
      // ignore cross-origin issues
    }
    overlay.classList.remove('active')
    iframe.src = WIDGET_URL
    // Remember that user closed the widget
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch (error) {
      // localStorage might not be available
    }
  }

  closeBtn.addEventListener('click', closeOverlay)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay()
    }
  })

  button.addEventListener('click', () => {
    overlay.classList.add('active')
  })

  // Listen for close message from the iframe (when feedback is submitted)
  window.addEventListener('message', (event) => {
    const originMatches = widgetOrigin === '*' || event.origin === widgetOrigin
    if (originMatches && event.data?.type === 'NPS_WIDGET_CLOSE') {
      closeOverlay()
    }
  })

  panel.appendChild(closeBtn)
  panel.appendChild(iframe)

  overlay.appendChild(panel)
  document.body.appendChild(button)
  document.body.appendChild(overlay)

  // Auto-open widget once if it hasn't been closed before
  const hasBeenClosed = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch (error) {
      return false
    }
  }

  // Wait for DOM to be ready and auto-open if needed
  const autoOpenWidget = () => {
    if (!hasBeenClosed()) {
      // Small delay to ensure everything is loaded
      setTimeout(() => {
        overlay.classList.add('active')
      }, 1000)
    }
  }

  // Auto-open on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoOpenWidget)
  } else {
    autoOpenWidget()
  }
})()


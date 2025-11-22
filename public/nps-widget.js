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
      right: 26px;
      bottom: 26px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0f62fe, #2563eb);
      color: #fff;
      border: none;
      box-shadow: 0 18px 30px rgba(15, 98, 254, 0.35);
      cursor: pointer;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
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
  button.innerHTML = '📝'

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

  const closeOverlay = () => {
    try {
      iframe.contentWindow?.postMessage({ type: 'NPS_WIDGET_RESET' }, widgetOrigin)
    } catch (error) {
      // ignore cross-origin issues
    }
    overlay.classList.remove('active')
    iframe.src = WIDGET_URL
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

  panel.appendChild(closeBtn)
  panel.appendChild(iframe)

  overlay.appendChild(panel)
  document.body.appendChild(button)
  document.body.appendChild(overlay)
})()


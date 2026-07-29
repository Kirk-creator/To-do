import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

declare global {
  interface Window {
    __DAILY_CHECKLIST_BOOTED__?: boolean
  }
}

if (!window.__DAILY_CHECKLIST_BOOTED__) {
  window.__DAILY_CHECKLIST_BOOTED__ = true
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

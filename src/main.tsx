import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GlobalSelectionDemo from './examples/GlobalSelectionDemo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalSelectionDemo />
  </StrictMode>,
)

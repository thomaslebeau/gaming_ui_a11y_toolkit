import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GameMenuExample from '../examples/GameMenuExample.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameMenuExample />
  </StrictMode>,
)

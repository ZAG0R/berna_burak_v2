import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/components.css'
import './styles/sections.css'
import './styles/extras.css'
import './styles/mobile.css'

const host = document.getElementById('root')
if (!host) throw new Error('#root bulunamadı')

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

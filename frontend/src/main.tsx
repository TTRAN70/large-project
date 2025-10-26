import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SearchModeProvider } from './lib/searchMode'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SearchModeProvider>
      <App />
    </SearchModeProvider>
  </StrictMode>,
)

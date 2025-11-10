import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if (typeof window !== 'undefined') {
  const host = window.location.hostname.replace(/^www\./, '');
  if (host === 'lifestring.co') {
    const target = 'https://lifestring.ai' + window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(target);
  }
}

createRoot(document.getElementById("root")!).render(<App />);

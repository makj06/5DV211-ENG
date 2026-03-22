import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const _fetch = window.fetch.bind(window);
window.fetch = (...args) => {
    const [url, options] = args;
    if (String(url).includes("/api/task")) {
        console.log("[fetch]", options?.method ?? "GET", url, options);
        console.trace();
    }
    return _fetch(...args);
};

createRoot(document.getElementById('root')).render(
    <App />
)

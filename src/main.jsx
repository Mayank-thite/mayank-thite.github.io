import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import { start, RM } from './sky/engine.js'

if (!RM) document.documentElement.classList.add('mo')
start(document.getElementById('sky'))
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)

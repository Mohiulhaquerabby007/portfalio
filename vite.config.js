import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import siteData from './vite-plugin-site-data.js'

// VITE_BASE lets the same code run at a domain root ("/", default) or under a sub-path such as
// GitHub Pages project sites ("/Portfolio-Ki6uiPar1na/").
export default defineConfig({ base: process.env.VITE_BASE || '/', plugins: [react(), siteData()] })

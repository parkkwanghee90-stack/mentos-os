import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './config/assets'
import { applyPromoFree } from './lib/promo'

// 🎉 3개월 전면무료 프로모: 렌더 전에 접근 플래그를 켜 페이월 깜빡임을 막는다.
applyPromoFree()


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

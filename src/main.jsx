import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './config/assets'
import { applyPromoFree } from './lib/promo'
import { captureRefFromUrl } from './lib/referral'

// 🎉 1개월 전면무료 프로모: 렌더 전에 접근 플래그를 켜 페이월 깜빡임을 막는다.
applyPromoFree()
// 🎟️ 추천 링크(?ref=코드)를 가장 먼저 캡처(가입 시 적립에 사용).
captureRefFromUrl()


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

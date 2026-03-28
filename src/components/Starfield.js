'use client'
import { useEffect, useRef } from 'react'

export default function Starfield({ opacity = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animFrame
    let stars = []
    let shootingStars = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      initStars()
    }

    function initStars() {
      stars = Array.from({ length: 300 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.75 ? `hsl(${200 + Math.random() * 120},70%,80%)` : '#e8eeff',
      }))
    }

    function spawnShoot() {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.6,
        y: Math.random() * canvas.height * 0.25,
        len: 0, maxLen: 80 + Math.random() * 100,
        speed: 10 + Math.random() * 6,
        alpha: 1, fading: false,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      })
    }

    const shootInterval = setInterval(spawnShoot, 3500)

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01

      stars.forEach(s => {
        s.alpha = 0.3 + 0.7 * Math.sin(t * s.speed * 10 + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = s.alpha * 0.8
        ctx.fill()
      })

      shootingStars.forEach((ss, i) => {
        if (!ss.fading) {
          ss.len = Math.min(ss.len + ss.speed, ss.maxLen)
          ss.x += ss.speed * 0.3 * Math.cos(ss.angle)
          ss.y += ss.speed * 0.3 * Math.sin(ss.angle)
          if (ss.len >= ss.maxLen) ss.fading = true
        } else {
          ss.alpha -= 0.035
          ss.x += ss.speed * Math.cos(ss.angle)
          ss.y += ss.speed * Math.sin(ss.angle)
        }
        if (ss.alpha <= 0) { shootingStars.splice(i, 1); return }

        const grad = ctx.createLinearGradient(ss.x, ss.y,
          ss.x - ss.len * Math.cos(ss.angle), ss.y - ss.len * Math.sin(ss.angle))
        grad.addColorStop(0, `rgba(200,230,255,${ss.alpha})`)
        grad.addColorStop(1, 'transparent')
        ctx.globalAlpha = ss.alpha
        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(ss.x - ss.len * Math.cos(ss.angle), ss.y - ss.len * Math.sin(ss.angle))
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      ctx.globalAlpha = 1
      animFrame = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(animFrame)
      clearInterval(shootInterval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none', opacity,
    }} />
  )
}

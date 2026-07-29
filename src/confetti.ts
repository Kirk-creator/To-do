import confetti from 'canvas-confetti'

export function celebrate() {
  const count = 160
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  }

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.35),
    spread: 55,
    startVelocity: 45,
    colors: ['#6b9b7a', '#e07a5f', '#d4a017', '#5b8fa8', '#f0e6d3'],
  })

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.3),
      spread: 80,
      startVelocity: 35,
      scalar: 0.9,
      colors: ['#c45c7a', '#9b7eb8', '#6b9b7a', '#f5c542'],
    })
  }, 120)

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#e07a5f', '#5b8fa8', '#d4a017', '#ffffff'],
    })
  }, 240)
}

export function celebrateAllDone() {
  const end = Date.now() + 1200
  const colors = ['#6b9b7a', '#e07a5f', '#d4a017', '#5b8fa8', '#c45c7a']

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 9999,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 9999,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

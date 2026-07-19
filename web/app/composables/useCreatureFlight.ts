export interface FlightObstacle {
  x: number
  y: number
  r: number
}

export interface FlightCreatureConfig {
  id: string
  kind: 'dragonfly' | 'bird'
  tone: 'text-secondary' | 'text-gold'
  size: number
  /** Bán kính "va chạm" ước lượng theo % màn hình — dùng để né nhau, khớp
   *  với kích thước hiển thị THẬT của từng loại (chim vẽ to hơn hẳn chuồn
   *  chuồn nên cần bán kính lớn hơn, không thể dùng chung 1 con số). */
  collisionRadius: number
  startX: number
  startY: number
}

export interface FlightCreatureState {
  id: string
  kind: 'dragonfly' | 'bird'
  tone: 'text-secondary' | 'text-gold'
  size: number
  collisionRadius: number
  x: number
  y: number
  angle: number
  landed: boolean
}

/**
 * Mô phỏng bay đơn giản (rút gọn kiểu "boids") cho chuồn chuồn/chim trong
 * LotusScene — thay cho hệ CSS @keyframes cố định trước đây (đường bay lặp
 * lại y hệt mỗi chu kỳ, không biết vị trí hoa/lá hay con khác).
 *
 * Yêu cầu mới BẮT BUỘC biết vị trí thời gian thực của môi trường xung quanh
 * (hoa/lá, mặt nước, con khác) — CSS @keyframes thuần không làm được, nên
 * chuyển sang vòng lặp `requestAnimationFrame` tính lực "lái" (steering)
 * mỗi khung hình: né chướng ngại vật, né mép nước, né va nhau, thỉnh
 * thoảng bay tới ĐẬU đúng 1 bông hoa rồi bay tiếp.
 *
 * Toạ độ tính theo % chiều rộng/cao khung nền (khớp `vw`/`vh` vì khung nền
 * luôn `fixed`/`absolute inset-0` bằng đúng viewport).
 */
export function useCreatureFlight(
  configs: FlightCreatureConfig[],
  obstacles: FlightObstacle[],
  waterTopPercent: number
) {
  const creatures = reactive<FlightCreatureState[]>(
    configs.map((c) => ({
      id: c.id,
      kind: c.kind,
      tone: c.tone,
      size: c.size,
      collisionRadius: c.collisionRadius,
      x: c.startX,
      y: c.startY,
      angle: 0,
      landed: false
    }))
  )

  interface Internal {
    state: 'fly' | 'seek'
    wanderAngle: number
    wanderTimer: number
    landCheckTimer: number
    landTimer: number
    targetIndex: number | null
    speed: number
    turnRate: number
  }

  const internals = new Map<string, Internal>()
  for (const c of configs) {
    internals.set(c.id, {
      state: 'fly',
      wanderAngle: Math.random() * Math.PI * 2,
      wanderTimer: Math.random() * 3,
      landCheckTimer: 6 + Math.random() * 10,
      landTimer: 0,
      targetIndex: null,
      // Chuồn chuồn bay nhanh/đổi hướng gấp hơn chim (đúng đặc tính thật:
      // chuồn chuồn lượn giật, chim bay đường cong mượt hơn) — đã giảm tốc
      // độ tổng thể theo phản hồi "bay nhanh quá".
      speed: c.kind === 'dragonfly' ? 3 + Math.random() * 1.5 : 1.8 + Math.random() * 0.8,
      turnRate: c.kind === 'dragonfly' ? 1.7 : 0.75
    })
  }

  const claimed = new Set<number>()

  function pickFreeFlowerIndex(): number | null {
    const free: number[] = []
    for (let i = 0; i < obstacles.length; i++) {
      if (!claimed.has(i)) free.push(i)
    }
    if (free.length === 0) return null
    return free[Math.floor(Math.random() * free.length)] ?? null
  }

  function normalizeAngle(a: number): number {
    let out = a
    while (out > Math.PI) out -= Math.PI * 2
    while (out < -Math.PI) out += Math.PI * 2
    return out
  }

  function step(c: FlightCreatureState, dt: number) {
    const s = internals.get(c.id)
    if (!s) return

    if (c.landed) {
      s.landTimer -= dt
      if (s.landTimer <= 0) {
        c.landed = false
        s.state = 'fly'
        s.wanderAngle = c.angle + Math.PI + (Math.random() - 0.5)
        s.wanderTimer = 0
        if (s.targetIndex !== null) claimed.delete(s.targetIndex)
        s.targetIndex = null
      }
      return
    }

    let desiredAngle: number

    if (s.state === 'seek' && s.targetIndex !== null) {
      const target = obstacles[s.targetIndex]
      if (!target) {
        s.state = 'fly'
        desiredAngle = c.angle
      } else {
        const dx = target.x - c.x
        const dy = target.y - c.y
        const dist = Math.hypot(dx, dy)
        if (dist < 2.2) {
          c.landed = true
          c.x = target.x
          c.y = target.y
          s.landTimer = 4 + Math.random() * 5
          return
        }
        desiredAngle = Math.atan2(dy, dx)
      }
    } else {
      s.wanderTimer -= dt
      if (s.wanderTimer <= 0) {
        s.wanderAngle = c.angle + (Math.random() - 0.5) * 1.7
        s.wanderTimer = 2 + Math.random() * 3
      }
      desiredAngle = s.wanderAngle

      s.landCheckTimer -= dt
      if (s.landCheckTimer <= 0) {
        s.landCheckTimer = 14 + Math.random() * 16
        if (Math.random() < 0.5) {
          const idx = pickFreeFlowerIndex()
          if (idx !== null) {
            s.state = 'seek'
            s.targetIndex = idx
            claimed.add(idx)
          }
        }
      }
    }

    let steerX = Math.cos(desiredAngle)
    let steerY = Math.sin(desiredAngle)

    // Né hoa/lá (trừ đúng bông đang bay tới để đậu)
    for (let i = 0; i < obstacles.length; i++) {
      if (s.state === 'seek' && i === s.targetIndex) continue
      const ob = obstacles[i]
      if (!ob) continue
      const dx = c.x - ob.x
      const dy = c.y - ob.y
      const dist = Math.hypot(dx, dy)
      const margin = ob.r + 6
      if (dist < margin && dist > 0.001) {
        const push = (margin - dist) / margin
        steerX += (dx / dist) * push * 2.4
        steerY += (dy / dist) * push * 2.4
      }
    }

    // Né va chạm với chuồn chuồn/chim khác
    for (const other of creatures) {
      if (other === c) continue
      const dx = c.x - other.x
      const dy = c.y - other.y
      const dist = Math.hypot(dx, dy)
      // Cộng bán kính va chạm của cả 2 con (chim to hơn hẳn chuồn chuồn nên
      // cần né xa hơn) thay vì 1 con số cố định cho mọi cặp như trước.
      const margin = c.collisionRadius + other.collisionRadius
      if (dist < margin && dist > 0.001) {
        const push = (margin - dist) / margin
        steerX += (dx / dist) * push * 1.8
        steerY += (dy / dist) * push * 1.8
      }
    }

    // Không bay xuống vùng nước
    const waterMargin = 7
    if (c.y > waterTopPercent - waterMargin) {
      const push = Math.min(1, (c.y - (waterTopPercent - waterMargin)) / waterMargin)
      steerY -= push * 3
    }
    // Biên màn hình
    if (c.x < 6) steerX += ((6 - c.x) / 6) * 2
    if (c.x > 94) steerX -= ((c.x - 94) / 6) * 2
    if (c.y < 4) steerY += ((4 - c.y) / 4) * 2

    const targetAngle = Math.atan2(steerY, steerX)
    let diff = normalizeAngle(targetAngle - c.angle)
    const maxTurn = s.turnRate * dt
    diff = Math.max(-maxTurn, Math.min(maxTurn, diff))
    c.angle = normalizeAngle(c.angle + diff)

    c.x += Math.cos(c.angle) * s.speed * dt
    c.y += Math.sin(c.angle) * s.speed * dt
    c.x = Math.max(1, Math.min(99, c.x))
    c.y = Math.max(1, Math.min(waterTopPercent, c.y))
  }

  let rafId = 0
  let lastTime = 0
  let running = false

  function tick(now: number) {
    if (!running) return
    const dt = Math.min(0.05, (now - lastTime) / 1000)
    lastTime = now
    for (const c of creatures) step(c, dt)
    rafId = requestAnimationFrame(tick)
  }

  onMounted(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    running = true
    lastTime = performance.now()
    rafId = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    running = false
    cancelAnimationFrame(rafId)
  })

  return { creatures }
}

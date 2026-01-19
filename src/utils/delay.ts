/**
 * Simulate network delay for realistic UX
 * Uses random variance to feel more natural
 */

import { SIMULATED_DELAY } from '@/constants'

export function simulateDelay(
  baseMs: number = SIMULATED_DELAY.BASE_MS,
  variance: number = SIMULATED_DELAY.VARIANCE
): Promise<void> {
  const delay = baseMs + Math.random() * variance
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulate occasional slower responses (simulates server load)
 */
export function simulateNetworkDelay(): Promise<void> {
  // 10% chance of slower response (300-500ms)
  // 90% chance of fast response (50-150ms)
  const isSlowResponse = Math.random() < SIMULATED_DELAY.SLOW_CHANCE
  return isSlowResponse
    ? simulateDelay(SIMULATED_DELAY.SLOW_BASE_MS, SIMULATED_DELAY.SLOW_VARIANCE)
    : simulateDelay(SIMULATED_DELAY.FAST_BASE_MS, SIMULATED_DELAY.FAST_VARIANCE)
}

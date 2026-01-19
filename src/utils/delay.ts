/**
 * Simulate network delay for realistic UX
 * Uses random variance to feel more natural
 */
export function simulateDelay(baseMs = 200, variance = 100): Promise<void> {
  const delay = baseMs + Math.random() * variance
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulate occasional slower responses (simulates server load)
 */
export function simulateNetworkDelay(): Promise<void> {
  // 10% chance of slower response (300-500ms)
  // 90% chance of fast response (50-150ms)
  const isSlowResponse = Math.random() < 0.1
  return isSlowResponse
    ? simulateDelay(300, 200)
    : simulateDelay(50, 100)
}

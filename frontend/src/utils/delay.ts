/**
 * Delay utilities for simulating network latency
 */

import { STORAGE_SIMULATION } from '@/constants'

/**
 * Simulate a network delay
 * Used in mock repositories to simulate realistic API response times
 */
export async function simulateNetworkDelay(): Promise<void> {
  const delay =
    Math.random() * (STORAGE_SIMULATION.MAX_DELAY - STORAGE_SIMULATION.MIN_DELAY) +
    STORAGE_SIMULATION.MIN_DELAY
  await new Promise((resolve) => setTimeout(resolve, delay))
}

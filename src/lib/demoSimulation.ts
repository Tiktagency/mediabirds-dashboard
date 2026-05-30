/**
 * Simulates an automation run for demo users by waiting `durationSec`
 * seconds and then resolving. No webhook/edge function is called.
 *
 * Used together with `useAutomationProgress` so the existing
 * start → await → complete flow remains identical.
 */
export const simulateAutomation = (durationSec: number) =>
  new Promise<void>(resolve => setTimeout(resolve, Math.max(0, durationSec) * 1000));

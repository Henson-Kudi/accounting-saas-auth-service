export default function calculateBackoffDelay(
  attempt: number,
  baseDelay = 1000
): number {
  const MAX_BACKOFF_DELAY = 3000; // SHOULD DELAY MAX OF 3SECS BEFORE RESUME FUNCTION
  // Exponential backoff with jitter
  const jitter = Math.random() * baseDelay;
  return Math.min(baseDelay * 2 ** (attempt - 1) + jitter, MAX_BACKOFF_DELAY);
}

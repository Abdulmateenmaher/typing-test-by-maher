/**
 * Maher Typing Arcadia - Anti-Cheat & Bot Security Engine
 * Prevents web console script injections, automated key dispatchers,
 * inhuman WPM manipulation, paste abuse, and fraudulent leaderboard submissions.
 */

export const MAX_HUMAN_WPM = 400;
export const MAX_HUMAN_RAW_WPM = 280;
export const MIN_INTER_KEYSTROKE_INTERVAL_MS = 18; // Physically impossible for human finger alternation
export const MAX_CHARS_PER_SECOND = 25; // ~300 WPM burst limit
export const MIN_VALID_TEST_DURATION_SEC = 2.0;
export const MIN_LEGITIMATE_ACCURACY = 50;

export interface SecurityCheckResult {
  safe: boolean;
  reason?: string;
}

/**
 * Validates that an input or keyboard event originated from a genuine physical human interaction.
 * Native browser security guarantees event.isTrusted === true ONLY for physical hardware inputs.
 */
export function verifyEventSecurity(
  e: React.SyntheticEvent | Event | React.KeyboardEvent | React.ChangeEvent
): SecurityCheckResult {
  // Check SyntheticEvent
  const native = 'nativeEvent' in e ? (e.nativeEvent as Event) : e;

  if (native.isTrusted === false || ('isTrusted' in e && (e as any).isTrusted === false)) {
    return {
      safe: false,
      reason: 'Automated script injection detected (synthetic isTrusted: false).'
    };
  }

  return { safe: true };
}

/**
 * Anti-Cheat Keystroke Timing Analyzer
 * Detects macros, console script loops, and zero-latency character injections.
 */
export class KeystrokeAntiCheat {
  private lastKeystrokeTime: number | null = null;
  private recentIntervals: number[] = [];
  private zeroIntervalCount = 0;
  private violationCount = 0;

  public reset(): void {
    this.lastKeystrokeTime = null;
    this.recentIntervals = [];
    this.zeroIntervalCount = 0;
    this.violationCount = 0;
  }

  /**
   * Registers a keystroke and checks for impossible timing patterns
   */
  public registerKeystroke(): SecurityCheckResult {
    const now = performance.now();

    if (this.lastKeystrokeTime !== null) {
      const interval = now - this.lastKeystrokeTime;

      // 0ms or sub-5ms intervals indicate synchronous console script loops
      if (interval <= 5) {
        this.zeroIntervalCount++;
        if (this.zeroIntervalCount >= 2) {
          this.violationCount += 5;
          return {
            safe: false,
            reason: 'Inhuman keystroke frequency detected (sub-5ms execution loop).'
          };
        }
      } else {
        this.zeroIntervalCount = Math.max(0, this.zeroIntervalCount - 1);
      }

      // Track last 20 intervals for standard deviation check
      this.recentIntervals.push(interval);
      if (this.recentIntervals.length > 20) {
        this.recentIntervals.shift();
      }

      // If we have at least 15 keystrokes, verify latency variance
      // Humans have natural motor noise (variance > 4ms), whereas console setInterval bots have exact fixed intervals
      if (this.recentIntervals.length >= 15) {
        const mean = this.recentIntervals.reduce((a, b) => a + b, 0) / this.recentIntervals.length;
        const variance = this.recentIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.recentIntervals.length;
        const stdDev = Math.sqrt(variance);

        // Inhuman burst: Average interval < 25ms (which translates to > 400 WPM)
        if (mean < 28) {
          this.violationCount += 3;
          return {
            safe: false,
            reason: 'Inhuman typing velocity (sustained > 400 WPM keystroke rate).'
          };
        }

        // Exact bot cadence: average speed is high (< 80ms) and standard deviation is near 0 (< 1.5ms)
        if (mean < 80 && stdDev < 1.5) {
          this.violationCount += 2;
          return {
            safe: false,
            reason: 'Deterministic bot cadence detected (synthetic zero-variance interval).'
          };
        }
      }
    }

    this.lastKeystrokeTime = now;

    if (this.violationCount >= 3) {
      return {
        safe: false,
        reason: 'Multiple anti-cheat security violations triggered.'
      };
    }

    return { safe: true };
  }
}

/**
 * Validates whether a completed test score is authentic and complies with physical human limits.
 */
export function validateTestScore(
  wpm: number,
  rawWpm: number,
  durationSec: number,
  totalChars: number,
  accuracy: number
): SecurityCheckResult {
  // Reject absolute impossibility
  if (wpm > MAX_HUMAN_WPM) {
    return {
      safe: false,
      reason: `Flagged: WPM (${wpm}) exceeds physical human limit (${MAX_HUMAN_WPM} WPM).`
    };
  }

  if (rawWpm > MAX_HUMAN_RAW_WPM) {
    return {
      safe: false,
      reason: `Flagged: Raw WPM (${rawWpm}) exceeds physical speed boundary (${MAX_HUMAN_RAW_WPM} WPM).`
    };
  }

  // Reject impossible character throughput
  const effectiveDuration = Math.max(0.2, durationSec);
  const charsPerSecond = totalChars / effectiveDuration;
  if (charsPerSecond > MAX_CHARS_PER_SECOND && totalChars > 25) {
    return {
      safe: false,
      reason: `Flagged: Keystroke throughput (${charsPerSecond.toFixed(1)} chars/sec) is impossible for human input.`
    };
  }

  // Minimum duration check for non-trivial character count
  if (durationSec < MIN_VALID_TEST_DURATION_SEC && totalChars > 30) {
    return {
      safe: false,
      reason: 'Flagged: Test completed in impossibly brief duration.'
    };
  }

  // Suspicious accuracy profile for extreme speeds
  if (wpm > 180 && accuracy < MIN_LEGITIMATE_ACCURACY) {
    return {
      safe: false,
      reason: 'Flagged: Disqualified due to anomalous speed-to-accuracy ratio.'
    };
  }

  return { safe: true };
}

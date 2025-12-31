/**
 * activeUsers.service.js
 *
 * TTL-based active user tracking.
 * A user stays "active" only if they hit the API within the last ACTIVE_TTL ms.
 */

const ACTIVE_TTL = 5 * 60 * 1000; // 5 minutes

class ActiveUsersTTL {
  constructor() {
    this.users = new Map();
  }

  /**
   * Mark a user as active with a timestamp.
   */
  touch(userIdMasked) {
    this.users.set(userIdMasked, Date.now());
  }

  /**
   * Count only users that are still within TTL.
   */
  countActive() {
    const now = Date.now();
    for (const [user, lastSeen] of this.users.entries()) {
      if (now - lastSeen > ACTIVE_TTL) {
        this.users.delete(user);
      }
    }
    return this.users.size;
  }
}

export const activeUsersTTL = new ActiveUsersTTL();

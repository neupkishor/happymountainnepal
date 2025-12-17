import { randomBytes } from 'crypto';

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Generate a random session key
 */
export function generateSessionKey(): string {
    return randomBytes(64).toString('hex');
}

/**
 * Generate a random device ID
 */
export function generateDeviceId(): string {
    return randomBytes(16).toString('hex');
}

/**
 * Session data structure
 */
export interface SessionData {
    session_id: string;
    session_key: string;
    device_id: string;
    username: string;
    created_at: string;
    expires_at: string;
    isExpired: number; // 0 = active, 1 = expired/invalidated
}

/**
 * Create a new session
 */
export function createSession(username: string): SessionData {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
        session_id: generateSessionId(),
        session_key: generateSessionKey(),
        device_id: generateDeviceId(),
        username,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        isExpired: 0, // 0 = active
    };
}

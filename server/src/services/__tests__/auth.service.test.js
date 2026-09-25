import { describe, it, expect, vi, beforeEach } from 'vitest';

// These are lightweight unit tests for logic that doesn't require a live DB.
// Full register/login/refresh flows are covered by integration tests (Phase 34)
// against a test MongoDB instance (e.g. mongodb-memory-server).

vi.mock('../../models/User.model.js', () => ({
  User: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn() },
}));

import { hashToken } from '../token.service.js';

describe('token.service', () => {
  it('hashToken produces a deterministic sha256 hex digest', () => {
    const a = hashToken('same-input');
    const b = hashToken('same-input');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashToken produces different output for different input', () => {
    expect(hashToken('input-a')).not.toBe(hashToken('input-b'));
  });
});

describe('ApiError', () => {
  it('unauthorized() builds a 401 with default code', async () => {
    const { ApiError } = await import('../../utils/ApiError.js');
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('conflict() builds a 409', async () => {
    const { ApiError } = await import('../../utils/ApiError.js');
    const err = ApiError.conflict('EMAIL_TAKEN', 'taken');
    expect(err.statusCode).toBe(409);
  });
});

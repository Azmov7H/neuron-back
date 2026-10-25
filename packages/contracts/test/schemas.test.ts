import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  NeuralPathQuerySchema,
  UpdateCognitiveProfileSchema,
  RecordInteractionSchema,
  AddKnowledgeNodeSchema,
  CreateConceptSchema,
  SearchQuerySchema,
  SUPPORTED_DOMAINS,
} from '../src/index.js';

describe('auth schemas', () => {
  it('normalizes username and email for registration', () => {
    const parsed = RegisterSchema.parse({
      username: 'ada_lovelace',
      email: '  ADA@Example.COM ',
      password: 'Str0ngPass',
      confirmPassword: 'Str0ngPass',
      preferredDomain: 'physics',
    });
    expect(parsed.username).toBe('ada_lovelace');
    expect(parsed.email).toBe('ada@example.com');
  });

  it('reports the password mismatch on confirmPassword', () => {
    const parsed = RegisterSchema.safeParse({
      username: 'ada',
      email: 'ada@example.com',
      password: 'Str0ngPass',
      confirmPassword: 'Different1',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['confirmPassword']);
      expect(parsed.error.issues[0]?.message).toBe('Passwords do not match');
    }
  });

  it('rejects weak passwords with the legacy message', () => {
    const parsed = RegisterSchema.safeParse({
      username: 'ada',
      email: 'ada@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(parsed.success).toBe(false);
  });

  it('normalizes login email and accepts usernames in the email field', () => {
    expect(LoginSchema.parse({ email: ' ADA@EXAMPLE.COM ', password: 'x' }).email).toBe(
      'ada@example.com',
    );
  });

  it('keeps profile and neural-path coercion behavior', () => {
    expect(UpdateProfileSchema.parse({ preferredDomains: ['physics'] })).toEqual({
      preferredDomains: ['physics'],
    });
    expect(NeuralPathQuerySchema.parse({ page: '2', limit: '5' })).toMatchObject({
      page: 2,
      limit: 5,
      sort: 'popular',
    });
  });
});

describe('cognitive schemas', () => {
  it('bounds cognitive metrics to 0..100', () => {
    expect(UpdateCognitiveProfileSchema.safeParse({ curiosity: 101 }).success).toBe(false);
    expect(UpdateCognitiveProfileSchema.safeParse({ curiosity: 100 }).success).toBe(true);
  });

  it('accepts the frozen interaction vocabulary', () => {
    expect(RecordInteractionSchema.parse({ type: 'simulation', targetId: 'motion' })).toMatchObject(
      {
        type: 'simulation',
        targetId: 'motion',
      },
    );
    expect(RecordInteractionSchema.safeParse({ type: 'teleport', targetId: 'x' }).success).toBe(
      false,
    );
  });
});

describe('knowledge schemas', () => {
  it('exposes all 18 knowledge domains', () => {
    expect(SUPPORTED_DOMAINS).toHaveLength(18);
    expect(SUPPORTED_DOMAINS).toContain('quantum-mechanics');
    expect(SUPPORTED_DOMAINS).toContain('philosophy-of-science');
  });

  it('validates a minimal concept with kebab-case ids', () => {
    const minimal = {
      conceptId: 'special-relativity',
      slug: 'special-relativity',
      title: 'Special Relativity',
      summary: 'Time dilation and length contraction.',
      scientificDefinition: 'The physics of inertial frames at constant light speed.',
      field: 'physics',
    };
    expect(CreateConceptSchema.safeParse(minimal).success).toBe(true);
    expect(CreateConceptSchema.safeParse({ ...minimal, conceptId: 'Not Kebab' }).success).toBe(
      false,
    );
  });

  it('accepts knowledge-graph nodes and search queries', () => {
    expect(
      AddKnowledgeNodeSchema.parse({ conceptId: 'x', title: 'X', domain: 'physics' }),
    ).toMatchObject({ conceptId: 'x' });
    expect(SearchQuerySchema.parse({ q: 'relativity' })).toMatchObject({ q: 'relativity' });
  });
});

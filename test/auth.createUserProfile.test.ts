import { describe, it, beforeEach, expect, vi } from 'vitest'

// Prevent real Firebase initialization by mocking firebase modules used by client/src/lib/firebase.ts
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}))

// Mock firebase/firestore functions used by auth.createUserProfile
vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn(() => 'docRef'),
    setDoc: vi.fn(() => Promise.resolve()),
    getDoc: vi.fn()
  }
})

import { createUserProfile } from '../client/src/lib/auth'
import * as firestore from 'firebase/firestore'

describe('createUserProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('creates a full profile with default tips when user doc does not exist', async () => {
    // getDoc should return an object where exists() is false
  ;(firestore.getDoc as any).mockResolvedValueOnce({ exists: () => false })

    const fakeUser = {
      uid: 'user123',
      displayName: 'Kyle Test',
      email: 'kyle@example.com'
    }

    await createUserProfile(fakeUser as any, { primaryCondition: 'diabetes' } as any)

    expect(firestore.doc).toHaveBeenCalled()
    expect(firestore.setDoc).toHaveBeenCalledTimes(1)

    const [calledRef, calledData] = (firestore.setDoc as unknown as any).mock.calls[0]
    expect(calledRef).toBe('docRef')
    // basic checks on saved data
    expect(calledData).toHaveProperty('uid', 'user123')
    expect(calledData).toHaveProperty('name', 'Kyle Test')
    expect(calledData).toHaveProperty('email', 'kyle@example.com')
    expect(calledData).toHaveProperty('tips')
    expect(Array.isArray(calledData.tips)).toBe(true)
    expect(calledData.isProfileComplete).toBe(false)
  })

  it('does nothing when user doc already exists', async () => {
  ;(firestore.getDoc as any).mockResolvedValueOnce({ exists: () => true })

    const fakeUser = { uid: 'u2', displayName: 'Existing', email: 'e@example.com' }
    await createUserProfile(fakeUser as any)

    expect(firestore.setDoc).not.toHaveBeenCalled()
  })
})

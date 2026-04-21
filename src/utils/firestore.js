import { doc } from 'firebase/firestore'
import { db } from '../firebase'

// This helper points every signed-in user to their own private Firestore document.
export function getUserDataDoc(userId) {
  return doc(db, 'users', userId, 'private', 'myBills')
}

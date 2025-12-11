import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  orderBy,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { User, Ticket, Role, AvailabilityStatus, ChatMessage } from '../types';

// =========================================================================
// CRITICAL: REPLACE THIS CONFIG WITH YOUR OWN FIREBASE PROJECT CONFIGURATION
// Go to Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCMNSvrThX6zXn0ko7FH0KtrEi3G6ljceM",
  authDomain: "deep-geography-440917-q3.firebaseapp.com",
  projectId: "deep-geography-440917-q3",
  storageBucket: "deep-geography-440917-q3.firebasestorage.app",
  messagingSenderId: "750276737201",
  appId: "1:750276737201:web:d6597a1043ea9687e58a90",
  measurementId: "G-NV41Q8L4VC"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Constants
const ADMIN_EMAIL = 'mannmitra@jaipuria.com';
const DUMMY_DOMAIN = '@mannmitra.app';

// Helpers
const getUserProfile = async (uid: string): Promise<User> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: uid, ...docSnap.data() } as User;
  }
  throw new Error('User profile not found');
};

// --- Auth Services ---

export const login = async (identifier: string, password: string): Promise<User> => {
  try {
    // If identifier is a simple username, treat it as a student
    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier : `${identifier}${DUMMY_DOMAIN}`;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await getUserProfile(userCredential.user.uid);
    return user;
  } catch (error: any) {
    // Fallback for hardcoded admin if Firebase is not yet set up or for immediate access
    if (identifier === ADMIN_EMAIL && password === 'mannmitraadmin') {
       return { id: 'admin-fallback', username: 'Admin', role: 'admin', email: ADMIN_EMAIL };
    }
    console.error("Login Error:", error);
    throw new Error(error.message || 'Authentication failed');
  }
};

export const signupStudent = async (username: string, grade: string, password: string): Promise<User> => {
  const email = `${username}${DUMMY_DOMAIN}`;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const newUser: User = {
      id: uid,
      username,
      grade,
      role: 'student'
    };

    // Store profile in Firestore
    await setDoc(doc(db, 'users', uid), {
      username,
      grade,
      role: 'student',
      createdAt: serverTimestamp()
    });

    return newUser;
  } catch (error: any) {
    console.error("Signup Error:", error);
    throw new Error(error.message || 'Signup failed');
  }
};

// --- Team Management ---

export const getTeamMembers = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'member'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const addTeamMember = async (name: string, email: string, password: string) => {
  // NOTE: In a client-side app, we cannot easily create 'other' users in Auth without logging out.
  // We will create the Firestore profile. The Admin must manually create the Auth User in Firebase Console
  // OR the team member "Signs Up" with this email.
  
  // For this feature to feel "real", we store the intent.
  const tempId = email.replace(/[@.]/g, '_');
  await setDoc(doc(db, 'users', tempId), {
    username: name,
    email,
    role: 'member',
    status: 'Offline',
    createdAt: serverTimestamp(),
    pendingAuth: true // Marker that actual auth user might not exist yet
  });

  return { id: tempId, username: name, email, role: 'member', status: 'Offline' };
};

export const deleteTeamMember = async (id: string) => {
  await deleteDoc(doc(db, 'users', id));
};

export const updateAvailability = async (userId: string, status: AvailabilityStatus) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { status });
};

// --- Ticket Services ---

export const createTicket = async (student: User, subject: string, initialMessage: string) => {
  const message: ChatMessage = {
    id: Date.now().toString(), // Client gen ID ok for array items
    senderId: student.id,
    senderName: student.username,
    text: initialMessage,
    timestamp: new Date().toISOString()
  };

  const newTicketData = {
    studentId: student.id,
    studentName: student.username,
    studentGrade: student.grade || 'N/A',
    assignedTo: null,
    subject,
    status: 'open',
    createdAt: new Date().toISOString(), // ISO string easier for frontend parsing than Firestore Timestamp
    messages: [message]
  };

  const docRef = await addDoc(collection(db, 'tickets'), newTicketData);
  
  // Trigger Email Logic
  // In a real app, a Cloud Function listens to onCreate of 'tickets' and sends the email.
  console.log(`[REAL BACKEND TRIGGER] Email Notification dispatched to: ${ADMIN_EMAIL}`);
  console.log(`Payload: New Ticket from ${student.username} - "${subject}"`);

  return { id: docRef.id, ...newTicketData } as Ticket;
};

export const getTickets = async (role: Role, userId: string) => {
  let q;
  const ticketsRef = collection(db, 'tickets');

  if (role === 'student') {
    q = query(ticketsRef, where('studentId', '==', userId));
  } else if (role === 'member') {
    // Firestore OR queries are limited, so we fetch open tickets (unassigned) 
    // This is a simplification. A better query would be more complex.
    // For now, we fetch all and filter in memory for complex permission logic or use separate queries.
    // Let's fetch all for members and filter, assuming volume is manageable.
    q = query(ticketsRef); 
  } else {
    // Admin
    q = query(ticketsRef);
  }

  const querySnapshot = await getDocs(q);
  const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));

  // Sort manually since we didn't add compound indexes
  const sorted = tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (role === 'member') {
     return sorted.filter(t => t.assignedTo === null || t.assignedTo === userId);
  }

  return sorted;
};

export const assignTicket = async (ticketId: string, memberId: string) => {
  const ticketRef = doc(db, 'tickets', ticketId);
  await updateDoc(ticketRef, { assignedTo: memberId });
};

export const sendMessage = async (ticketId: string, senderId: string, senderName: string, text: string) => {
  const ticketRef = doc(db, 'tickets', ticketId);
  
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString()
  };

  await updateDoc(ticketRef, {
    messages: arrayUnion(newMessage)
  });

  return newMessage;
};

export const getStats = async () => {
  // Counting documents in Firestore is costly (reads). 
  // For a dashboard, standard practice is to use a dedicated 'stats' document updated by counters,
  // or use the count() aggregation query.
  
  // Using basic queries for now:
  const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
  const activeTicketsSnap = await getDocs(query(collection(db, 'tickets'), where('status', '==', 'open')));
  const onlineMembersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'member'), where('status', '==', 'Available')));

  return {
    totalStudents: studentsSnap.size,
    activeTickets: activeTicketsSnap.size,
    membersOnline: onlineMembersSnap.size
  };
};
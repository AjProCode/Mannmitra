import { User, Ticket, Role, AvailabilityStatus, ChatMessage } from '../types';

// Constants
const STORAGE_USERS = 'mannmitra_users';
const STORAGE_TICKETS = 'mannmitra_tickets';
const ADMIN_EMAIL = 'mannmitra@jaipuria.com';

// Helpers
const getStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth Services ---

export const login = async (identifier: string, password: string): Promise<User> => {
  await delay(500); // Simulate network

  // Admin Check
  if (identifier === ADMIN_EMAIL && password === 'mannmitraadmin') {
    return { id: 'admin', username: 'Admin', role: 'admin', email: ADMIN_EMAIL };
  }

  const users = getStorage(STORAGE_USERS);
  // Check email for members, username for students
  const user = users.find((u: any) => 
    (u.email === identifier || u.username === identifier) && u.password === password
  );

  if (!user) throw new Error('Invalid credentials');
  
  // Return sanitized user
  const { password: _, ...safeUser } = user;
  return safeUser;
};

export const signupStudent = async (username: string, grade: string, password: string): Promise<User> => {
  await delay(500);
  const users = getStorage(STORAGE_USERS);
  
  if (users.find((u: any) => u.username === username)) {
    throw new Error('Username already taken');
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    grade,
    password,
    role: 'student' as Role
  };

  users.push(newUser);
  setStorage(STORAGE_USERS, users);

  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

// --- Team Management ---

export const getTeamMembers = async () => {
  const users = getStorage(STORAGE_USERS);
  return users.filter((u: any) => u.role === 'member').map(({password, ...u}: any) => u);
};

export const addTeamMember = async (name: string, email: string, password: string) => {
  await delay(300);
  const users = getStorage(STORAGE_USERS);
  if (users.find((u: any) => u.email === email)) throw new Error('Email already exists');

  const newMember = {
    id: Date.now().toString(),
    username: name,
    email,
    password,
    role: 'member',
    status: 'Offline' as AvailabilityStatus
  };

  users.push(newMember);
  setStorage(STORAGE_USERS, users);
  return newMember;
};

export const deleteTeamMember = async (id: string) => {
  let users = getStorage(STORAGE_USERS);
  users = users.filter((u: any) => u.id !== id);
  setStorage(STORAGE_USERS, users);
};

export const updateAvailability = async (userId: string, status: AvailabilityStatus) => {
  const users = getStorage(STORAGE_USERS);
  const index = users.findIndex((u: any) => u.id === userId);
  if (index !== -1) {
    users[index].status = status;
    setStorage(STORAGE_USERS, users);
  }
};

// --- Ticket Services ---

export const createTicket = async (student: User, subject: string, initialMessage: string) => {
  await delay(300);
  const tickets = getStorage(STORAGE_TICKETS);
  
  const newTicket: Ticket = {
    id: Date.now().toString(),
    studentId: student.id,
    studentName: student.username,
    studentGrade: student.grade || 'N/A',
    assignedTo: null,
    subject,
    status: 'open',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: Date.now().toString(),
        senderId: student.id,
        senderName: student.username,
        text: initialMessage,
        timestamp: new Date().toISOString()
      }
    ]
  };

  tickets.push(newTicket);
  setStorage(STORAGE_TICKETS, tickets);

  // Mock Email Notification
  console.log(`%c[Mock Email Service] Sent to ${ADMIN_EMAIL}`, "color: yellow; font-weight: bold; background: black; padding: 4px;");
  console.log(`Subject: New Help Request from ${student.username} (Grade ${student.grade})`);
  console.log(`Body: ${subject} - ${initialMessage}`);
  
  return newTicket;
};

export const getTickets = async (role: Role, userId: string) => {
  await delay(200);
  const tickets = getStorage(STORAGE_TICKETS);
  
  if (role === 'student') {
    return tickets.filter((t: Ticket) => t.studentId === userId).reverse();
  } else if (role === 'member') {
    // Members see unassigned tickets OR tickets assigned to them
    return tickets.filter((t: Ticket) => t.assignedTo === null || t.assignedTo === userId).reverse();
  } else if (role === 'admin') {
    // Admin sees all
    return tickets.reverse();
  }
  return [];
};

export const assignTicket = async (ticketId: string, memberId: string) => {
  const tickets = getStorage(STORAGE_TICKETS);
  const ticket = tickets.find((t: Ticket) => t.id === ticketId);
  if (ticket) {
    ticket.assignedTo = memberId;
    setStorage(STORAGE_TICKETS, tickets);
  }
};

export const sendMessage = async (ticketId: string, senderId: string, senderName: string, text: string) => {
  const tickets = getStorage(STORAGE_TICKETS);
  const ticket = tickets.find((t: Ticket) => t.id === ticketId);
  if (ticket) {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };
    ticket.messages.push(newMessage);
    setStorage(STORAGE_TICKETS, tickets);
    return newMessage;
  }
  throw new Error('Ticket not found');
};

export const getStats = async () => {
  const users = getStorage(STORAGE_USERS);
  const tickets = getStorage(STORAGE_TICKETS);
  
  return {
    totalStudents: users.filter((u: any) => u.role === 'student').length,
    activeTickets: tickets.filter((t: any) => t.status === 'open').length,
    membersOnline: users.filter((u: any) => u.role === 'member' && u.status === 'Available').length
  };
};
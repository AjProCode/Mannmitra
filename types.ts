export type Role = 'student' | 'admin' | 'member';

export type AvailabilityStatus = 'Available' | 'Busy' | 'Offline';

export interface User {
  id: string;
  username: string; // Anonymous for students, Name for members
  role: Role;
  grade?: string; // Only for students
  email?: string; // Only for members/admin
  status?: AvailabilityStatus; // Only for members
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Ticket {
  id: string;
  studentId: string;
  studentName: string; // The anonymous username
  studentGrade: string;
  assignedTo: string | null; // memberId
  subject: string;
  status: 'open' | 'closed';
  createdAt: string;
  messages: ChatMessage[];
}

export interface AudioVisualizerProps {
  isActive: boolean;
  volume: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}
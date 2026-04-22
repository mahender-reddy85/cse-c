export type UserRole = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

export interface Document {
  id: string;
  title: string;
  exam: 'mid-1' | 'mid-2' | 'sem';
  subject: string;
  unit: string;
  tags: string[];
  fileUrl: string;
  fileType: 'pdf' | 'image';
  uploadedBy: string;
  createdAt: any;
  views: number;
  isImportant: boolean;
}

export interface RequestDoc {
  id: string;
  title: string;
  subject: string;
  unit: string;
  requestedBy: string;
  status: 'pending' | 'fulfilled';
  createdAt: any;
}

export interface Submission {
  id: string;
  title: string;
  subject: string;
  unit: string;
  fileUrl: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

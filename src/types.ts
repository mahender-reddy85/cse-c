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
  exam: 'Mid-1' | 'Mid-2' | 'SEM';
  subject: string;
  unit: string;
  tags: string[];
  fileUrl: string;
  fileType: 'pdf' | 'image';
  uploadedBy: string;
  createdAt: any;
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

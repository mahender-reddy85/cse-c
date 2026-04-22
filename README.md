# CSE-C Exam Hub

<div align="center">
  <h3>Your Gateway to Academic Excellence</h3>
  <p>A mobile-first, professional resource repository for CSE-C students.</p>
</div>

---

## 🚀 Overview

**CSE-C Exam Hub** is a streamlined academic resource management platform designed to help students access, share, and request study materials efficiently. Built with a mobile-first philosophy, it provides a premium user experience across all devices.

## ✨ Features

- **Dashboard**: Quick access to critical resources, recently added documents, and trending materials.
- **Advanced Explorer**: Filter resources by **Exam Period** (Mid-1, Mid-2, SEM), **Subject**, and **Unit**.
- **Global Search**: Instant search by Title, Subject, or Keywords/Tags.
- **Student Contributions**: Students can upload their own resources (PDF/Images) for admin approval.
- **Request System**: Need something specific? Students can request documents directly through the app.
- **Admin Command Center**:
  - Direct document deployment.
  - One-click approval/rejection of student contributions.
  - Request fulfillment tracking.
- **Role-Based Access**: Secure portal ensuring only authorized users can access the repository.

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS for high-fidelity, responsive styling.
- **Backend**: Firebase (Authentication, Firestore, Storage).
- **Animations**: Framer Motion for smooth, premium micro-interactions and success feedback.
- **Icons**: Lucide React.

## 🔒 Security & Constraints

- **Restricted Access**: Access is controlled via an allowlist in the `users` collection.
- **File Constraints**:
  - Supported Formats: **PDF**, **JPEG**, **PNG**, **WebP**.
  - Size Limit: **10MB** per file to ensure repository stability.
- **View Tracking**: Automatic analytics to track the most helpful resources.

## 🏃 Run Locally

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Firebase**:
   Update `src/lib/firebase.ts` with your project credentials.
4. **Launch Development Server**:
   ```bash
   npm run dev
   ```

## 📜 Firestore Schema

### Documents
```json
{
  "title": "string",
  "exam": "Mid-1 | Mid-2 | SEM",
  "subject": "string",
  "unit": "string",
  "tags": ["string"],
  "fileUrl": "string",
  "fileType": "pdf | image",
  "views": "number",
  "isImportant": "boolean",
  "uploadedBy": "email"
}
```

---

<p align="center">Made for <strong>CSE-C</strong> Students</p>

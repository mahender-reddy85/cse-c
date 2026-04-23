# CSE-C Exam Hub

<div align="center">
  <img src="./public/cse-c.png" width="120" height="120" alt="CSE-C Logo" />
  <h3>Your Gateway to Academic Excellence</h3>
  <p>A mobile-first, professional resource repository for CSE-C students.</p>
</div>

---

## 🚀 Overview

**CSE-C Exam Hub** is a streamlined academic resource management platform designed to help students access, share, and request study materials efficiently. Built with a mobile-first philosophy, it provides a premium user experience across all devices.

## ✨ Features

- **Dashboard**: Filter resources by **Exam Period** (Mid-1, Mid-2, SEM), **Subject**, and **Unit** with real-time feedback.
- **Global Search**: Debounced live search accessible from the header (Desktop) or the dashboard (Mobile).
- **Request System**: Need something specific? Students can request documents directly through the app.
- **Student Contributions**: Students can upload their own resources (PDF/Images) for admin approval.
- **Admin Command Center**:
  - Direct document deployment via a streamlined vertical form.
  - One-click approval/rejection of student contributions.
  - Custom "Destruct Sequence" confirmation for secure deletions.
- **Mobile-First Design**: Optimized header with an interactive avatar menu and balanced semester indicators.
- **Aesthetic Excellence**: Modern "Blue & Slate" theme with smooth Framer Motion transitions.

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS 4.0.
- **Backend**: Firebase (Authentication, Firestore, Storage).
- **Cloud Storage**: Cloudinary integration for organized asset management.
- **Animations**: Motion (formerly Framer Motion) for premium micro-interactions.
- **Icons**: Lucide React.

## 🔒 Security & Constraints

- **Restricted Access**: Role-based access control for Admins and Members.
- **File Constraints**:
  - Supported Formats: **PDF**, **JPEG**, **PNG**, **WebP**.
  - Size Limit: **10MB** per file to ensure stability.
- **Tagging**: Enforced limit of 2 tags per resource for clean categorization.

## 🏃 Run Locally

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file with your Firebase and Cloudinary credentials.
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
  "uploadedBy": "email",
  "createdAt": "timestamp"
}
```

---

<p align="center">Made for <strong>CSE-C</strong> Students</p>

# Security Specification - Exam Hub

## Data Invariants
1. A user must exist in the `users` collection with a valid role (admin/student) to read or write any data.
2. Admins have full CRUD on `documents`, `requests`, and `submissions`.
3. Students can read `documents`.
4. Students can create `requests` and `submissions` with their own email.
5. Users cannot modify their own role.
6. Document IDs must be valid alphanumeric strings.
7. File sizes are managed by Storage rules (not implemented in Firestore but respected via metadata).

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a user with `role: "admin"` as a non-admin.
2. Updating a document's `views` by 100 instead of 1. (Actually user usually only reads, but let's say we allow students to increment views). Actually, we'll restrict `views` update to a specific action.
3. Reading the `users` collection as a student.
4. Deleting a document as a student.
5. Creating a `request` for another user's email.
6. Submitting a document with an external URL instead of a firebase storage URL prefix.
7. Approving a submission as a student.
8. Injecting a 1MB string into a `tag` array.
9. Modifying `createdAt` on an existing document.
10. Creating a document with a future timestamp.
11. Reading "private" user data of others (if any).
12. Accessing data without being logged in.

## Test Runner logic (Firestore Rules)
The following rules will implement the 8 pillars of hardening.

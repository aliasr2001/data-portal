# Form data storage flow

This document explains how the applicant form data moves from the React form into MongoDB.

## 1. Where the form data lives

The dashboard form stores its values in the React state object `profileData` inside [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx).

The initial state contains:

- `fullName`
- `phone`
- `currentJob`
- `expectedSalary`
- `cvFileName`
- `coverLetter`
- `photoFileName`
- `photoDataUrl`
- `address`
- `joiningDate`
- `nationality`

## 2. How each input is captured

When a user types into the form, the input handler updates the matching field in `profileData`:

- text inputs update the state directly
- file uploads update the state with file metadata

### File handling behavior

- Profile photo:
  - the file name is stored in `photoFileName`
  - the image content is converted to a base64 data URL and stored in `photoDataUrl`
- CV attachment:
  - only the file name is stored in `cvFileName`

## 3. Submission request to the backend

When the user clicks “Submit Profile”, the app sends a `POST` request to:

- `/api/profile/save-profile`

The request body looks like this:

```json
{
  "email": "candidate@example.com",
  "profile": {
    "fullName": "",
    "phone": "",
    "currentJob": "",
    "expectedSalary": "",
    "cvFileName": "",
    "coverLetter": "",
    "photoFileName": "",
    "photoDataUrl": "",
    "address": "",
    "joiningDate": "",
    "nationality": ""
  }
}
```

This happens in [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx).

## 4. Visual flow

```text
User fills form
   ↓
React state: profileData
   ↓
POST /api/profile/save-profile
   ↓
Express route in server/server.js
   ↓
Profile.findOneAndUpdate(..., { upsert: true })
   ↓
MongoDB document stored in profiles collection
```

## 5. Backend processing

The Express server in [server/server.js](server/server.js) receives the request and performs these steps:

1. Normalizes the email to lowercase.
2. Builds a safe profile object with the form values.
3. Uses `Profile.findOneAndUpdate(...)` with `upsert: true`.
4. Saves or updates the document for that email.

Because the code uses `upsert: true`, one user email can have one profile document, and the same record is updated on subsequent submissions.

## 6. Database structure

The backend uses a Mongoose schema called `Profile`.

### Profile document shape

```json
{
  "email": "candidate@example.com",
  "fullName": "",
  "phone": "",
  "currentJob": "",
  "expectedSalary": "",
  "cvFileName": "",
  "coverLetter": "",
  "photoFileName": "",
  "photoDataUrl": "",
  "address": "",
  "joiningDate": "",
  "nationality": "",
  "createdAt": "2026-07-15T00:00:00.000Z",
  "updatedAt": "2026-07-15T00:00:00.000Z"
}
```

In MongoDB, this is stored in the `profiles` collection.

## 7. Field-by-field mapping

| Form field | Frontend state key | Backend field | Storage note |
|---|---|---|---|
| Full name | `fullName` | `fullName` | Stored as plain string |
| Phone number | `phone` | `phone` | Stored as plain string |
| Current job | `currentJob` | `currentJob` | Stored as plain string |
| Expected salary | `expectedSalary` | `expectedSalary` | Stored as plain string |
| CV file | `cvFileName` | `cvFileName` | Stores only the file name |
| Cover letter | `coverLetter` | `coverLetter` | Optional text field |
| Profile photo | `photoFileName` | `photoFileName` | Stores file name |
| Profile photo | `photoDataUrl` | `photoDataUrl` | Stores base64 image data |
| Address | `address` | `address` | Stored as plain string |
| Joining date | `joiningDate` | `joiningDate` | Stored as string from date input |
| Nationality | `nationality` | `nationality` | Stored as plain string |

## 8. Social connection storage

Social account connection data is stored separately, not inside the main profile document.

When a user connects Facebook or Instagram, the app sends a request to:

- `/api/connections/save-social-connection`

The payload contains:

```json
{
  "userEmail": "candidate@example.com",
  "platform": "facebook",
  "identifier": "user-id-or-handle",
  "password": "entered-password"
}
```

That data is stored in the `socialconnections` collection.

## 9. Summary

The current flow is:

1. User fills the form.
2. Frontend keeps the values in React state.
3. Submit sends them to the backend API.
4. Backend saves them into MongoDB using the `Profile` model.
5. Each user is identified by their email, and their profile is updated in one document.

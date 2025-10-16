# 📡 API Documentation

## Authentication

### Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "username": "your_admin_username",
  "password": "your_admin_password"
}
```

**Response:**
```json
{
  "user": {
    "id": "admin1",
    "username": "your_username",
    "role": "admin"
  }
}
```

### Logout
```http
POST /api/auth/signout
```

### Get Session
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "admin1",
    "username": "your_username",
    "role": "admin"
  }
}
```

## Admin APIs

### Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Required (Admin)
```

**Response:**
```json
{
  "totalVoters": 150,
  "verifiedVoters": 120,
  "totalVotes": 85,
  "participationRate": 70.83,
  "candidates": [
    {
      "id": "candidate1",
      "name": "Ahmad Rizki Pratama",
      "voteCount": 30,
      "percentage": 35.29
    }
  ]
}
```

### Voters Management

#### Get All Voters
```http
GET /api/admin/voters
Authorization: Required (Admin)
```

**Response:**
```json
[
  {
    "id": "voter1",
    "name": "John Doe",
    "class": "XII RPL 1",
    "nisn": "123456789",
    "isVerified": true,
    "hasVoted": false,
    "voteToken": "ABC12"
  }
]
```

#### Create Voter
```http
POST /api/admin/voters
Authorization: Required (Admin)
Content-Type: application/json

{
  "name": "Jane Doe",
  "class": "XII TKJ 1",
  "nisn": "987654321"
}
```

#### Update Voter
```http
PUT /api/admin/voters/[id]
Authorization: Required (Admin)
Content-Type: application/json

{
  "name": "John Smith",
  "class": "XII RPL 2",
  "nisn": "123456789"
}
```

#### Delete Voter
```http
DELETE /api/admin/voters/[id]
Authorization: Required (Admin)
```

#### Verify Voter
```http
POST /api/admin/voters/[id]/verify
Authorization: Required (Admin)
```

**Response:**
```json
{
  "id": "voter1",
  "name": "John Doe",
  "voteToken": "ABC12",
  "voteUrl": "/vote/ABC12"
}
```

#### Get Unverified Voters
```http
GET /api/admin/voters/unverified
Authorization: Required (Admin/Committee)
```

#### Import Voters from CSV
```http
POST /api/admin/voters/import
Authorization: Required (Admin)
Content-Type: multipart/form-data

Form Data:
- file: [CSV file with columns: Nama,Kelas,NISN]
```

**Response:**
```json
{
  "imported": 25,
  "errors": [
    {
      "row": 3,
      "error": "NISN already exists",
      "data": { "name": "Duplicate User", "class": "XII RPL 1", "nisn": "123456789" }
    }
  ]
}
```

#### Download CSV Template
```http
GET /api/admin/voters/template
Authorization: Required (Admin)
```

**Response:** CSV file download

### Candidates Management

#### Get All Candidates
```http
GET /api/admin/candidates
Authorization: Required (Admin)
```

**Response:**
```json
[
  {
    "id": "candidate1",
    "name": "Ahmad Rizki Pratama",
    "class": "XII RPL 1",
    "vision": "Mewujudkan OSIS yang inovatif...",
    "mission": "Mengembangkan program kerja...",
    "photo": "/uploads/1634567890-photo.jpg",
    "orderNumber": 1
  }
]
```

#### Create Candidate
```http
POST /api/admin/candidates
Authorization: Required (Admin)
Content-Type: multipart/form-data

Form Data:
- name: "New Candidate"
- class: "XII IPA 1"
- vision: "Vision text"
- mission: "Mission text"
- orderNumber: 3
- photo: [Image file - Optional]
```

#### Update Candidate
```http
PUT /api/admin/candidates/[id]
Authorization: Required (Admin)
Content-Type: multipart/form-data

Form Data:
- name: "Updated Name"
- class: "XII IPA 2"
- vision: "Updated vision"
- mission: "Updated mission"
- orderNumber: 2
- photo: [Image file - Optional]
```

#### Delete Candidate
```http
DELETE /api/admin/candidates/[id]
Authorization: Required (Admin)
```

### Voting Session Management

#### Get Voting Session Status
```http
GET /api/admin/voting-session
Authorization: Required (Admin)
```

**Response:**
```json
{
  "id": "session1",
  "isActive": true,
  "startTime": "2025-10-16T08:00:00Z",
  "endTime": null
}
```

#### Toggle Voting Session
```http
POST /api/admin/voting-session
Authorization: Required (Admin)
Content-Type: application/json

{
  "action": "start" | "stop"
}
```

## Voting APIs

### Get Voting Data
```http
GET /api/vote/[token]
```

**Response:**
```json
{
  "voter": {
    "name": "John Doe",
    "class": "XII RPL 1",
    "hasVoted": false
  },
  "candidates": [
    {
      "id": "candidate1",
      "name": "Ahmad Rizki Pratama",
      "class": "XII RPL 1",
      "vision": "Vision text",
      "mission": "Mission text",
      "photo": "/uploads/photo.jpg",
      "orderNumber": 1
    }
  ],
  "votingSession": {
    "isActive": true
  }
}
```

### Submit Vote
```http
POST /api/vote/[token]/submit
Content-Type: application/json

{
  "candidateId": "candidate1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote submitted successfully"
}
```

### Get Voter Status
```http
GET /api/vote/[token]/status
```

**Response:**
```json
{
  "hasVoted": true,
  "votedAt": "2025-10-16T10:30:00Z"
}
```

## Monitoring APIs

### Real-time Statistics
```http
GET /api/monitoring/realtime
```

**Response:**
```json
{
  "totalVoters": 150,
  "totalVotes": 85,
  "participationRate": 56.67,
  "lastUpdate": "2025-10-16T10:30:00Z",
  "candidates": [
    {
      "id": "candidate1",
      "name": "Ahmad Rizki Pratama",
      "class": "XII RPL 1",
      "orderNumber": 1,
      "voteCount": 30,
      "percentage": 35.29
    }
  ],
  "votingTrend": [
    {
      "time": "09:00",
      "votes": 15
    },
    {
      "time": "10:00",
      "votes": 45
    }
  ]
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": "Additional details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (duplicate)
- **422 Unprocessable Entity** - Validation error
- **500 Internal Server Error** - Server error

### Error Examples

#### Validation Error (422)
```json
{
  "error": "Validation failed",
  "details": "NISN already exists"
}
```

#### Authentication Error (401)
```json
{
  "error": "Unauthorized",
  "details": "Please login to access this resource"
}
```

#### Not Found Error (404)
```json
{
  "error": "Voter not found",
  "details": "No voter found with the provided ID"
}
```

## File Upload Specifications

### Candidate Photo Upload
- **Max Size**: 2MB
- **Allowed Formats**: JPG, JPEG, PNG, GIF
- **Storage Path**: `/public/uploads/`
- **Naming Convention**: `{timestamp}-{originalname}`
- **Response**: Returns relative path `/uploads/filename.jpg`

### CSV Import Format
```csv
Nama,Kelas,NISN
John Doe,XII RPL 1,123456789
Jane Smith,XII TKJ 1,987654321
```

**Requirements:**
- First row contains headers
- No empty rows
- NISN must be unique
- All fields required

## Rate Limiting

### Default Limits
- **Login attempts**: 5 per minute per IP
- **API requests**: 100 per minute per session
- **File uploads**: 5 per minute per session

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

## Authentication Flow

### Admin Login Flow
1. POST `/api/auth/signin` with credentials
2. Server validates and creates session
3. Returns user data and sets session cookie
4. Include session cookie in subsequent requests
5. Access admin-only routes

### Committee Login Flow
1. POST `/api/auth/signin` with committee credentials
2. Server validates committee user
3. Returns committee user data
4. Access committee-only routes

### Token-based Voting Flow
1. Admin/Committee verifies voter
2. System generates unique 5-character token
3. Voter accesses `/vote/{token}`
4. System validates token and voter status
5. Voter submits vote
6. Token becomes invalid

## Security Considerations

### Authentication
- Session-based authentication using NextAuth.js
- Passwords hashed with bcrypt
- CSRF protection enabled
- Secure session cookies

### Voting Security
- One-time use voting tokens
- IP address and user agent logging
- Token validation on each request
- Voting session controls

### File Upload Security
- File type validation
- File size limits
- Secure file naming
- Path traversal prevention

### API Security
- Role-based access control
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
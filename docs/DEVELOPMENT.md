# 🔧 Development Guide

## Setup Development Environment

### Prerequisites
- Node.js 18+
- Git
- VS Code (Recommended)

### Quick Setup
```bash
git clone https://github.com/pindoyono/e-vote.git
cd e-vote
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Project Structure

```
e-vote/
├── docs/                 # Documentation
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   └── API.md
├── prisma/              # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/              # Static files
│   ├── uploads/         # Candidate photos
│   └── icons/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # Admin panel pages
│   │   ├── committee/   # Committee panel pages
│   │   ├── vote/        # Voting pages
│   │   ├── monitoring/  # Public monitoring
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities & configurations
│   └── types/           # TypeScript types
├── .env.example         # Environment template
├── package.json
└── README.md
```

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma studio          # GUI database browser
npx prisma migrate dev      # Create and apply migration
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema changes
npx prisma db seed          # Seed database

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
```

### Optional Variables
```env
# Development
NODE_ENV="development"

# Debugging
DEBUG="prisma:*"  # Enable Prisma debugging
```

## Database Development

### Schema Changes
1. Edit `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Generate client: `npx prisma generate`

### Seeding Data
```bash
# Run seed script
npx prisma db seed

# Reset database with seed
npx prisma migrate reset
```

### Database GUI
```bash
# Open Prisma Studio
npx prisma studio
```

## Code Style & Standards

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/` = `src/`)
- Type checking on build

### Component Structure
```typescript
// components/ComponentName.tsx
'use client' // if client component

import { useState } from 'react'
import { ComponentProps } from '@/types'

interface Props extends ComponentProps {
  customProp: string
}

export default function ComponentName({ customProp, ...props }: Props) {
  const [state, setState] = useState('')
  
  return (
    <div {...props}>
      {customProp}
    </div>
  )
}
```

### API Route Structure
```typescript
// app/api/endpoint/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Testing

### Manual Testing
1. **Admin Flow**
   - Login as admin
   - Create/import voters
   - Manage candidates
   - Verify voters
   - Monitor results

2. **Voting Flow**
   - Access with token
   - Select candidate
   - Submit vote
   - Verify thank you page

3. **Committee Flow**
   - Login as committee
   - Verify voters
   - Generate tokens

### Test Data
```sql
-- Create test voter
INSERT INTO Voter (id, name, class, nisn, isVerified, voteToken) 
VALUES ('test1', 'Test User', 'XII RPL 1', '123456789', true, 'TEST1');
```

## File Upload Development

### Photo Upload Configuration
- **Location**: `public/uploads/`
- **Max Size**: 2MB
- **Formats**: JPG, PNG, GIF
- **Naming**: `timestamp-originalname`

### Upload Handler Example
```typescript
// Handle file upload
const file = formData.get('photo') as File
if (file && file.size > 0) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileName = `/uploads/${Date.now()}-${file.name}`
  const fs = require('fs')
  const path = require('path')
  
  const fullPath = path.join(process.cwd(), 'public', fileName)
  fs.writeFileSync(fullPath, buffer)
  
  return fileName // Save to database
}
```

## Authentication Development

### Session Management
```typescript
// Check authentication in API
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Access user role
  const userRole = session.user.role // 'admin' | 'committee'
}
```

### Role-based Access
```typescript
// Middleware for role checking
export function requireRole(role: 'admin' | 'committee') {
  return async (req: Request) => {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== role) {
      throw new Error('Insufficient permissions')
    }
  }
}
```

## Common Development Tasks

### Adding New Candidate Field
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev`
3. Update TypeScript types
4. Update forms and API endpoints
5. Update display components

### Adding New API Endpoint
1. Create file in `app/api/[route]/route.ts`
2. Implement HTTP methods (GET, POST, PUT, DELETE)
3. Add authentication if needed
4. Add error handling
5. Update API documentation

### Adding New Page
1. Create file in `app/[route]/page.tsx`
2. Implement React component
3. Add navigation links
4. Add authentication if needed
5. Test responsive design

## Debugging

### Common Issues

1. **Database Connection**
   ```bash
   # Check database file exists
   ls -la prisma/dev.db
   
   # Regenerate client
   npx prisma generate
   ```

2. **Session Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

3. **File Upload Issues**
   ```bash
   # Check uploads directory
   mkdir -p public/uploads
   chmod 755 public/uploads
   ```

### Logging
```typescript
// Add console.log for debugging
console.log('Debug:', { variable, timestamp: new Date() })

// Use Prisma query logging
const result = await prisma.voter.findMany()
console.log('Query result:', result)
```

## Performance Tips

### Database Queries
```typescript
// Use select to limit fields
const voters = await prisma.voter.findMany({
  select: {
    id: true,
    name: true,
    class: true,
    isVerified: true
  }
})

// Use pagination
const voters = await prisma.voter.findMany({
  skip: page * limit,
  take: limit
})
```

### Image Optimization
```typescript
// Resize images before upload (optional)
import sharp from 'sharp'

const resizedBuffer = await sharp(buffer)
  .resize(800, 600, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toBuffer()
```

## VS Code Configuration

### Recommended Extensions
- TypeScript Hero
- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag

### Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
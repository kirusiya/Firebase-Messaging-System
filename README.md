# Firebase Messaging System

A comprehensive real-time messaging application built with **Next.js 14**, **TypeScript**, and **Firebase**. This project demonstrates modern web development practices, real-time communication, and a polished user experience.

---

## ✨ Key Features

### 🔐 Authentication & User Management
- **Secure Authentication**: Email/password registration and login with Firebase Auth
- **User Profiles**: Display names, avatars with automatic initials generation
- **Session Management**: Persistent login state with automatic logout functionality
- **Loading States**: Professional loader overlays during authentication processes
- **Real-time Status**: Online/offline indicators for all users
- **Error Handling**: Comprehensive error feedback and validation

### 💬 Real-time Messaging
- **Instant Delivery**: Real-time message synchronization using Firestore listeners
- **One-to-One Chat**: Private conversations between users
- **Message Status**: Read receipts with single (✓) and double (✓✓) checkmarks
- **Message Threading**: Reply to specific messages with visual context
- **Message Editing**: Edit sent messages with "Edited" indicators
- **Message Deletion**: Delete own messages with WhatsApp-style "You deleted this message" display
- **Timestamps**: Relative time display (e.g., "2 minutes ago") with automatic updates

### 😊 Interactive Reactions
- **Emoji Reactions**: React to messages with 6 predefined emojis (👍, ❤️, 😂, 😮, 😢, 😡)
- **Smart Permissions**: Users can only react to others' messages, not their own
- **Reaction Management**: Toggle reactions on/off with visual feedback
- **Reaction Display**: Clean emoji display without backgrounds, following app design

### 🔔 Notifications & UX
- **Browser Notifications**: Native push notifications for new messages
- **Permission Handling**: Automatic notification permission requests
- **Smart Filtering**: Notifications only for relevant conversations
- **Auto-scroll**: Automatic scroll to latest messages with smooth animations
- **Responsive Design**: Optimized for desktop and mobile devices
- **Loading States**: Skeleton loaders and progress indicators

### 🎨 Modern Interface
- **Clean Design**: Professional UI using Tailwind CSS and shadcn/ui components
- **Consistent Theming**: Unified color scheme throughout the application
- **Visual Hierarchy**: Clear separation between chat sections with borders and spacing
- **Hover Effects**: Interactive elements with smooth transitions
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation support

---

## 🛠 Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Lucide React Icons |
| **Backend** | Firebase (Authentication & Firestore) |
| **Real-time** | Firestore Real-time Listeners |
| **Utilities** | date-fns (time formatting) |
| **Development** | ESLint, TypeScript strict mode |

---

## 📁 Project Architecture

\`\`\`
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   └── page.tsx              # Login/Register page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main chat interface
│   └── globals.css               # Global styles
├── components/
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Login form with loader
│   │   └── register-form.tsx     # Registration form
│   ├── chat/                     # Chat interface components
│   │   ├── message-input.tsx     # Message composition with reply
│   │   ├── message-list.tsx      # Message display with reactions
│   │   └── user-list.tsx         # User sidebar with online status
│   ├── layout/                   # Layout components
│   │   └── header.tsx            # App header with user info
│   └── ui/                       # shadcn/ui components
├── contexts/                     # React Context providers
│   └── auth-context.tsx          # Authentication state management
├── hooks/                        # Custom React hooks
│   ├── use-messages.ts           # Message operations and real-time sync
│   └── use-users.ts              # User list management
├── lib/                          # Utilities and configuration
│   └── firebase.ts               # Firebase configuration and initialization
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Global interfaces and types
└── public/                       # Static assets
    └── sounds/                   # Notification sounds (legacy)
\`\`\`

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** – [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Firebase Account** – [Create account](https://console.firebase.google.com)

### Installation

1. **Clone and Install Dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd autsai-messaging-system
   npm install
   \`\`\`

2. **Firebase Project Setup**
   
   **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project" → Enter project name → Continue
   
   **Enable Authentication:**
   - Navigate to Authentication → Get started
   - Sign-in method → Email/Password → Enable → Save
   
   **Create Firestore Database:**
   - Navigate to Firestore Database → Create database
   - Start in production mode → Choose location → Done
   
   **Add Web App:**
   - Project Settings ⚙️ → General → Your apps → Web (`</>`)
   - Register app → Copy configuration object

3. **Configure Firestore Security Rules**
   \`\`\`javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       // Users can read all user documents, but only write their own
       match /users/{uid} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == uid;
       }
       
       // Messages can only be read/written by participants
       match /messages/{id} {
         allow read, write: if request.auth != null &&
           (request.auth.uid == resource.data.senderId ||
            request.auth.uid == resource.data.receiverId);
         allow create: if request.auth != null &&
           request.auth.uid == request.resource.data.senderId;
       }
     }
   }
   \`\`\`

4. **Environment Configuration**
   
   Create `.env.local` in project root:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   \`\`\`

5. **Launch Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Usage Guide

### Getting Started
1. **Create Account**: Register with display name, email, and password
2. **Sign In**: Use your credentials to access the messaging interface
3. **Select User**: Click any user from the sidebar to start a conversation

### Messaging Features
- **Send Messages**: Type in the input field and press Enter or click Send
- **Reply to Messages**: Hover over any message → click Reply icon → compose response
- **React to Messages**: Hover over others' messages → click Smile icon → select emoji
- **Delete Messages**: Hover over your messages → click Trash icon → message shows as deleted
- **Edit Messages**: (Feature available in codebase, UI can be extended)

### Notifications
- **Enable Notifications**: Allow browser permission when prompted
- **Background Alerts**: Receive notifications even when tab is not active
- **Smart Filtering**: Only get notified for messages in active conversations

---

## 🧪 Testing & Development

### Local Testing
\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Multi-User Testing
1. Open multiple browser windows/incognito tabs
2. Register different accounts in each window
3. Test real-time messaging, reactions, and online status
4. Verify notifications work across tabs

### Firebase Console Monitoring
- Monitor Firestore collections: `users` and `messages`
- Check Authentication users in Firebase Console
- Review security rules and usage metrics

---

## 🔧 Configuration Options

### Firebase Environment Variables
All Firebase configuration is handled through environment variables with the `NEXT_PUBLIC_` prefix for client-side access.

### Notification Settings
Browser notifications are automatically requested on first visit. Users can manage permissions through browser settings.

### UI Customization
The application uses Tailwind CSS with shadcn/ui components. Customize themes by modifying:
- `tailwind.config.ts` - Color schemes and design tokens
- `app/globals.css` - Global styles and CSS variables

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Firebase connection errors** | Verify all environment variables match Firebase console exactly |
| **"Permission denied" errors** | Ensure Firestore security rules are published correctly |
| **Messages not updating** | Check internet connection and Firebase project quotas |
| **Notifications not working** | Grant browser permission and test in Chrome/Firefox |
| **Build errors** | Clear `.next` folder and reinstall dependencies |
| **Authentication loops** | Clear browser localStorage and cookies |

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Other Platforms
The application is a standard Next.js app and can be deployed to any platform supporting Node.js applications.

---

## 📊 Performance Features

- **Optimized Queries**: Efficient Firestore queries with proper indexing
- **Real-time Optimization**: Smart listener management to prevent memory leaks
- **Lazy Loading**: Components and data loaded on demand
- **Caching**: Automatic caching of user data and message history
- **Bundle Optimization**: Tree-shaking and code splitting for minimal bundle size

---

## 🔒 Security Features

- **Authentication Required**: All routes protected with authentication checks
- **Data Validation**: Client and server-side input validation
- **Firestore Rules**: Granular permissions for data access
- **XSS Protection**: Sanitized user inputs and secure rendering
- **Environment Security**: Sensitive data stored in environment variables

---

## 📈 Future Enhancements

- **Group Chats**: Multi-user conversations
- **File Sharing**: Image and document uploads
- **Voice Messages**: Audio message recording and playback
- **Message Search**: Full-text search across conversation history
- **Dark Mode**: Theme switching capability
- **Mobile App**: React Native implementation



---

**Developer**: Ing. Edward Avalos  
**Year**: 2025  
**Technologies**: Next.js 14, TypeScript, Firebase, Tailwind CSS, shadcn/ui

---

*For technical support or questions about this implementation, please refer to the troubleshooting section or review the comprehensive code documentation within the project files.*

# BizDiary 📒

**Your Trusted Platform for Discovering Local Businesses**

BizDiary is a modern business directory platform that connects customers with local businesses. Built with Next.js 16, TypeScript, and Firebase, it provides a seamless experience for both customers looking to discover services and businesses wanting to showcase their offerings.

## 🌟 Features

### For Customers
- 🔍 **Search & Discovery**: Find local businesses by category, location, and services
- ⭐ **Favorites**: Save your favorite businesses for quick access
- 💬 **Real-time Messaging**: Direct communication with businesses
- 🔔 **Notifications**: Get notified about new messages and updates

### For Businesses
- 📊 **Analytics Dashboard**: Track views, favorites, and customer engagement
- 🏢 **Business Profiles**: Comprehensive profiles with services, hours, and galleries
- 💼 **Service Management**: Showcase multiple services with detailed descriptions
- 📍 **Multi-location Support**: Manage multiple business locations
- 📈 **Real-time Chat**: Respond to customer inquiries instantly
- 🖼️ **Media Galleries**: Upload and showcase business photos


## 🚀 Getting Started



###  Set Up Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=95ccff
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=


NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
azbow-project/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes (login)
│   ├── (register)/          # Registration routes
│   ├── about/               # About page
│   ├── api/                 # API routes
│   ├── business/            # Business profile pages
│   ├── business-dashboard/  # Business analytics dashboard
│   ├── contact/             # Contact page
│   ├── favorites/           # User favorites page
│   ├── find-business/       # Business search & discovery
│   ├── messages/            # Chat messaging interface
│   └── page.tsx             # Homepage
├── components/              # Reusable React components
│   ├── Navbar.tsx          # Navigation with search & auth
│   ├── Footer.tsx          # Site footer
│   └── ...                 # Other components
├── contexts/                # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── ChatContext.tsx     # Real-time messaging
│   └── FavoritesContext.tsx # Favorites management
├── lib/                     # Utility libraries
│   ├── firebase.ts         # Firebase client config
│   ├── firebaseAdmin.ts    # Firebase Admin SDK
│   └── utils/              # Helper functions
├── services/                # Service layer for API calls
│   ├── authService.ts      # Authentication services
│   ├── businessService.ts  # Business CRUD operations
│   └── chatService.ts      # Chat/messaging services
└── public/                  # Static assets
```

## 🔑 Key Features Explained

### Authentication System
- Dual user types: **Customers** and **Businesses**
- Separate registration flows for each user type
- Firebase Authentication with email/password
- Protected routes with authentication guards

### Real-time Messaging
- Firebase Firestore real-time listeners
- Unread message counters with badge notifications
- Browser notifications for new messages
- Chat history with sender/receiver context

### Business Dashboard
- View analytics (profile views, favorites, messages)
- Interactive charts powered by Chart.js
- Service and location management
- Profile customization with image uploads

### Favorites System
- Client-side favorites using localStorage
- Quick access to saved businesses
- Persistent across sessions

## 🔐 Firebase Setup

### Required Firestore Collections

1. **users**
   - User profiles with type (user/business)
   - Contact information and preferences

2. **businesses**
   - Business profiles with categories
   - Services, locations, hours, galleries
   - Analytics data (views, favorites)

3. **chats**
   - Individual chat documents
   - Participants, last message, unread counts

4. **messages**
   - Chat messages with timestamps
   - Sender/receiver IDs and content

### Security Rules
Ensure proper Firestore security rules are configured to protect user data and business information.

## 🎨 Customization

### Styling
- Tailwind CSS 4 with utility classes
- Custom gradient backgrounds
- Responsive design breakpoints
- Dark mode ready (can be enabled)

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

Checkout
https://business-directory-weld.vercel.app/
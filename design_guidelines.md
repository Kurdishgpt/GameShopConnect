# Gaming Community Platform Design Guidelines

## Design Approach
**Reference-Based**: Drawing from gaming social platforms (Discord, Steam Community, Xbox) with a vibrant, energetic twist inspired by the provided candy ball background. The design balances functional matchmaking/shopping features with visually engaging social elements.

## Core Design Principles
- **Vibrant Energy**: Embrace the colorful, playful candy aesthetic while maintaining readability
- **Gaming-First**: Dark base with bright accent pops for reduced eye strain during extended sessions
- **Social Connection**: Emphasize player profiles, messaging, and community features
- **Clear Hierarchy**: Role-based access should be immediately apparent through visual cues

## Typography System

**Primary Font**: Inter (Google Fonts) - clean, modern, excellent readability
**Accent Font**: Montserrat (Google Fonts) - bold headers and CTAs

### Hierarchy:
- Hero/Page Titles: Montserrat Bold, 3xl-4xl (mobile) / 5xl-6xl (desktop)
- Section Headers: Montserrat SemiBold, 2xl-3xl
- Card Titles: Inter SemiBold, lg-xl
- Body Text: Inter Regular, base
- Captions/Metadata: Inter Regular, sm, reduced opacity

## Layout System

**Spacing Units**: Use Tailwind spacing: 2, 4, 6, 8, 12, 16, 20, 24 (p-2, m-4, gap-6, etc.)

### Structure:
- **Left Sidebar**: Fixed width 64 (w-64) on desktop, collapsible drawer on mobile
- **Main Content**: Full viewport minus sidebar, max-w-7xl container
- **Content Padding**: p-6 mobile, p-8 desktop
- **Card Spacing**: gap-6 for grids

### Grid Patterns:
- Player Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Shopping Items: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Stories: Horizontal scroll on mobile, grid-cols-4 lg:grid-cols-6 desktop

## Component Library

### Left Sidebar Navigation
- Fixed position, full height
- 4 main sections with icons (Home, Shopping, Find Player, Stories)
- User profile section at top (avatar, name, role badge)
- Role indicator with distinctive badge/color treatment
- Active state: subtle highlight with left border accent

### Player Cards (Find Player Page)
- Card with avatar/header image
- Platform badges (PlayStation, Xbox, PC, etc.)
- Age display (subtle, non-prominent)
- Username (prominent, bold)
- "Send Request" button
- Game preferences tags
- Online status indicator (dot badge)

### Shopping Cards
- Product/service image
- Title and price
- "Request" button
- Category tags
- Quick view hover state

### Messaging Interface
- Chat list sidebar (similar to Discord)
- Conversation thread view
- Message bubbles with timestamps
- Typing indicators
- User avatars inline

### Video Story Feed
- Instagram-style story circles at top
- Grid view of story posts below
- Video thumbnails with play overlay
- User attribution and timestamp
- Like/comment counts

### Game Selection Interface
- Game tile cards with cover art
- Quick select buttons (BO3, Forza, etc.)
- Custom game input option
- Recently played section

### Role-Based Elements
Visual differentiation for 5 roles:
- **Owner**: Distinctive crown icon, unique accent
- **Admin**: Shield icon, elevated accent
- **Media**: Camera icon, creative accent
- **Developer**: Code icon, tech accent  
- **Player**: Controller icon, standard accent

### Forms (Profile Setup)
- Platform selector: Button group with icons (PS, Xbox, PC, Switch, Mobile)
- Age input: Number field with validation
- Name field: Text input with character limit
- All fields with clear labels and helper text

### Request/Messaging CTAs
- Primary action buttons with icon + text
- "Send Play Request" - prominent, high contrast
- "Message" - secondary treatment
- Game selection dropdown integrated

## Images

**Hero Background**: Use the provided candy ball image as:
- Full-width background on home page hero section
- Semi-transparent dark overlay (bg-black/60) for text readability
- Background-size: cover, background-position: center
- Height: min-h-screen for hero

**Additional Images**:
- Game cover art for selection interface
- Player avatars throughout
- Video story thumbnails
- Product images in shopping section
- Platform logos/icons

## Animations

**Minimal, purposeful animations only**:
- Sidebar expand/collapse transition (300ms ease)
- Card hover lift (subtle transform: translateY(-2px))
- Button press feedback (scale: 0.98)
- Story circle pulse for new content
- Message sent animation (checkmark fade-in)

**No**: Page transition effects, scroll-triggered animations, parallax

## Accessibility
- All interactive elements keyboard navigable
- Focus states with visible outline
- ARIA labels for role badges and status indicators
- Alt text for all images
- Color contrast ratios meet WCAG AA (4.5:1 minimum)
- Screen reader announcements for new messages/requests

## Icons
**Library**: Heroicons (via CDN)
- Navigation: home, shopping-bag, users, video-camera
- Actions: paper-airplane (send), chat-bubble, plus-circle
- Status: check-circle, clock, wifi (online status)
- Roles: shield, code, camera, crown (with <!-- CUSTOM ICON: game controller --> for player)
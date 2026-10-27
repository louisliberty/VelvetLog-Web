# VelvetLog Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Notion's organizational clarity, dating app aesthetics (Hinge/Bumble), and Apple's privacy-focused premium design. Prioritizing discretion through abstract naming, minimal external indicators, and elegant simplicity.

## Typography System
**Primary Font**: Inter (Google Fonts)
**Secondary Font**: Crimson Pro (for premium accents)

**Hierarchy**:
- Hero Headlines: 48px/56px (mobile/desktop), font-weight 700, Crimson Pro
- Section Headers: 32px/40px, font-weight 600, Inter
- Card Titles: 20px/24px, font-weight 600, Inter
- Body Text: 16px, font-weight 400, Inter, line-height 1.6
- Metadata/Timestamps: 14px, font-weight 500, Inter, opacity 70%
- Button Text: 16px, font-weight 600, Inter

## Layout System
**Spacing Units**: Tailwind units 2, 3, 4, 6, 8, 12, 16, 24
**Container**: max-w-6xl for content, max-w-7xl for marketing
**Grid**: 1 column mobile, 2-3 columns tablet/desktop for card layouts

## Component Library

**Navigation**:
- Minimal top bar with abstract logo ("VL" monogram)
- Hamburger menu on mobile, horizontal on desktop
- No descriptive text about app purpose in nav

**Cards** (Primary UI Element):
- Rounded corners (rounded-2xl)
- Subtle shadow (shadow-sm hover:shadow-md)
- Padding: p-6
- White background with soft border
- Stacked layout: Avatar/Initial circle → Name → Last interaction date → Quick actions

**Buttons**:
- Primary: Full rounded (rounded-full), px-8 py-3
- Secondary: Outlined style, same dimensions
- Icon buttons: Circular, p-3
- Glassmorphism effect when on images (backdrop-blur-lg bg-white/20)

**Forms**:
- Input fields: rounded-xl, py-3 px-4, border-2 focus state
- Text areas: Same styling, min-h-32
- Date pickers: Inline calendar widget
- Privacy indicators: Lock icons subtly placed

**Data Display**:
- Timeline view for interactions (vertical line with nodes)
- Tag system for categories (pill-shaped, subtle backgrounds)
- Stat cards for insights (grid of 2x2 on mobile, 4x1 desktop)

## Landing Page Structure

**Hero Section** (80vh):
- Large hero image: Abstract couple silhouette at sunset, artistic/minimalist
- Headline centered over image
- Subtitle below
- Primary CTA button with glassmorphism
- Secondary "Learn More" link

**Features Section** (py-20):
- 3-column grid (1 on mobile)
- Icon + Title + Description per card
- Icons: Lock, Calendar, Heart outline
- Features: "Private by Design", "Never Forget", "Meaningful Connections"

**How It Works** (py-24):
- 2-column alternating layout (image left/right alternates)
- Images: Phone mockups showing dashboard, entry view, calendar
- 3 steps total with descriptions

**Privacy Promise** (py-20):
- Centered text block (max-w-3xl)
- Trust badges row below
- 3 columns: "Encrypted", "No Sharing", "Your Data Only"

**Testimonials** (py-24):
- 2-column grid (1 on mobile)
- Anonymous testimonials with initials only
- Star ratings hidden (too consumer-focused)
- Quotes in Crimson Pro italic

**Final CTA** (py-32):
- Centered with gradient background treatment
- Large headline + subtext
- Email capture form inline
- "Start Privately" button

**Footer**:
- 3-column layout (stack on mobile)
- Links: About, Privacy Policy, Terms, Contact
- Social icons (minimal, abstract)
- Copyright with "VL" branding

## Dashboard Layout

**Header**:
- Search bar (center, prominent)
- Add new entry button (top right)
- Filter toggles (subtle, top left)

**Main Grid**:
- Masonry-style card grid
- Cards show: Initial circle, name, days since contact, preview note
- Hover: Lift effect (transform scale-102)

**Individual Entry View**:
- Full-screen modal (mobile) or side panel (desktop)
- Header: Large avatar/initial, name, edit button
- Tabs: Timeline, Notes, Reminders, Photos
- Footer: Quick action buttons

## Images

**Hero Image**: Abstract silhouette of couple at sunset/dusk, artistic photography, warm gradient sky, emphasizes intimacy and discretion, positioned center with 40% overlay darkening

**Feature Images** (3):
1. Clean phone mockup showing card dashboard
2. Close-up of calendar with discrete dot indicators
3. Soft-focus couple hands holding, artistic

**How It Works** (3):
1. Dashboard overview screenshot
2. Individual entry interface with timeline
3. Reminder/notification gentle mockup

All images: High-quality, warm tones, soft focus where appropriate, emphasizing privacy and elegance over explicit relationship imagery.

## Animations
Minimal approach:
- Card hover: Subtle lift and shadow increase
- Page transitions: Gentle fade
- Form focus: Smooth border color transition
- NO scroll-triggered animations (maintains discretion)
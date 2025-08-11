# Mistri Dashboard

A modern, responsive dashboard application built with Next.js, TypeScript, and Tailwind CSS, inspired by the [Zola](https://github.com/ibelick/zola) project design patterns.

## Features

- 🎨 **Modern Design**: Clean, responsive UI with light/dark themes
- 📱 **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- 🔧 **TypeScript**: Full type safety throughout the application
- 🎭 **Theme Support**: Built-in light/dark mode with system preference detection
- 📊 **Dashboard Layout**: Responsive sidebar with collapsible navigation
- 🔐 **Authentication Pages**: Login and signup forms ready for integration
- 🎯 **shadcn/ui Components**: Beautiful, accessible components
- ⚡ **Fast Development**: Hot reload and modern tooling

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mistri
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page  
│   ├── analytics/         # Analytics page
│   ├── users/             # Users management page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Dashboard home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── providers/        # Context providers
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── dashboard-layout.tsx  # Dashboard wrapper
│   └── theme-toggle.tsx  # Theme switcher
└── lib/                  # Utilities
    └── utils.ts          # Utility functions
```

## Features Overview

### Dashboard Layout
- Responsive sidebar navigation
- Collapsible sidebar for desktop
- Mobile-friendly sheet overlay
- Smooth transitions and animations

### Authentication
- Login page with form validation
- Signup page with password confirmation
- Theme toggle on auth pages
- Ready for backend integration

### Pages
- **Dashboard**: Overview with stats cards and charts
- **Analytics**: Analytics data visualization
- **Users**: User management interface
- **Settings**: Account and preference settings

### Responsive Design
- **Mobile**: Hamburger menu with sheet sidebar
- **Tablet**: Adaptive layout with proper spacing
- **Desktop**: Full sidebar with collapse functionality

## Customization

### Theme Colors
Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: your-color;
  --secondary: your-color;
  /* ... */
}
```

### Navigation
Update the navigation items in `src/components/sidebar.tsx`:

```typescript
const navigation = [
  {
    name: "Your Page",
    href: "/your-route", 
    icon: YourIcon,
  },
  // ...
]
```

### Components
Add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Wrap content with `DashboardLayout`
4. Update navigation in sidebar

Example:
```typescript
import { DashboardLayout } from "@/components/dashboard-layout"

export default function NewPage() {
  return (
    <DashboardLayout>
      <div>Your content here</div>
    </DashboardLayout>
  )
}
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Design inspiration from [Zola](https://github.com/ibelick/zola)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
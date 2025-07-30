import { Icons, IconType } from './icons';

export type NavItem = {
  title: string
  path: string
  icon?: IconType
  label?: string
  isActive?: boolean
  isExpanded?: boolean
  showInSidebar?: boolean
  children?: NavItem[]
}

export const protectedRoutes: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Icons.dashboard,
    isActive: true,
    showInSidebar: true,
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: Icons.user,
    showInSidebar: true,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Icons.settings,
    showInSidebar: true,
    children: [
      {
        title: 'Account',
        path: '/settings/account',
      },
      {
        title: 'Notifications',
        path: '/settings/notifications',
      },
      {
        title: 'Billing',
        path: '/settings/billing',
      }
    ]
  },
  {
    title: 'Team',
    path: '/team',
    icon: Icons.users,
    showInSidebar: true,
    children: [
      {
        title: 'Members',
        path: '/team/members',
      },
      {
        title: 'Roles',
        path: '/team/roles',
      }
    ]
  }
]

export const publicRoutes: NavItem[] = [
  {
    title: 'About',
    path: '/about',
    icon: Icons.info,
  },
  {
    title: 'Pricing',
    path: '/pricing',
    icon: Icons.currency,
  }
]

export const authRoutes: NavItem[] = [
  {
    title: 'Login',
    path: '/login',
    icon: Icons.login,
  },
  {
    title: 'Sign Up',
    path: '/signup',
    icon: Icons.userPlus,
  }
]

// Flattened version of all routes for middleware protection
export const protectedPaths: string[] = protectedRoutes.flatMap(route => 
  [route.path, ...(route.children?.map(child => child.path) || [])]
)

export const publicPaths: string[] = publicRoutes.map(route => route.path)
export const authPaths: string[] = authRoutes.map(route => route.path)

export const apiAuthPrefix = '/api/auth'
export const DEFAULT_LOGIN_REDIRECT = '/dashboard'
export const DEFAULT_LOGOUT_REDIRECT = '/'
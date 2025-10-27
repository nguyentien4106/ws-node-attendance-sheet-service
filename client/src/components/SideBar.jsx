// ==========================================
// src/components/Sidebar.jsx
// ==========================================
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useSidebar } from '../context/SidebarContext'
import { Button } from '../components/ui/button'
import logo from '../assets/logo.png'
const Monitor = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2"/>
    <line x1="8" x2="16" y1="21" y2="21"/>
    <line x1="12" x2="12" y1="17" y2="21"/>
  </svg>
)

const Users = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const Clock = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const Settings = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const X = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
)

const navItems = [
  { to: '/devices', icon: Monitor, label: 'Thiết bị' },
  { to: '/users', icon: Users, label: 'Người dùng' },
  { to: '/attendances', icon: Clock, label: 'Chấm công' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
]

export const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          !isOpen && 'md:w-0 md:border-0 md:overflow-hidden'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
            <NavLink
                to="/"
                key="/"
                 onClick={() => {
                // Close sidebar on mobile when navigating
                if (window.innerWidth < 768) {
                  closeSidebar()
                }
              }}
            >
                <img src={logo} alt="Logo" className="w-32 mx-auto mb-6" />
            </NavLink>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                // Close sidebar on mobile when navigating
                if (window.innerWidth < 768) {
                  closeSidebar()
                }
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  'no-underline hover:no-underline',
                  'hover:bg-gray-100 hover:shadow-sm',
                  isActive
                    ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                    : 'text-gray-700 hover:text-gray-900'
                )
              }
              style={{ textDecoration: 'none' }}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

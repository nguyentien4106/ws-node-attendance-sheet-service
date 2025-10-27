// ==========================================
// src/components/Header.jsx (Updated with Logout)
// ==========================================
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { useNavigate } from 'react-router-dom'

// Icon components
const Bell = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
)

const LogOut = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
)

const User = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const Settings = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const Menu = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
)

export const Header = () => {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    return name ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) : "Admin"
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold hidden sm:block">
          {document.title || 'SBOX Management'}
        </h2>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">

        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

        <div className="relative">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 md:gap-3"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {user ? getInitials(user) : 'U'}
            </div>
          </Button>
          
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg z-50">
                <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
                <div className="h-px bg-gray-200 my-1" />
                <div 
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
                  onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <div 
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-red-600"
                  onClick={() => { handleLogout(); setDropdownOpen(false); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Root Layout Component
 * 
 * This is the root layout component that wraps the entire application.
 * It provides essential context providers and global UI elements:
 * - Theme context for light/dark mode
 * - Authentication context for user management
 * - Global styling and font configuration
 * - Navigation bar
 * - Toast notifications
 * - Footer with site information
 */

import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-provider"
import AppNavbar from "@/components/app-navbar"
import AppBottomNav from "@/components/app-bottom-nav"
import { APP_NAME, APP_TITLE, APP_DESCRIPTION, logoUrlSphereBadge } from "@/lib/brand"

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  icons: {
    icon: logoUrlSphereBadge(),
    apple: logoUrlSphereBadge(),
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

/**
 * RootLayout Component
 *
 * This is the root layout component that wraps the entire application.
 * It provides the theme context, authentication context, and global styling.
 * Includes the navbar, main content area, and footer.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns The root layout component
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('premdiction-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Theme Provider - Handles light/dark mode */}
        <ThemeProvider>
          {/* Auth Provider - Manages user authentication state */}
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              {/* Navigation Bar - Global navigation component */}
              <AppNavbar />
              
              {/* Main Content Area - Renders child components */}
              <main className="flex-1 container mx-auto py-4 md:py-6 px-4 pb-20 md:pb-6">{children}</main>
              
              <footer className="hidden md:block border-t py-8 bg-pl-purple text-white">
                <div className="container mx-auto px-4">
                  {/* Footer Grid - Three column layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div>
                      <h3 className="text-xl font-bold mb-4">{APP_NAME}</h3>
                      <p className="text-sm text-gray-300">
                        The ultimate Premier League prediction game for you and your friends. Compete, predict, and win!
                      </p>
                    </div>
                    
                    {/* Quick Links Section */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                      <ul className="space-y-2">
                        <li>
                          <a href="/" className="text-sm text-gray-300 hover:text-white">
                            Home
                          </a>
                        </li>
                        <li>
                          <a href="/predictions" className="text-sm text-gray-300 hover:text-white">
                            Predictions
                          </a>
                        </li>
                        <li>
                          <a href="/leaderboard" className="text-sm text-gray-300 hover:text-white">
                            Leaderboard
                          </a>
                        </li>
                        <li>
                          <a href="/profile" className="text-sm text-gray-300 hover:text-white">
                            Profile
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Rules Section */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">Rules</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>4 points for exact score prediction</li>
                        <li>2 points for correct result prediction</li>
                        <li>0 points for incorrect prediction</li>
                        <li>Predictions lock at kickoff time</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Copyright Notice */}
                  <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} {APP_NAME} - Premier League Predictions. Not affiliated with the Premier League.
                  </div>
                </div>
              </footer>
            </div>
            <AppBottomNav />
          </AuthProvider>
          
          {/* Toast Notifications - Global notification system */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

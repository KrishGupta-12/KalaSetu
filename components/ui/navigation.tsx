"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { User, Heart, LogOut } from "lucide-react"

export function Navigation() {
  const { user, userProfile, logout } = useAuth()

  return (
    <nav className="bg-soft-cream border-b border-warm-brown/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-heritage-gold rounded-lg flex items-center justify-center">
              <span className="text-deep-teal font-bold text-lg">K</span>
            </div>
            <span className="font-serif font-bold text-xl text-deep-teal">Kala Setu</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace" className="text-deep-teal hover:text-heritage-gold transition-colors">
              Marketplace
            </Link>
            <Link href="/artisans" className="text-deep-teal hover:text-heritage-gold transition-colors">
              Artisans
            </Link>
            <Link href="/stories" className="text-deep-teal hover:text-heritage-gold transition-colors">
              Stories
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <CartDrawer />
                <Button variant="ghost" size="sm" className="text-deep-teal">
                  <Heart className="w-4 h-4" />
                </Button>

                <Link href="/profile">
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.profile_image || "/placeholder.svg"} />
                      <AvatarFallback className="bg-heritage-gold text-deep-teal">
                        {userProfile?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-1">
                      <span className="sr-only">Open menu</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                        <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem asChild>
                      <Link href={userProfile?.role === "artisan" ? "/dashboard" : "/profile"}>
                        <User className="mr-2 h-4 w-4" />
                        {userProfile?.role === "artisan" ? "Dashboard" : "Profile"}
                      </Link>
                    </DropdownMenuItem>
                    {userProfile?.role === "buyer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/orders">
                          <User className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="text-deep-teal">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
                  <Link href="/register">Join Us</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

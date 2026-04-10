"use client"

import Link from 'next/link'
import React from 'react'
import { buttonVariants } from '../ui/button-variants'
import { ThemeToggle } from './Theme-toogle'
import { useConvexAuth } from 'convex/react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import SearchInput from './SearchInput'
import { MobileNav } from './MobileNav' // We'll create this below

const Navbar = () => {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();

    const onLogout = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logged out successfully");
                    router.push("/auth/login");
                },
                onError: (error) => {
                    toast.error(error.error.message);
                },
            }
        });
    };

    return (
        <nav className='w-full py-5 flex items-center justify-between px-4 md:px-0'>
            <div className='flex items-center gap-8'>
                <Link href="/">
                    <h1 className='text-2xl md:text-3xl font-bold'>
                        Blog<span className='text-primary'>Pro</span>
                    </h1>
                </Link>

                {/* Desktop Links - Hidden on Mobile */}
                <div className='hidden md:flex items-center gap-2'>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/">Home</Link>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/blog">Blog</Link>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/create">Create</Link>
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <div className='hidden md:block mr-2'>
                    <SearchInput />
                </div>

                {/* Auth Buttons - Hidden on Mobile to save space (moved to MobileNav) */}
                <div className='hidden md:flex items-center gap-2'>
                    {!isLoading && (
                        isAuthenticated ? (
                            <Button onClick={onLogout}>Logout</Button>
                        ) : (
                            <>
                                <Link className={buttonVariants()} href="/auth/sign-up">Sign Up</Link>
                                <Link className={buttonVariants({ variant: "outline" })} href="/auth/login">Login</Link>
                            </>
                        )
                    )}
                </div>

                <ThemeToggle />

                {/* Mobile Menu Trigger - Shown only on Mobile */}
                <div className='md:hidden'>
                    <MobileNav 
                        isAuthenticated={isAuthenticated} 
                        onLogout={onLogout} 
                    />
                </div>
            </div>
        </nav>
    )
}

export default Navbar
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


const Navbar = () => {

    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    return (
        <nav className='w-full py-5 flex items-center justify-between'>
            <div className='flex items-center gap-8'>

                <Link href="/">
                    <h1 className='text-3xl font-bold'>
                        Next<span className='text-primary'>Pro</span>
                    </h1>
                </Link>

                <div className='flex items-center gap-2'>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/">Home</Link>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/blog">Blog</Link>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/create">Create</Link>
                </div>
            </div>

            <div className='flex items-center gap-2'>

<div className='hidden md:block mr-2'>
    <SearchInput />
</div>

                {
                    isLoading ? null : isAuthenticated ? (
                        <Button onClick={ () => authClient.signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    toast.success("Logged out successfully");
                                    router.push("/auth/login");
                                },
                                onError: (error) => {toast.error(error.error.message);

                                },
                            }
                        })}>Logout</Button>
                    ): (
                        <>
                        <Link className={buttonVariants()} href="/auth/sign-up">Sign Up</Link>
                <Link className={buttonVariants({
                    variant: "outline"
                })} href="/auth/login">Login</Link>
                        </>
                    )
                }
                

                <ThemeToggle />
            </div>

        </nav>
    )
}

export default Navbar
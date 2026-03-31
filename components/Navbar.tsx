import Link from 'next/link'
import React from 'react'

const Navbar = () => {
    return (
        <nav className='w-full py-5 flex items-center justify-between'>
            <div className='flex items-center gap-8'>

                <Link href="/">
                    <h1 className='text-3xl font-bold'>
                        Next<span className='text-blue-500'>Pro</span>
                    </h1>
                </Link>

                <div className='flex items-center gap-2'>
                    <Link href="/">Home</Link>
                    <Link href="/">Blog</Link>
                    <Link href="/">Create</Link>
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <Link href="/auth/sign-up">Sign Up</Link>
                <Link href="/auth/login">Login</Link>

            </div>

        </nav>
    )
}

export default Navbar
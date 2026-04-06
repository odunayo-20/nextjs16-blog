"use client" // Ensure this is at the very top

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button, buttonVariants } from "../ui/button"
import Link from "next/link"
import SearchInput from "./SearchInput"
import { useState } from "react"

interface MobileNavProps {
    isAuthenticated: boolean;
    onLogout: () => void;
}

export function MobileNav({ isAuthenticated, onLogout }: MobileNavProps) {
    // 1. Control the open state
    const [open, setOpen] = useState(false);

    // Helper to close the sheet
    const closeMenu = () => setOpen(false);

    return (
        /* 2. Bind the state to the Sheet component */
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] px-8">
                <SheetHeader>
                    <SheetTitle className="text-left">
                        <Link href="/" onClick={closeMenu}>
                            <h1 className='text-2xl font-bold'>
                                Next<span className='text-primary'>Pro</span>
                            </h1>
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-6">
                    <div className="md:hidden mb-4">
                        <SearchInput />
                    </div>

                    {/* 3. Add onClick={closeMenu} to all links */}
                    <Link href="/" className="text-lg font-medium" onClick={closeMenu}>
                        Home
                    </Link>
                    <Link href="/blog" className="text-lg font-medium" onClick={closeMenu}>
                        Blog
                    </Link>
                    <Link href="/create" className="text-lg font-medium" onClick={closeMenu}>
                        Create
                    </Link>

                    <hr className="my-2" />

                    {isAuthenticated ? (
                        <Button 
                            onClick={() => {
                                onLogout();
                                closeMenu();
                            }} 
                            className="w-full"
                        >
                            Logout
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link 
                                href="/auth/login" 
                                className={buttonVariants({ variant: "outline" })}
                                onClick={closeMenu}
                            >
                                Login
                            </Link>
                            <Link 
                                href="/auth/sign-up" 
                                className={buttonVariants()}
                                onClick={closeMenu}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
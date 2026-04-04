"use client"


import Navbar from '@/components/web/Navbar'
import React, { ReactNode, Suspense } from 'react'


export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <>
     <Suspense fallback={<p>Loading page content...</p>}>
      <Navbar />
      {children}
      </Suspense>
    </>
  );
}


import { NextResponse } from "next/server";


export async function POST(request: Request) {
    console.log('Received POST request to create a blog article');

    return NextResponse.json({success: true})
}
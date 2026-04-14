import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");
    const date = searchParams.get("date");
    
    if (!title) {
        return new Response("Missing title", { status: 400 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#09090b',
            padding: '80px',
            position: 'relative',
          }}
        >
          {/* Top line decoration */}
          <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, height: '12px' }}>
              <div style={{ flex: 1, backgroundColor: '#3b82f6' }} />
              <div style={{ flex: 1, backgroundColor: '#8b5cf6' }} />
              <div style={{ flex: 1, backgroundColor: '#ec4899' }} />
          </div>

          <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '40px',
            }}
          >
             <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ color: '#09090b', fontWeight: 900, fontSize: 24, marginTop: '2px' }}>BP</span>
                 </div>
                 <p style={{ color: '#a1a1aa', fontSize: 28, margin: 0, marginLeft: '16px', fontWeight: 700, letterSpacing: '2px' }}>BLOG PRO</p>
             </div>
             
             <h1
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.2,
                margin: 0,
                padding: 0,
                marginTop: '60px',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>
          </div>
            
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             {date ? (
               <p style={{ color: '#71717a', fontSize: 28, margin: 0, fontWeight: 500 }}>
                 Published on {date}
               </p>
             ) : (
                <div />
             )}
             
             <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ color: '#3b82f6', fontSize: 28, margin: 0, fontWeight: 600 }}>read now</p>
             </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

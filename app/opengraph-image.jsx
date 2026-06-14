import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Humanizer AI — Turn AI Text Into Natural Human Writing Free';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              fontWeight: '800',
              color: 'white',
            }}
          >
            H
          </div>
          <span
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.5px',
            }}
          >
            Humanizer AI
          </span>
        </div>

        <div
          style={{
            fontSize: '62px',
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          AI Humanizer — Free
        </div>

        <div
          style={{
            fontSize: '26px',
            color: 'rgba(255,255,255,0.82)',
            textAlign: 'center',
            maxWidth: '780px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Turn ChatGPT, Claude &amp; Gemini output into natural, human-sounding writing in one click
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['No Sign-Up', 'Instant Results', '100% Free'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: '50px',
                padding: '10px 28px',
                fontSize: '19px',
                fontWeight: '600',
                color: 'white',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

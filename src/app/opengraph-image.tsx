import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Life Track - 人生の実績を記録しよう';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              color: '#166534',
              marginBottom: '20px',
            }}
          >
            Life Track
          </h1>
          <p
            style={{
              fontSize: '40px',
              color: '#15803d',
            }}
          >
            人生の実績を記録しよう
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 

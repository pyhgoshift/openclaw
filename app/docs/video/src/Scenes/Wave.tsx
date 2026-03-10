import React from 'react';
import { useCurrentFrame } from 'remotion';

const TEXT = 'LIQUID WAVE';

export const Wave: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <div style={{
            flex: 1,
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif',
            fontSize: '100px',
            color: '#fff',
            fontWeight: 'bold',
        }}>
            {TEXT.split('').map((char, i) => {
                const offset = Math.sin(frame * 0.1 + i * 0.5) * 20;
                return (
                    <span key={i} style={{ display: 'inline-block', transform: `translateY(${offset}px)` }}>
                        {char}
                    </span>
                );
            })}
        </div>
    );
};

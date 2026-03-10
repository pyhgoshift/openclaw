import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Scanline: React.FC = () => {
    const frame = useCurrentFrame();

    const scanlineY = interpolate(frame % 60, [0, 60], [0, 100]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ color: '#fff', fontFamily: 'monospace', fontSize: 100 }}>CRT EFFECT</h1>
            {/* Scanline */}
            <div style={{
                position: 'absolute',
                top: `${scanlineY}%`,
                left: 0,
                width: '100%',
                height: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                zIndex: 10,
            }} />
            {/* Interlacing */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 4px)',
                pointerEvents: 'none',
                zIndex: 5,
            }} />
        </AbsoluteFill>
    );
};

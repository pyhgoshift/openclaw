import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Climax: React.FC = () => {
    const frame = useCurrentFrame();

    const brightness = interpolate(frame, [0, 40, 60], [1, 2, 10]);
    const blur = interpolate(frame, [0, 40, 60], [0, 5, 20]);
    const whiteout = interpolate(frame, [40, 60], [0, 1]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{
                color: '#fff',
                fontFamily: 'sans-serif',
                fontSize: 150,
                fontWeight: 'bold',
                filter: `brightness(${brightness}) blur(${blur}px)`,
            }}>
                CLIMAX
            </h1>
            <AbsoluteFill style={{
                backgroundColor: '#fff',
                opacity: whiteout,
            }} />
        </AbsoluteFill>
    );
};

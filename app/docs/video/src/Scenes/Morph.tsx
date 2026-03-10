import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Morph: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const weight = interpolate(frame, [0, 30, 60], [100, 900, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div style={{
            flex: 1,
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#000',
        }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                `}
            </style>
            <h1 style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '150px',
                fontWeight: weight,
                margin: 0,
            }}>
                MORPH
            </h1>
        </div>
    );
};

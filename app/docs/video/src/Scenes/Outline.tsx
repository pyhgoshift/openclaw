import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Outline: React.FC = () => {
    const frame = useCurrentFrame();

    const progress = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const strokeDashoffset = interpolate(progress, [0, 1], [1000, 0]);

    return (
        <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 200">
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    style={{
                        fontFamily: 'sans-serif',
                        fontSize: '120px',
                        fill: 'transparent',
                        stroke: '#0ff',
                        strokeWidth: '2px',
                        strokeDasharray: '1000',
                        strokeDashoffset: strokeDashoffset,
                        filter: 'drop-shadow(0 0 5px #0ff) drop-shadow(0 0 10px #0ff)',
                    }}
                >
                    OUTLINE
                </text>
            </svg>
        </div>
    );
};

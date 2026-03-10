import React from 'react';
import { AbsoluteFill, useCurrentFrame, random } from 'remotion';

export const Pulse: React.FC = () => {
    const frame = useCurrentFrame();

    // Random offsets for "shaking" effect
    const offsetX = (random(frame) - 0.5) * 10;
    const offsetY = (random(frame + 1) - 0.5) * 10;

    // Chromatic aberration offsets
    const rOffset = (Math.sin(frame * 0.5) * 5) + 5;
    const bOffset = (Math.sin(frame * 0.5 + Math.PI) * 5) - 5;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
                <h1 style={{
                    color: '#fff',
                    fontFamily: 'sans-serif',
                    fontSize: 150,
                    fontWeight: 'bold',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translate(${offsetX + rOffset}px, ${offsetY}px)`,
                    opacity: 0.7,
                    mixBlendMode: 'screen',
                    color: '#f00',
                }}>
                    PULSE
                </h1>
                <h1 style={{
                    color: '#fff',
                    fontFamily: 'sans-serif',
                    fontSize: 150,
                    fontWeight: 'bold',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translate(${offsetX + bOffset}px, ${offsetY}px)`,
                    opacity: 0.7,
                    mixBlendMode: 'screen',
                    color: '#00f',
                }}>
                    PULSE
                </h1>
                <h1 style={{
                    color: '#fff',
                    fontFamily: 'sans-serif',
                    fontSize: 150,
                    fontWeight: 'bold',
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                }}>
                    PULSE
                </h1>
            </div>
        </AbsoluteFill>
    );
};

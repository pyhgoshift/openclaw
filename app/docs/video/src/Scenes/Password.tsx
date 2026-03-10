import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';

const RandomChar: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
    const frame = useCurrentFrame();
    const config = useVideoConfig();

    const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const char = useMemo(() => {
        return CHARS[Math.floor(Math.random() * CHARS.length)];
    }, []);

    // Change char every 5 frames
    const displayChar = CHARS[Math.floor(((frame - delay) / 5) % CHARS.length)] || char;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                opacity,
                color: '#0f0',
                fontFamily: 'monospace',
                fontSize: 24,
                textShadow: '0 0 5px #0f0',
            }}
        >
            {displayChar}
        </div>
    );
};

export const Password: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const cols = 20;
    const rows = 10;

    const matrix = useMemo(() => {
        const items = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                items.push({
                    x: (i / cols) * 100,
                    y: (j / rows) * 100,
                    delay: Math.random() * 30,
                    key: `${i}-${j}`
                });
            }
        }
        return items;
    }, []);

    const progress = spring({
        frame,
        fps,
        config: { damping: 200 },
        durationInFrames: 40,
    });

    const textReveal = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const unlockReveal = interpolate(frame, [50, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {matrix.map((item) => (
                <RandomChar key={item.key} {...item} />
            ))}

            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                    fontFamily: 'monospace',
                    color: '#0f0',
                    fontSize: 80,
                    fontWeight: 'bold',
                    textShadow: '0 0 10px #0f0',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '20px',
                    border: '2px solid #0f0',
                    opacity: textReveal
                }}>
                    KEY: {frame > 40 ? '********' : '........'}
                </div>
                <div style={{
                    fontFamily: 'monospace',
                    color: '#fff',
                    fontSize: 40,
                    fontWeight: 'bold',
                    textShadow: '0 0 10px #fff',
                    marginTop: 20,
                    opacity: unlockReveal
                }}>
                    SYSTEM UNLOCKED
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

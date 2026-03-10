import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

const TARGET_TEXT = 'REMOTION';
const RANDOM_CHARS = '01';

export const StreamDecode: React.FC = () => {
    const frame = useCurrentFrame();

    const displayText = useMemo(() => {
        return TARGET_TEXT.split('').map((char, i) => {
            // Reveal character based on frame count (e.g., every 5 frames reveal one char)
            if (frame > i * 5) {
                return char;
            }
            // Otherwise show random char
            return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
        }).join('');
    }, [frame]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ color: '#0f0', fontFamily: 'monospace', fontSize: 100 }}>
                {displayText}
            </h1>
        </AbsoluteFill>
    );
};

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const Pattern: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <div style={{ ...style, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <div style={{
            width: '300px',
            height: '300px',
            border: '10px solid #f0f',
            borderRadius: '50%',
            transform: 'rotate(45deg)',
            background: 'linear-gradient(45deg, #f00, #00f)',
        }}></div>
    </div>
);

export const Mirror: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    const rotation = interpolate(frame, [0, 60], [0, 360]);
    const scale = interpolate(frame, [0, 30, 60], [1, 1.5, 1]);

    const commonStyle: React.CSSProperties = {
        width: width / 2,
        height: height / 2,
        position: 'absolute',
        overflow: 'hidden',
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {/* Top Left */}
                <div style={{ ...commonStyle, top: 0, left: 0 }}>
                    <div style={{ transform: `rotate(${rotation}deg) scale(${scale})`, width: '200%', height: '200%', position: 'absolute', top: '-50%', left: '-50%' }}>
                        <Pattern />
                    </div>
                </div>
                {/* Top Right (Mirrored Horizontal) */}
                <div style={{ ...commonStyle, top: 0, left: '50%', transform: 'scaleX(-1)' }}>
                    <div style={{ transform: `rotate(${rotation}deg) scale(${scale})`, width: '200%', height: '200%', position: 'absolute', top: '-50%', left: '-50%' }}>
                        <Pattern />
                    </div>
                </div>
                {/* Bottom Left (Mirrored Vertical) */}
                <div style={{ ...commonStyle, top: '50%', left: 0, transform: 'scaleY(-1)' }}>
                    <div style={{ transform: `rotate(${rotation}deg) scale(${scale})`, width: '200%', height: '200%', position: 'absolute', top: '-50%', left: '-50%' }}>
                        <Pattern />
                    </div>
                </div>
                {/* Bottom Right (Mirrored Both) */}
                <div style={{ ...commonStyle, top: '50%', left: '50%', transform: 'scale(-1, -1)' }}>
                    <div style={{ transform: `rotate(${rotation}deg) scale(${scale})`, width: '200%', height: '200%', position: 'absolute', top: '-50%', left: '-50%' }}>
                        <Pattern />
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

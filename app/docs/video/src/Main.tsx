import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Password } from './Scenes/Password';
import { Particles } from './Scenes/Particles';
import { Outline } from './Scenes/Outline';
import { Morph } from './Scenes/Morph';
import { Mirror } from './Scenes/Mirror';
import { Wave } from './Scenes/Wave';
import { Scanline } from './Scenes/Scanline';
import { StreamDecode } from './Scenes/StreamDecode';
import { Pulse } from './Scenes/Pulse';
import { Climax } from './Scenes/Climax';

export const Main: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <Sequence from={0} durationInFrames={60}>
                <Password />
            </Sequence>
            <Sequence from={60} durationInFrames={60}>
                <Particles />
            </Sequence>
            <Sequence from={120} durationInFrames={60}>
                <Outline />
            </Sequence>
            <Sequence from={180} durationInFrames={60}>
                <Morph />
            </Sequence>
            <Sequence from={240} durationInFrames={60}>
                <Mirror />
            </Sequence>
            <Sequence from={300} durationInFrames={60}>
                <Wave />
            </Sequence>
            <Sequence from={360} durationInFrames={60}>
                <Scanline />
            </Sequence>
            <Sequence from={420} durationInFrames={60}>
                <StreamDecode />
            </Sequence>
            <Sequence from={480} durationInFrames={60}>
                <Pulse />
            </Sequence>
            <Sequence from={540} durationInFrames={60}>
                <Climax />
            </Sequence>
        </AbsoluteFill>
    );
};

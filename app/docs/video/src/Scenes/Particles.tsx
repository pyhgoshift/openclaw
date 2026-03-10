import React, { useMemo, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise3D } from '@remotion/noise';

const ParticleCount = 50;

const ParticlesInner: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(ParticleCount * 3);
        const velocities = [];

        for (let i = 0; i < ParticleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // z
            velocities.push({
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1,
            });
        }
        return { positions, velocities };
    }, []);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const time = clock.getElapsedTime();

        for (let i = 0; i < ParticleCount; i++) {
            // Use noise for organic movement
            const noiseX = noise3D('x', i, i, time * 0.5);
            const noiseY = noise3D('y', i, i, time * 0.5);
            const noiseZ = noise3D('z', i, i, time * 0.5);

            positions[i * 3] += particles.velocities[i].x + noiseX * 0.02;
            positions[i * 3 + 1] += particles.velocities[i].y + noiseY * 0.02;
            positions[i * 3 + 2] += particles.velocities[i].z + noiseZ * 0.02;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        // Rotate the whole system
        pointsRef.current.rotation.y = time * 0.2;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={ParticleCount}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#00ffff"
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
};

export const Particles: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <ParticlesInner />
            </Canvas>
        </AbsoluteFill>
    );
};

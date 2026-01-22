import { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const particleCount = 50;
        const particles = [];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random properties
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 15;
            const duration = Math.random() * 10 + 15;

            // Random colors
            const colors = [
                'rgba(139, 92, 246, 0.4)',
                'rgba(6, 182, 212, 0.4)',
                'rgba(236, 72, 153, 0.3)',
                'rgba(34, 211, 238, 0.3)',
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
      `;

            container.appendChild(particle);
            particles.push(particle);
        }

        // Cleanup
        return () => {
            particles.forEach((p) => p.remove());
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="particles-container"
            aria-hidden="true"
        />
    );
};

export default ParticlesBackground;

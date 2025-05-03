import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  velocity: {
    x: number;
    y: number;
    rotation: number;
  };
}

interface ConfettiProps {
  duration?: number;
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

export function Confetti({
  duration = 2000,
  particleCount = 50,
  spread = 50,
  colors = ['#FF69B4', '#FFD700', '#7B68EE', '#00CED1', '#FF6347']
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 8 + Math.random() * 4;
      
      return {
        x: centerX,
        y: centerY,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random() * 0.5,
        velocity: {
          x: Math.cos(angle) * velocity * (0.5 + Math.random()),
          y: Math.sin(angle) * velocity * (0.5 + Math.random()) - 3,
          rotation: -4 + Math.random() * 8
        }
      };
    });

    startTimeRef.current = Date.now();

    // Animation loop
    function animate() {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.map(particle => {
        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.scale(particle.scale, particle.scale);
        
        // Draw confetti piece
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.rect(-5, -5, 10, 10);
        ctx.fill();
        ctx.restore();

        // Update particle position
        return {
          ...particle,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y + 0.5, // gravity
          rotation: particle.rotation + particle.velocity.rotation,
          velocity: {
            ...particle.velocity,
            y: particle.velocity.y + 0.2 // gravity
          }
        };
      });

      // Continue animation if within duration
      if (Date.now() - (startTimeRef.current || 0) < duration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colors, duration, particleCount, spread]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
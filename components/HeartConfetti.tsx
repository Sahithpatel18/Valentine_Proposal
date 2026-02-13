
import React, { useEffect, useRef } from 'react';

const HeartConfetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const hearts: any[] = [];
    const heartCount = 100;

    for (let i = 0; i < heartCount; i++) {
      hearts.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 3 + 2,
        velX: (Math.random() - 0.5) * 4,
        color: `hsl(${Math.random() * 30 + 330}, 100%, ${Math.random() * 20 + 50}%)`,
        angle: Math.random() * Math.PI * 2
      });
    }

    function drawHeart(x: number, y: number, size: number, color: string, angle: number) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(angle);
      ctx!.beginPath();
      ctx!.fillStyle = color;
      ctx!.moveTo(0, 0);
      ctx!.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
      ctx!.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
      ctx!.fill();
      ctx!.restore();
    }

    let animationId: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      hearts.forEach(h => {
        h.y -= h.speed;
        h.x += h.velX;
        h.angle += 0.05;
        drawHeart(h.x, h.y, h.size, h.color, h.angle);
        
        if (h.y < -50) {
          h.y = canvas!.height + 50;
          h.x = Math.random() * canvas!.width;
        }
      });
      animationId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

export default HeartConfetti;

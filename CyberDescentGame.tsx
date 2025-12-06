import React, { useEffect, useRef, useState } from 'react';

interface Props {
  isGlitching: boolean;
  onCrash: () => void;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
}

interface Particle {
    x: number;
    y: number;
    color: string;
    life: number;
    vx: number;
    vy: number;
}

const CyberDescentGame: React.FC<Props> = ({ isGlitching, onCrash }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  
  // Game State Refs (for performance)
  const enemiesRef = useRef<Point3D[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const starsRef = useRef<Point3D[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize Stars
    for (let i = 0; i < 100; i++) {
        starsRef.current.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            z: Math.random()
        });
    }

    // Input Handling
    const onMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseDown = () => {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        
        // Spawn shot particles
        for(let i=0; i<8; i++) {
            particlesRef.current.push({
                x: mx,
                y: my,
                color: '#00FFFF',
                life: 1.0,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15
            });
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);

    // Game Loop
    const render = () => {
      frameRef.current++;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 350;

      // --- CLEAR LOGIC ---
      if (isGlitching) {
        // Transparent clear for glitch overlay mode
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        // Trail effect for normal game
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Starfield
      if (!isGlitching) {
          ctx.fillStyle = '#FFFFFF';
          starsRef.current.forEach(star => {
              star.z -= 0.002;
              if (star.z <= 0) star.z = 1;
              const x = (star.x - centerX) * (1/star.z) + centerX;
              const y = (star.y - centerY) * (1/star.z) + centerY;
              ctx.globalAlpha = star.z;
              ctx.fillRect(x, y, 2, 2);
          });
          ctx.globalAlpha = 1.0;
      }

      // Draw Retro Grid Floor
      ctx.strokeStyle = isGlitching ? '#FF0000' : '#ff00ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const time = frameRef.current * 3;
      const speed = 25;
      
      // Horizontal moving lines (floor)
      for (let z = 0; z < 2000; z+=100) {
          const depth = (z - (time * speed) % 100);
          if (depth <= 0) continue;
          
          const scale = fov / depth;
          const y = centerY + 100 * scale; 
          
          if (y > canvas.height) continue;
          if (y < centerY) continue;

          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
      }
      
      // Perspective Lines
      for (let x = -2000; x <= 2000; x+=200) {
          ctx.moveTo(centerX, centerY); 
          const scaleClose = fov / 100;
          const xClose = centerX + x * scaleClose;
          const yClose = centerY + 100 * scaleClose;
          ctx.lineTo(xClose, yClose);
      }
      ctx.globalAlpha = isGlitching ? 0.6 : 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Horizon Glow
      if (!isGlitching) {
        const gradient = ctx.createLinearGradient(0, centerY - 50, 0, centerY);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, '#ff00ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, centerY - 50, canvas.width, 50);
      }

      // Spawn Enemies
      if (frameRef.current % 30 === 0 && enemiesRef.current.length < 15) {
          enemiesRef.current.push({
              x: (Math.random() - 0.5) * 1200,
              y: (Math.random() - 0.5) * 600 - 100, 
              z: 2000
          });
      }

      // Update & Draw Enemies
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const enemy = enemiesRef.current[i];
          enemy.z -= 20; // Faster speed

          if (enemy.z <= 10) {
              enemiesRef.current.splice(i, 1);
              continue;
          }

          const scale = fov / enemy.z;
          const screenX = centerX + enemy.x * scale;
          const screenY = centerY + enemy.y * scale;
          const size = 120 * scale;

          // Enemy visuals
          ctx.strokeStyle = isGlitching ? '#FFFFFF' : (i % 2 === 0 ? '#00FF00' : '#FFFF00');
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY - size);
          ctx.lineTo(screenX - size/2, screenY);
          ctx.lineTo(screenX, screenY + size);
          ctx.lineTo(screenX + size/2, screenY);
          ctx.closePath();
          ctx.stroke();
          
          // Hover/Aim effect
          const dx = mouseRef.current.x - screenX;
          const dy = mouseRef.current.y - screenY;
          if (Math.sqrt(dx*dx + dy*dy) < size) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fill();
              
              // Auto-damage simulation for visual flair
              if (frameRef.current % 3 === 0) {
                   setScore(s => s + 25);
                   // Explosion
                   for(let p=0; p<4; p++) {
                        particlesRef.current.push({
                            x: screenX,
                            y: screenY,
                            color: isGlitching ? '#FF0000' : '#FFA500',
                            life: 1.0,
                            vx: (Math.random() - 0.5) * 25,
                            vy: (Math.random() - 0.5) * 25
                        });
                   }
              }
          }
      }

      // Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          
          if (p.life <= 0) {
              particlesRef.current.splice(i, 1);
              continue;
          }
          
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, isGlitching ? 6 : 4, isGlitching ? 6 : 4);
          ctx.globalAlpha = 1.0;
      }

      // Draw Crosshair
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      ctx.strokeStyle = isGlitching ? '#FF0000' : '#00FFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, 25, 0, Math.PI * 2);
      ctx.moveTo(mx - 40, my);
      ctx.lineTo(mx + 40, my);
      ctx.moveTo(mx, my - 40);
      ctx.lineTo(mx, my + 40);
      ctx.stroke();

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    // Hard crash timer
    let crashTimer: NodeJS.Timeout;
    if (isGlitching) {
       crashTimer = setTimeout(() => {
         onCrash();
       }, 12000); 
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      if (crashTimer) clearTimeout(crashTimer);
    };
  }, [isGlitching, onCrash]);

  return (
    <div className="w-full h-full relative overflow-hidden font-mono cursor-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
      
      {/* HUD */}
      {!isGlitching && (
        <>
            <div className="absolute top-4 left-4 text-[#00FFFF] text-3xl font-bold font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                SCORE: {score.toString().padStart(6, '0')}
            </div>
            
            <div className="absolute bottom-4 left-4 flex gap-8">
                <div className="text-[#FF00FF] font-bold text-2xl drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
                    SHIELD: {health}%
                </div>
                <div className="text-white font-bold text-2xl">
                    ZONE: SECTOR_7
                </div>
            </div>
            
            <div className="absolute top-4 right-4 text-xs text-green-500 font-mono animate-pulse bg-black/50 p-2 rounded border border-green-500/30">
                PING: 14ms<br/>
                FPS: 144
            </div>
        </>
      )}
    </div>
  );
};

export default CyberDescentGame;
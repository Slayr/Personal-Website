import React, { useRef, useEffect, useCallback } from 'react';

const CharacterBackground = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null, radius: 100 });
  const characters = useRef([]);
  const animationFrameId = useRef(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const charPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const numCharacters = 1500; // A lot of characters
    const charSize = 8; // Very small

    characters.current = [];
    for (let i = 0; i < numCharacters; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const char = charPool[Math.floor(Math.random() * charPool.length)];
      characters.current.push({
        x,
        y,
        baseX: x,
        baseY: y,
        char,
        size: charSize,
        density: (Math.random() * 20) + 1, // For varied movement
      });
    }

    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)'; // Grey, more visible
    ctx.font = `${charSize}px Arial`;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    characters.current.forEach(char => {
      let dx = mouse.current.x - char.x;
      let dy = mouse.current.y - char.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = mouse.current.radius;
      let repulsionForce = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * repulsionForce * char.density;
      let directionY = forceDirectionY * repulsionForce * char.density;

      if (distance < mouse.current.radius) {
        char.x -= directionX;
        char.y -= directionY;
      } else {
        if (char.x !== char.baseX) {
          let dx = char.x - char.baseX;
          char.x -= dx / 10;
        }
        if (char.y !== char.baseY) {
          let dy = char.y - char.baseY;
          char.y -= dy / 10;
        }
      }
      ctx.fillText(char.char, char.x, char.y);
    });

    animationFrameId.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    init();
    animationFrameId.current = requestAnimationFrame(draw);

    const handleMouseMove = (e) => {
      mouse.current.x = e.x;
      mouse.current.y = e.y;
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(); // Re-initialize character positions on resize
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [init, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        backgroundColor: '#000000', // Pitch black
      }}
    />
  );
};

export default CharacterBackground;

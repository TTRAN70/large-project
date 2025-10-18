import { useState, useEffect, useRef } from "react";

export default function BouncingCat() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState({ x: 3, y: 2 });
  const containerRef = useRef<HTMLDivElement>(null);
  const catSize = 300;

  useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;

        const container = containerRef.current;
        if (container) {
          const maxX = container.clientWidth - catSize;
          const maxY = container.clientHeight - catSize;

          if (newX <= 0 || newX >= maxX) {
            newVelX = -newVelX;
            newX = newX <= 0 ? 0 : maxX;
          }
          if (newY <= 0 || newY >= maxY) {
            newVelY = -newVelY;
            newY = newY <= 0 ? 0 : maxY;
          }

          if (newVelX !== velocity.x || newVelY !== velocity.y) {
            setVelocity({ x: newVelX, y: newVelY });
          }
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      <img
        src="/yup.png"
        alt="Bouncing cat"
        className="absolute transition-transform duration-100 select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${catSize}px`,
          height: `${catSize}px`,
        }}
      />
    </div>
  );
}

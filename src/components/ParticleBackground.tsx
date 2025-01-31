import { useEffect, useState } from "react";

// Define the particle type
interface Particle {
  id: number;
  left: string;
  top: string;
  animationDelay: string;
}

const ParticleBackground = () => {
  // Use the defined type for the state
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${i * 0.5}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-20 pointer-events-none">
      {particles.map(({ id, left, top, animationDelay }) => (
        <div
          key={id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
          style={{ left, top, animationDelay }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;

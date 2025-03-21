// Portfolio  Copyright (C) 2025  LunarcatOwO
// This program comes with ABSOLUTELY NO WARRANTY.
// This is free software, and you are welcome to redistribute it
// under certain conditions.
import React, { useEffect, useRef } from 'react';

// TypeScript interfaces
interface RainStream {
  x: number;
  y: number;
  speed: number;
  segments: RainSegment[];
  maxLength: number;
  nextSegmentTimer: number;
  colorScheme: 'pink' | 'blue' | 'purple' | 'green';
  segmentSize: number;
}

interface RainSegment {
  x: number;
  y: number;
  creation: number;
  intensity: number;
  onFloor?: boolean;
  floorTime?: number;
}

// Floor configuration
interface FloorConfig {
  height: number;
  glowIntensity: number;
  particleLifespan: number; // How long particles stay on the floor (ms)
}

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Floor configuration
    const floor: FloorConfig = {
      height: 2, // Height of the floor line
      glowIntensity: 0.4, // Intensity of the glow effect
      particleLifespan: 3000, // How long particles stay on floor before fading (ms)
    };
    
    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Create an array to hold rain streams
    const streams: RainStream[] = [];
    
    // Initialize streams
    const initializeStreams = () => {
      streams.length = 0;
      
      const segmentSize = 14;
      const columns = Math.ceil(canvas.width / (segmentSize * 0.6));
      
      for (let i = 0; i < columns; i++) {
        const colorRand = Math.random();
        // New distribution: pink 50%, purple 20%, green 15%, blue 15%
        let colorScheme: 'pink' | 'blue' | 'purple' | 'green';
        
        if (colorRand < 0.5) {
          colorScheme = 'pink';
        } else if (colorRand < 0.7) {
          colorScheme = 'purple';
        } else if (colorRand < 0.85) {
          colorScheme = 'green';
        } else {
          colorScheme = 'blue';
        }
          
        streams.push({
          x: i * (segmentSize * 0.6),
          y: -100 - Math.random() * canvas.height,
          speed: 1 + Math.random() * 5,
          segments: [],
          maxLength: 5 + Math.floor(Math.random() * 30),
          nextSegmentTimer: Math.random() * 10,
          colorScheme: colorScheme,
          segmentSize: 12 + Math.floor(Math.random() * 6),
        });
      }
    };
    
    initializeStreams();
    window.addEventListener('resize', initializeStreams);
    
    // Draw the glowing floor
    const drawFloor = () => {
      const floorY = canvas.height - floor.height;
      
      // Create a deeper gradient for the floor glow to better blend with background
      const gradient = ctx.createLinearGradient(0, floorY - 30, 0, floorY + floor.height);
      
      // Add color stops to gradient with more subtle transitions
      gradient.addColorStop(0, `rgba(0, 0, 0, 0)`); // Start completely transparent
      gradient.addColorStop(0.7, `rgba(40, 40, 40, ${floor.glowIntensity * 0.3})`); // Subtle dark glow
      gradient.addColorStop(1, `rgba(70, 70, 70, ${floor.glowIntensity * 0.5})`); // Slightly more visible at bottom
      
      // Draw a more subtle floor glow
      ctx.fillStyle = gradient;
      ctx.fillRect(0, floorY - 30, canvas.width, 30 + floor.height);
      
      // Draw a very thin, barely visible floor line
      ctx.fillStyle = `rgba(100, 100, 100, ${floor.glowIntensity * 0.4})`;
      ctx.fillRect(0, floorY, canvas.width, Math.max(1, floor.height * 0.5));
    };
    
    // Animation function
    const animate = () => {
      // Slightly fade out the previous frame for trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const currentTime = Date.now();
      const floorY = canvas.height - floor.height;
      
      // Draw the floor
      drawFloor();
      
      // Draw and update each stream
      streams.forEach(stream => {
        // Add new segments to streams at intervals
        stream.nextSegmentTimer -= 1;
        if (stream.nextSegmentTimer <= 0 && stream.segments.length < stream.maxLength) {
          stream.segments.push({
            x: stream.x + (Math.random() * 6 - 3), // Small random x offset
            y: stream.y,
            creation: currentTime,
            intensity: 0.2 + Math.random() * 0.8,
          });
          stream.nextSegmentTimer = 2 + Math.random() * 8;
        }
        
        // Draw each segment in the stream
        stream.segments.forEach((segment, index) => {
          const isLast = index === stream.segments.length - 1;
          
          // Alpha calculation based on segment state
          let alpha;
          if (segment.onFloor) {
            // Calculate how long the segment has been on the floor
            const timeOnFloor = currentTime - segment.floorTime!;
            const lifeProgress = timeOnFloor / floor.particleLifespan;
            
            // Fade out as it reaches its lifespan
            alpha = Math.max(0, 1 - lifeProgress) * 0.8;
          } else {
            // Regular alpha for falling segments
            alpha = isLast ? 1 : 0.8 - (index / stream.segments.length) * 0.7;
          }
          
          // Skip rendering if completely transparent
          if (alpha <= 0) return;
          
          // Set color based on stream's color scheme
          let color;
          if (stream.colorScheme === 'pink') {
            color = isLast && !segment.onFloor
              ? `rgba(255, 220, 240, ${alpha})` 
              : `rgba(255, 20, 147, ${alpha})`;
          } else if (stream.colorScheme === 'blue') {
            color = isLast && !segment.onFloor
              ? `rgba(220, 220, 255, ${alpha})` 
              : `rgba(30, 144, 255, ${alpha})`;
          } else if (stream.colorScheme === 'green') {
            color = isLast && !segment.onFloor
              ? `rgba(220, 255, 220, ${alpha})` 
              : `rgba(0, 255, 70, ${alpha})`;
          } else {
            color = isLast && !segment.onFloor
              ? `rgba(255, 220, 255, ${alpha})` 
              : `rgba(180, 0, 255, ${alpha})`;
          }
          
          ctx.fillStyle = color;
          
          // Determine segment dimensions
          const segmentHeight = stream.segmentSize * segment.intensity;
          
          // Draw the segment
          ctx.fillRect(
            segment.x, 
            segment.y, 
            stream.segmentSize / 3, 
            segment.onFloor ? 2 : segmentHeight
          );
          
          // Add glow effects
          if ((isLast && !segment.onFloor) || segment.onFloor) {
            ctx.shadowBlur = segment.onFloor ? 6 : 8;
            ctx.shadowColor = stream.colorScheme === 'pink' 
              ? 'rgba(255, 20, 147, 0.7)' 
              : (stream.colorScheme === 'blue' 
                ? 'rgba(30, 144, 255, 0.7)' 
                : (stream.colorScheme === 'green'
                  ? 'rgba(0, 255, 70, 0.7)'
                  : 'rgba(180, 0, 255, 0.7)'));
            
            ctx.fillRect(
              segment.x, 
              segment.y, 
              stream.segmentSize / 3, 
              segment.onFloor ? 2 : segmentHeight
            );
            ctx.shadowBlur = 0;
          }
        });
        
        // Move the entire stream down
        stream.y += stream.speed;
        
        // Move all segments down with the stream or handle floor interaction
        stream.segments.forEach(segment => {
          // If already on floor, don't move
          if (segment.onFloor) return;
          
          // Update position
          segment.y += stream.speed;
          
          // Check if this segment has hit the floor
          if (segment.y + stream.segmentSize > floorY) {
            segment.y = floorY - 2; // Position just above the floor
            segment.onFloor = true;
            segment.floorTime = currentTime;
          }
        });
        
        // Remove segments that have either:
        // - fallen off screen
        // - or exceeded their lifespan on the floor
        stream.segments = stream.segments.filter(segment => {
          if (segment.onFloor) {
            const timeOnFloor = currentTime - segment.floorTime!;
            return timeOnFloor < floor.particleLifespan;
          }
          return segment.y < canvas.height;
        });
        
        // Reset stream if it's gone off screen and all its segments are gone
        if (stream.y - (stream.maxLength * stream.segmentSize) > canvas.height && stream.segments.length === 0) {
          stream.y = -100 - Math.random() * 500; // Reset position above screen
          stream.speed = 1 + Math.random() * 5; // Random speed
          stream.maxLength = 5 + Math.floor(Math.random() * 30); // Random length
          stream.segments = []; // Clear any remaining segments
          
          // Occasionally change color scheme when resetting
          if (Math.random() > 0.8) {
            // Updated distribution: 35% pink, 25% purple, 20% green, 20% blue
            const randomValue = Math.random();
            if (randomValue < 0.35) {
              stream.colorScheme = 'pink';
            } else if (randomValue < 0.6) {
              stream.colorScheme = 'purple';
            } else if (randomValue < 0.8) {
              stream.colorScheme = 'green';
            } else {
              stream.colorScheme = 'blue';
            }
          }
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', initializeStreams);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Keep the background behind other content
        background: 'black',
        opacity: 0.8,
      }}
    />
  );
};

export default Background;
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
}

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    
    // Animation function
    const animate = () => {
      // Slightly fade out the previous frame for trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const currentTime = Date.now();
      
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
          // Segment at head of stream is brightest
          let alpha = index === stream.segments.length - 1 ? 1 : 0.8 - (index / stream.segments.length) * 0.7;
          
          // Set color based on stream's color scheme
          let color;
          if (stream.colorScheme === 'pink') {
            color = index === stream.segments.length - 1 
              ? `rgba(255, 220, 240, ${alpha})` 
              : `rgba(255, 20, 147, ${alpha})`;
          } else if (stream.colorScheme === 'blue') {
            color = index === stream.segments.length - 1 
              ? `rgba(220, 220, 255, ${alpha})` 
              : `rgba(30, 144, 255, ${alpha})`;
          } else if (stream.colorScheme === 'green') {
            color = index === stream.segments.length - 1 
              ? `rgba(220, 255, 220, ${alpha})` 
              : `rgba(0, 255, 70, ${alpha})`;
          } else {
            color = index === stream.segments.length - 1 
              ? `rgba(255, 220, 255, ${alpha})` 
              : `rgba(180, 0, 255, ${alpha})`;
          }
          
          ctx.fillStyle = color;
          
          // Draw a small rectangle/segment instead of text
          const segmentHeight = stream.segmentSize * segment.intensity;
          ctx.fillRect(
            segment.x, 
            segment.y, 
            stream.segmentSize / 3, 
            segmentHeight
          );
          
          // Add a glow effect to the leading segment
          if (index === stream.segments.length - 1) {
            ctx.shadowBlur = 8;
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
              segmentHeight
            );
            ctx.shadowBlur = 0;
          }
        });
        
        // Move the entire stream down
        stream.y += stream.speed;
        
        // Move all segments down with the stream
        stream.segments.forEach(segment => {
          segment.y += stream.speed;
        });
        
        // Remove segments that have fallen off screen
        stream.segments = stream.segments.filter(segment => segment.y < canvas.height);
        
        // Reset stream if it's gone off screen
        if (stream.y - (stream.maxLength * stream.segmentSize) > canvas.height) {
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
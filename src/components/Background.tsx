import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    const mountElement = mountRef.current;
    
    // Set up scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 150;
    camera.position.x = -25;
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    mountElement.appendChild(renderer.domElement);
    
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    // Create the globe
    const geometry = new THREE.SphereGeometry(50, 64, 64);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x1a4674,
      opacity: 0.7,
      transparent: true,
      shininess: 30
    });
    
    const globe = new THREE.Mesh(geometry, material);
    globe.position.x = -140;
    scene.add(globe);

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Increased ambient light
    scene.add(ambientLight);

    // Create network nodes and connections
    const networkNodes: THREE.Vector3[] = [];
    const networkHubs: THREE.Vector3[] = [];
    const networkLines: THREE.Line[] = [];
    const numNodes = 80;
    const numHubs = 12;
    const radius = 51;
    
    function getRandomPointOnSphere(radius: number): THREE.Vector3 {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }
    
    // Create hub nodes first
    for (let i = 0; i < numHubs; i++) {
      const hubNode = getRandomPointOnSphere(radius);
      networkHubs.push(hubNode);
      networkNodes.push(hubNode);
    }
    
    // Create regular nodes
    for (let i = 0; i < numNodes - numHubs; i++) {
      networkNodes.push(getRandomPointOnSphere(radius));
    }

    // Create visible nodes with different sizes
    const hubGeometry = new THREE.BufferGeometry().setFromPoints(networkHubs);
    const hubMaterial = new THREE.PointsMaterial({
      color: 0x47c0ff,
      size: 1.5,
      transparent: true,
      opacity: 0.9
    });
    const hubPoints = new THREE.Points(hubGeometry, hubMaterial);
    globe.add(hubPoints);
    
    // Create regular nodes (smaller)
    const regularNodes = networkNodes.filter(node => !networkHubs.includes(node));
    const nodeGeometry = new THREE.BufferGeometry().setFromPoints(regularNodes);
    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x47c0ff,
      size: 0.6,
      transparent: true,
      opacity: 0.7
    });
    const points = new THREE.Points(nodeGeometry, nodeMaterial);
    globe.add(points);
    
    // Function to create a smooth arc between two points on the globe
    const createArcPoints = (start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3[] => {
      const angle = start.angleTo(end);
      const segments = 20;
      const arcPoints: THREE.Vector3[] = [];
      
      // Add first point
      arcPoints.push(start.clone());
      
      // Get the midpoint between start and end
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      midPoint.normalize();
      
      // Calculate an appropriate arc height based on the angle between points
      const arcHeight = 6 + (angle * 20); // Increased height for better visibility
      
      // Create control point for the arc
      const controlPoint = midPoint.clone().multiplyScalar(radius + arcHeight);
      
      // Create a quadratic bezier curve
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        
        // Quadratic bezier curve calculation
        const point = new THREE.Vector3();
        
        // First, interpolate from start to control point
        const startToControl = new THREE.Vector3().lerpVectors(start, controlPoint, t);
        
        // Then, interpolate from control point to end
        const controlToEnd = new THREE.Vector3().lerpVectors(controlPoint, end, t);
        
        // Finally, interpolate between these two points
        point.lerpVectors(startToControl, controlToEnd, t);
        
        arcPoints.push(point);
      }
      
      // Add end point
      arcPoints.push(end.clone());
      
      return arcPoints;
    };
    
    // Find closest node to a given node
    const findNearestNodes = (node: THREE.Vector3, count: number): number[] => {
      const distances = networkNodes.map((n, index) => {
        if (n === node) return { index, distance: Infinity };
        return { index, distance: node.distanceTo(n) };
      });
      
      return distances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count)
        .map(d => d.index);
    };
    
    // Create flying network line
    const createNetworkLine = (startIndex: number, endIndex: number, isHubConnection: boolean = false) => {
      if (startIndex < 0 || startIndex >= networkNodes.length || 
          endIndex < 0 || endIndex >= networkNodes.length) {
        return null;
      }
      
      const start = networkNodes[startIndex];
      const end = networkNodes[endIndex];
      
      if (!start || !end) {
        return null;
      }
      
      // Different colors and opacity based on connection type
      const lineMaterial = new THREE.LineBasicMaterial({
        color: isHubConnection ? 0x65c6ff : 0x3a8bff,
        transparent: true,
        opacity: isHubConnection ? 0.9 : 0.6, // Increased opacity for better visibility
        linewidth: 1.5
      });
      
      // Create arc points
      const arcPoints = createArcPoints(start, end);
      
      // Create line geometry with the full arc initially
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setFromPoints(arcPoints);
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      
      // Modify the line.userData in createNetworkLine to track both head and tail:
      line.userData = {
        headProgress: 0, // Progress of the leading edge
        tailProgress: 0, // Progress of the trailing edge (where deletion starts)
        speed: 0.01 + Math.random() * 0.01, 
        tailDelay: 0.3 + Math.random() * 0.2, // Delay before tail starts disappearing
        startPoint: start.clone(),
        endPoint: end.clone(),
        startIndex: startIndex,
        endIndex: endIndex,
        arcPoints: arcPoints,
        isHubConnection: isHubConnection,
        active: true,
        completed: false // Track if this connection has completed its journey
      };
      
      // Add debug info - fix TS error with optional chaining and optional midpoint calculation
      const midPointIndex = Math.floor(arcPoints.length / 2);
      const midPoint = arcPoints[midPointIndex];
      const arcHeight = midPoint ? midPoint.distanceTo(start) - radius : "unknown";
      console.log(`Created line with ${arcPoints.length} points, height: ${arcHeight}`);
      
      globe.add(line);
      return line;
    };
    
    console.log("Creating hub-to-hub connections...");
    
    // Create hub-to-hub connections
    for (let i = 0; i < networkHubs.length; i++) {
      const hubNode = networkHubs[i];
      if (!hubNode) continue;

      // Connect to 2-3 other hubs
      const connections = Math.floor(2 + Math.random() * 2);
      const hubIndex = networkNodes.indexOf(hubNode);
      
      // Find closest hubs
      const nearest = findNearestNodes(hubNode, connections + 1)
        .filter(idx => {
          const node = networkNodes[idx];
          return node && networkHubs.includes(node);
        });
      
      for (let j = 0; j < Math.min(connections, nearest.length); j++) {
        const nearestIdx = nearest[j];
        if (nearestIdx !== undefined) {
          const line = createNetworkLine(hubIndex, nearestIdx, true);
          if (line) networkLines.push(line);
        }
      }
      
      // Connect each hub to nearby regular nodes
      const nodeConnections = 3 + Math.floor(Math.random() * 3);
      const nearestNodes = findNearestNodes(hubNode, 10)
        .filter(idx => {
          const node = networkNodes[idx];
          return node && !networkHubs.includes(node);
        });
      
      for (let j = 0; j < Math.min(nodeConnections, nearestNodes.length); j++) {
        const nearestIdx = nearestNodes[j];
        if (nearestIdx !== undefined) {
          const line = createNetworkLine(hubIndex, nearestIdx);
          if (line) networkLines.push(line);
        }
      }
    }
    
    console.log(`Created ${networkLines.length} network connections`);
    
    // Stagger animation starts for more visual interest - fixed unused variable warning
    networkLines.forEach(line => {
      if (line.userData) {
        // Randomize initial progress states for visual interest
        line.userData.headProgress = Math.random() * 0.5; // Start partway through
        line.userData.tailProgress = Math.max(0, line.userData.headProgress - line.userData.tailDelay);
        
        // Update line geometry initially to show it right away
        if (line.userData.headProgress > 0 && line.userData.arcPoints) {
          const headPoint = Math.ceil(line.userData.headProgress * line.userData.arcPoints.length);
          const tailPoint = Math.ceil(line.userData.tailProgress * line.userData.arcPoints.length);
          const visibleArcPoints = line.userData.arcPoints.slice(tailPoint, headPoint);
          
          if (visibleArcPoints.length >= 2) {
            line.geometry.setFromPoints(visibleArcPoints);
          }
        }
      }
    });
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        globe.position.x = -80;
      } else {
        globe.position.x = -140;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Add a subtle oscillation to the globe rotation for dynamic feel
      const time = Date.now() * 0.001;
      globe.rotation.y += 0.001 + 0.0005 * Math.sin(time);
      globe.rotation.x += 0.0003 * Math.cos(time);
      
      // Rotate globe slowly
      globe.rotation.y += 0.001;
      
      // Animate network lines
      networkLines.forEach((line, lineIndex) => {
        if (!line.geometry) return;
        
        const userData = line.userData;
        if (!userData) return;
        
        // Update head progress
        userData.headProgress += userData.speed;
        
        // Start moving the tail after delay
        if (userData.headProgress > userData.tailDelay) {
          userData.tailProgress += userData.speed;
        }
        
        // Check if line has completed its journey
        if (userData.headProgress >= 1 && !userData.completed) {
          userData.completed = true;
          
          // Create a new connection from the destination node
          const sourceIndex = userData.endIndex;
          if (sourceIndex !== undefined) {
            setTimeout(() => {
              // Make sure sourceIndex is definitely a number
              if (sourceIndex === undefined) return;
              
              // Find a random target node that isn't the current source
              let possibleTargets = networkNodes
                .map((_, i) => i)
                .filter(i => i !== sourceIndex);
                
              if (possibleTargets.length > 0) {
                const randomIndex = Math.floor(Math.random() * possibleTargets.length);
                const targetIndex = possibleTargets[randomIndex];
                
                // Make sure target index exists
                if (targetIndex === undefined) return;
                
                // Get the actual nodes and verify they exist
                const sourceNode = networkNodes[sourceIndex];
                const targetNode = networkNodes[targetIndex];
                
                // Additional safety check
                if (sourceNode && targetNode) {
                  // Now TypeScript knows these are definitely Vector3 objects
                  const sourceIsHub = networkHubs.includes(sourceNode);
                  const targetIsHub = networkHubs.includes(targetNode);
                  const isHubConnection = sourceIsHub && targetIsHub;
                  
                  const newLine = createNetworkLine(
                    sourceIndex, 
                    targetIndex, 
                    isHubConnection
                  );
                  
                  if (newLine) networkLines.push(newLine);
                }
              }
            }, Math.random() * 1000); // Stagger the creation of new lines
          }
        }
        
        // Remove line if it's completely disappeared
        if (userData.tailProgress >= 1) {
          // Remove this line
          if (line.parent) line.parent.remove(line);
          if (line.geometry) line.geometry.dispose();
          if (line.material) (line.material as THREE.Material).dispose();
          
          // Remove from array (will skip this line on next frame)
          networkLines.splice(lineIndex, 1);
          return;
        }
        
        // Get the original points
        const arcPoints = userData.arcPoints;
        if (!arcPoints || arcPoints.length < 2) return;
        
        // Calculate visible portion based on head and tail progress
        const totalPoints = arcPoints.length;
        const headPoint = Math.ceil(userData.headProgress * totalPoints);
        const tailPoint = Math.ceil(userData.tailProgress * totalPoints);
        
        // Create a new array with only the visible part of the path
        const visibleArcPoints = arcPoints.slice(tailPoint, headPoint);
        
        // Need at least 2 points to draw a line
        if (visibleArcPoints.length < 2) {
          if (userData.tailProgress >= 1) {
            // If fully disappeared, remove the line
            if (line.parent) line.parent.remove(line);
          }
          return;
        }
        
        // Update the line geometry
        line.geometry.setFromPoints(visibleArcPoints);
        
        // Update material opacity for glowing effect - more pronounced at the head
        if (userData.isHubConnection) {
          // Pulse effect for hub connections with more dramatic range
          const opacity = 0.6 + Math.sin(userData.headProgress * Math.PI) * 0.4;
          (line.material as THREE.LineBasicMaterial).opacity = opacity;
        } else {
          // Regular connections
          const opacity = 0.4 + (1 - Math.abs(userData.headProgress - 0.5)) * 0.6;
          (line.material as THREE.LineBasicMaterial).opacity = opacity;
        }
      });
      
      renderer.render(scene, camera);
    }
    
    console.log("Starting animation loop");
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      geometry.dispose();
      material.dispose();
      
      networkLines.forEach(line => {
        if (line && line.geometry) {
          line.geometry.dispose();
        }
        if (line && line.material) {
          (line.material as THREE.Material).dispose();
        }
      });
      
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      hubGeometry.dispose();
      hubMaterial.dispose();
      
      if (mountElement) {
        mountElement.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
};

export default Background;
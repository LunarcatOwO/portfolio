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
      
      // Create line geometry with all points (visible line will be controlled via clipping)
      const lineGeometry = new THREE.BufferGeometry();
      
      // Fix TS error by ensuring we have a valid point
      const initialPoint = new THREE.Vector3().copy(start);
      lineGeometry.setFromPoints([initialPoint]);
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      
      // Store animation data
      line.userData = {
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        startPoint: start.clone(),
        endPoint: end.clone(),
        arcPoints: arcPoints,
        isHubConnection: isHubConnection,
        active: true
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
        // Start some lines with negative progress for staggered animation
        line.userData.progress = -Math.random() * 1.5;
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
      
      // Rotate globe slowly
      globe.rotation.y += 0.001;
      
      // Animate network lines
      networkLines.forEach(line => {
        if (!line.geometry) return;
        
        const userData = line.userData;
        if (!userData) return;

        
        // Update progress
        userData.progress += userData.speed;
        
        if (userData.progress >= 1) {
          // When a line completes, restart it after a delay
          userData.progress = -Math.random() * 1.0; // Negative progress creates a delay
          
          // Update line color slightly on each cycle for visual interest
          if (userData.isHubConnection) {
            const hue = Math.random() * 0.1 + 0.6; // Blue hue range
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            (line.material as THREE.LineBasicMaterial).color = color;
          }
        }
        
        // Only update if progress is positive (during visible phase)
        if (userData.progress <= 0) return;
        
        // Get the original points
        const arcPoints = userData.arcPoints;
        if (!arcPoints || arcPoints.length < 2) return;
        
        // Calculate how many points to show based on progress
        const totalPoints = arcPoints.length;
        const visiblePoints = Math.max(2, Math.ceil(userData.progress * totalPoints));
        
        // Create a new array with only the visible part of the path
        const visibleArcPoints = arcPoints.slice(0, visiblePoints);
        
        // Update the line geometry
        line.geometry.setFromPoints(visibleArcPoints);
        
        // Update material opacity for glowing effect
        if (userData.isHubConnection) {
          // Pulse effect for hub connections
          const opacity = 0.6 + Math.sin(userData.progress * Math.PI) * 0.3;
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
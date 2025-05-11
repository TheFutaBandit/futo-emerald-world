import React, { useEffect, useRef } from 'react';
import { useRive, Layout, Fit, Alignment, useStateMachineInput } from '@rive-app/react-canvas';

interface RiveAnimationProps {
  src: string;
  width?: number;
  height?: number;
  stateMachine?: string;
  artboard?: string;
  alwaysTrack?: boolean;
}

const RiveAnimation: React.FC<RiveAnimationProps> = ({
  src,
  width = 400,
  height = 300,
  stateMachine = "State Machine 1",
  artboard,
  alwaysTrack = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: stateMachine ? [stateMachine] : undefined,
    artboard,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });
  
  // Get the lookX and lookY inputs if they exist
  const lookX = useStateMachineInput(rive, stateMachine, 'lookX');
  const lookY = useStateMachineInput(rive, stateMachine, 'lookY');
  
  useEffect(() => {
    if (alwaysTrack && lookX && lookY) {
      // Function to handle mouse movement anywhere on the page
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        
        // Get container position and dimensions
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate normalized position relative to center (-1 to 1)
        const normalizedX = (e.clientX - centerX) / (window.innerWidth / 2);
        const normalizedY = (e.clientY - centerY) / (window.innerHeight / 2);
        
        // Set the inputs with clamped values between -1 and 1
        lookX.value = Math.max(-1, Math.min(1, normalizedX));
        lookY.value = Math.max(-1, Math.min(1, normalizedY));
      };
      
      // Add global mouse move listener
      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [rive, lookX, lookY, alwaysTrack]);
  
  return (
    <div className="rive-animation-container" ref={containerRef} style={{ width, height }}>
      <RiveComponent />
    </div>
  );
};

export default RiveAnimation;
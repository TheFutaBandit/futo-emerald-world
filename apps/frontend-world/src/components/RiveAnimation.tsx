import React, { useEffect } from 'react';
import { useRive, Layout, Fit, Alignment, useStateMachineInput } from '@rive-app/react-canvas';

interface RiveAnimationProps {
  src: string;
  width?: number;
  height?: number;
  stateMachine?: string;
  artboard?: string;
  alwaysTrack?: boolean; // Option to always track, even outside canvas
}

const RiveAnimation: React.FC<RiveAnimationProps> = ({
  src,
  width = 400,
  height = 300,
  stateMachine = "State Machine 1",
  artboard,
  alwaysTrack = true, // Default to always tracking
}) => {
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

  // Get the "isTracking" input
  const isTrackingInput = useStateMachineInput(rive, stateMachine, "istracking");
  
  // Effect to enable tracking as soon as rive loads
  useEffect(() => {
    if (isTrackingInput && alwaysTrack) {
      // Enable tracking immediately and keep it enabled
      isTrackingInput.value = true;
      console.log("Enabled cursor tracking");
    }
  }, [isTrackingInput, alwaysTrack]);

  // Optional: Add mouse enter/leave handlers if you want tracking only when over the canvas
  useEffect(() => {
    if (!isTrackingInput || alwaysTrack) return;
    
    const container = document.querySelector('.rive-animation-container');
    if (!container) return;
    
    const handleMouseEnter = () => {
      isTrackingInput.value = true;
      console.log("Mouse entered - tracking enabled");
    };
    
    const handleMouseLeave = () => {
      isTrackingInput.value = false;
      console.log("Mouse left - tracking disabled");
    };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isTrackingInput, alwaysTrack]);

  return (
    <div className="rive-animation-container" style={{ width, height }}>
      <RiveComponent />
    </div>
  );
};

export default RiveAnimation;
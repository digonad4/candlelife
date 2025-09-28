import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GestureHandlerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  className?: string;
  threshold?: number;
  longPressDelay?: number;
}

export function MobileGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onLongPress,
  className,
  threshold = 50,
  longPressDelay = 500,
}: GestureHandlerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
        setTouchEnd(null);

        // Start long press timer
        if (onLongPress) {
          const timer = setTimeout(() => {
            onLongPress();
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
          }, longPressDelay);
          setLongPressTimer(timer);
        }
      } else if (e.touches.length === 2 && onPinch) {
        const distance = getTouchDistance(e.touches);
        setInitialPinchDistance(distance);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setTouchEnd({ x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2 && onPinch && initialPinchDistance) {
        const distance = getTouchDistance(e.touches);
        if (distance) {
          const scale = distance / initialPinchDistance;
          onPinch(scale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (!touchStart || !touchEnd) return;

      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine swipe direction
      if (Math.max(absDeltaX, absDeltaY) > threshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(25);
            }
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(25);
            }
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(25);
            }
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(25);
            }
          }
        }
      }

      // Reset
      setTouchStart(null);
      setTouchEnd(null);
      setInitialPinchDistance(null);
    };

    const handleTouchCancel = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setTouchStart(null);
      setTouchEnd(null);
      setInitialPinchDistance(null);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [
    touchStart,
    touchEnd,
    threshold,
    longPressDelay,
    longPressTimer,
    initialPinchDistance,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onLongPress,
  ]);

  return (
    <div
      ref={ref}
      className={cn('touch-manipulation select-none', className)}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
}
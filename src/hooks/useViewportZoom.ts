import { useEffect, useState } from 'react';
import { ZoomLevel } from '../types';
import { BASE_FONT_SIZE, resolveZoomScale } from '../utils/zoom';

/**
 * Scales the whole interface to the browser window by resizing the root font
 * size - every `rem` based Tailwind utility follows, just like browser zoom.
 * Re-applies on window resize (throttled through requestAnimationFrame).
 *
 * @returns the scale currently applied (1 = 100%).
 */
export const useViewportZoom = (zoom: ZoomLevel): number => {
  const [appliedScale, setAppliedScale] = useState<number>(1);

  useEffect(() => {
    let frameId = 0;

    const apply = () => {
      const scale = resolveZoomScale(zoom, window.innerWidth, window.innerHeight);
      document.documentElement.style.fontSize = `${BASE_FONT_SIZE * scale}px`;
      setAppliedScale(scale);
    };

    const schedule = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      document.documentElement.style.fontSize = '';
    };
  }, [zoom]);

  return appliedScale;
};

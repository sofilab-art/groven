import { useRef, useEffect, useCallback } from 'react';

export interface WorldState {
  x: number;      // lateral pan (world units)
  y: number;      // vertical pan (world units)
  zoom: number;   // depth: 1 = overview, higher = closer to plants
}

interface UseGroveNavigationOptions {
  onUpdate: (state: WorldState) => void;
  initialState?: WorldState;
  zoomSpeed?: number;
  dragSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
}

export function useGroveNavigation({
  onUpdate,
  initialState = { x: 0, y: 0, zoom: 1 },
  zoomSpeed = 0.002,
  dragSpeed = 1,
  minZoom = 0.4,
  maxZoom = 4.0,
}: UseGroveNavigationOptions) {
  const containerRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef<WorldState>({ ...initialState });
  const targetRef = useRef<WorldState>({ ...initialState });
  const animFrameRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragWorldStart = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });
  const interactedRef = useRef(false);

  const clampZoom = (z: number) => Math.max(minZoom, Math.min(maxZoom, z));

  // Smooth lerp animation loop
  const animate = useCallback(() => {
    const state = stateRef.current;
    const target = targetRef.current;
    const vel = velocityRef.current;

    // Apply inertia velocity when not dragging (pan only)
    if (!isDragging.current && (Math.abs(vel.x) > 0.05 || Math.abs(vel.y) > 0.05)) {
      target.x += vel.x;
      target.y += vel.y;
      vel.x *= 0.94;
      vel.y *= 0.94;
    }

    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const dz = target.zoom - state.zoom;

    const moving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || Math.abs(dz) > 0.001
      || Math.abs(vel.x) > 0.05 || Math.abs(vel.y) > 0.05;

    if (moving) {
      state.x += dx * 0.1;
      state.y += dy * 0.1;
      state.zoom += dz * 0.1;
      onUpdate({ x: state.x, y: state.y, zoom: state.zoom });
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [onUpdate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Wheel handler — handles both zoom and horizontal pan
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      interactedRef.current = true;

      // Trackpad pinch (ctrlKey) or mouse wheel: deltaY → zoom
      if (e.ctrlKey || Math.abs(e.deltaX) < 2) {
        const delta = e.deltaY * zoomSpeed;
        const newZoom = clampZoom(targetRef.current.zoom * (1 + delta));
        targetRef.current.zoom = newZoom;
      } else {
        // Trackpad two-finger swipe: deltaY → zoom, deltaX → horizontal pan
        if (Math.abs(e.deltaY) > 2) {
          const delta = e.deltaY * zoomSpeed;
          const newZoom = clampZoom(targetRef.current.zoom * (1 + delta));
          targetRef.current.zoom = newZoom;
        }
      }

      // Horizontal scroll (trackpad swipe left/right) → lateral pan
      if (Math.abs(e.deltaX) >= 2) {
        const rect = el.getBoundingClientRect();
        const screenToWorld = (1400 / rect.width) / stateRef.current.zoom;
        targetRef.current.x += e.deltaX * screenToWorld * 0.5;
      }
    };

    // Mouse drag — lateral + vertical PAN
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragWorldStart.current = { x: targetRef.current.x, y: targetRef.current.y };
      lastDragPos.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
      el.style.cursor = 'grabbing';
      interactedRef.current = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      // Convert screen pixels to world units: viewBox width / screen width, adjusted by zoom
      const rect = el.getBoundingClientRect();
      const screenToWorld = (1400 / rect.width) / stateRef.current.zoom;
      const panFactor = dragSpeed * screenToWorld;
      const dx = (e.clientX - dragStart.current.x) * panFactor;
      const dy = (e.clientY - dragStart.current.y) * panFactor;
      targetRef.current.x = dragWorldStart.current.x - dx;
      targetRef.current.y = dragWorldStart.current.y - dy;

      // Track velocity for inertia
      const velFactor = panFactor * 0.5;
      velocityRef.current.x = -(e.clientX - lastDragPos.current.x) * velFactor;
      velocityRef.current.y = -(e.clientY - lastDragPos.current.y) * velFactor;
      lastDragPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
      el.style.cursor = 'grab';
    };

    // Touch handlers — drag to pan, pinch to zoom
    const touchStartRef = { x: 0, y: 0 };
    const touchWorldStartRef = { x: 0, y: 0 };
    let lastPinchDist = 0;
    let pinchZoomStart = 1;

    const onTouchStart = (e: TouchEvent) => {
      interactedRef.current = true;
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStartRef.x = t.clientX;
        touchStartRef.y = t.clientY;
        touchWorldStartRef.x = targetRef.current.x;
        touchWorldStartRef.y = targetRef.current.y;
        velocityRef.current = { x: 0, y: 0 };
      } else if (e.touches.length === 2) {
        // Pinch start
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        pinchZoomStart = targetRef.current.zoom;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        // Pan
        const t = e.touches[0];
        const rect = el.getBoundingClientRect();
        const screenToWorld = (1400 / rect.width) / stateRef.current.zoom;
        const panFactor = dragSpeed * screenToWorld;
        const dx = (t.clientX - touchStartRef.x) * panFactor;
        const dy = (t.clientY - touchStartRef.y) * panFactor;
        targetRef.current.x = touchWorldStartRef.x - dx;
        targetRef.current.y = touchWorldStartRef.y - dy;
      } else if (e.touches.length === 2) {
        // Pinch zoom (depth)
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist > 0) {
          const scale = dist / lastPinchDist;
          targetRef.current.zoom = clampZoom(pinchZoomStart * scale);
        }
      }
    };

    // Keyboard — arrows/WASD: up/down = zoom (depth), left/right = lateral pan
    const keysDown = new Set<string>();
    const keyPanSpeed = 12;
    const keyZoomSpeed = 0.02;

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when focus is in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        keysDown.add(e.key);
        interactedRef.current = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key);
    };

    const keyInterval = setInterval(() => {
      // Up/W = zoom in (dive deeper), Down/S = zoom out
      if (keysDown.has('ArrowUp') || keysDown.has('w')) {
        targetRef.current.zoom = clampZoom(targetRef.current.zoom * (1 + keyZoomSpeed));
      }
      if (keysDown.has('ArrowDown') || keysDown.has('s')) {
        targetRef.current.zoom = clampZoom(targetRef.current.zoom * (1 - keyZoomSpeed));
      }
      // Left/Right/A/D = lateral pan
      const panFactor = keyPanSpeed / stateRef.current.zoom;
      if (keysDown.has('ArrowLeft') || keysDown.has('a')) targetRef.current.x -= panFactor;
      if (keysDown.has('ArrowRight') || keysDown.has('d')) targetRef.current.x += panFactor;
    }, 16);

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(keyInterval);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [animate, zoomSpeed, dragSpeed, minZoom, maxZoom]);

  // Restore position from session storage
  const restorePosition = useCallback(() => {
    try {
      const saved = sessionStorage.getItem('grove-position');
      if (saved) {
        const pos = JSON.parse(saved);
        stateRef.current = { x: pos.x, y: pos.y, zoom: pos.zoom || 1 };
        targetRef.current = { x: pos.x, y: pos.y, zoom: pos.zoom || 1 };
        onUpdate(stateRef.current);
      }
    } catch { /* ignore */ }
  }, [onUpdate]);

  const savePosition = useCallback(() => {
    sessionStorage.setItem('grove-position', JSON.stringify(stateRef.current));
  }, []);

  // Animate camera to a target position over durationMs with custom easing
  // easing: controls zoom interpolation
  // panEasing: controls x/y interpolation (defaults to same as easing)
  type Easing = 'ease-in' | 'ease-out' | 'ease-in-out';
  const easeFn = (t: number, easing: Easing): number => {
    switch (easing) {
      case 'ease-in': return t * t * t;
      case 'ease-out': return 1 - Math.pow(1 - t, 3);
      case 'ease-in-out': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  };

  const zoomTo = useCallback((
    target: WorldState,
    durationMs: number = 600,
    easing: Easing = 'ease-in-out',
    panEasing?: Easing,
  ): Promise<void> => {
    const panEase = panEasing ?? easing;
    return new Promise((resolve) => {
      const from = { ...stateRef.current };
      const startTime = performance.now();

      const tick = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / durationMs, 1);
        const ez = easeFn(t, easing);
        const ep = easeFn(t, panEase);

        const current = {
          x: from.x + (target.x - from.x) * ep,
          y: from.y + (target.y - from.y) * ep,
          zoom: from.zoom + (target.zoom - from.zoom) * ez,
        };

        stateRef.current = { ...current };
        targetRef.current = { ...current };
        onUpdate(current);

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }, [onUpdate, stateRef, targetRef]);

  return {
    containerRef,
    stateRef,
    targetRef,
    interactedRef,
    restorePosition,
    savePosition,
    zoomTo,
  };
}

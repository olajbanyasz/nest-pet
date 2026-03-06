import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import NavigationBar from '../NavigationBar/NavigationBar';
import NetRadioWidget from '../NetRadioWidget/NetRadioWidget';
import TokenRefreshModal from '../TokenRefreshModal/TokenRefreshModal';

type WidgetPosition = {
  x: number;
  y: number;
};

const WIDGET_POSITION_STORAGE_KEY = 'netradio_widget_layout_position';
const WIDGET_EDGE_GAP = 12;
const WIDGET_TOP_MIN = 0;
const DEFAULT_WIDGET_WIDTH = 420;
const DEFAULT_WIDGET_HEIGHT = 220;

const AppLayout: React.FC = () => {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const getDefaultPosition = useCallback((): WidgetPosition => {
    const x = Math.max(
      WIDGET_EDGE_GAP,
      window.innerWidth - DEFAULT_WIDGET_WIDTH - WIDGET_EDGE_GAP,
    );
    const y = Math.max(
      WIDGET_TOP_MIN,
      window.innerHeight - DEFAULT_WIDGET_HEIGHT - WIDGET_EDGE_GAP,
    );

    return { x, y };
  }, []);

  const [position, setPosition] = useState<WidgetPosition>(() => {
    if (typeof window === 'undefined') {
      return { x: WIDGET_EDGE_GAP, y: WIDGET_TOP_MIN };
    }

    const storedPosition = window.localStorage.getItem(
      WIDGET_POSITION_STORAGE_KEY,
    );
    if (!storedPosition) {
      return getDefaultPosition();
    }

    try {
      const parsed = JSON.parse(storedPosition) as Partial<WidgetPosition>;
      if (
        typeof parsed?.x === 'number' &&
        Number.isFinite(parsed.x) &&
        typeof parsed?.y === 'number' &&
        Number.isFinite(parsed.y)
      ) {
        return { x: parsed.x, y: parsed.y };
      }
    } catch {
      return getDefaultPosition();
    }

    return getDefaultPosition();
  });

  const clampPosition = useCallback((next: WidgetPosition): WidgetPosition => {
    const width = widgetRef.current?.offsetWidth ?? DEFAULT_WIDGET_WIDTH;
    const height = widgetRef.current?.offsetHeight ?? DEFAULT_WIDGET_HEIGHT;
    const maxX = Math.max(
      WIDGET_EDGE_GAP,
      window.innerWidth - width - WIDGET_EDGE_GAP,
    );
    const maxY = Math.max(
      WIDGET_TOP_MIN,
      window.innerHeight - height - WIDGET_EDGE_GAP,
    );

    return {
      x: Math.min(Math.max(WIDGET_EDGE_GAP, next.x), maxX),
      y: Math.min(Math.max(WIDGET_TOP_MIN, next.y), maxY),
    };
  }, []);

  useEffect(() => {
    setPosition((current) => clampPosition(current));

    const onResize = () => {
      setPosition((current) => clampPosition(current));
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [clampPosition]);

  useEffect(() => {
    window.localStorage.setItem(
      WIDGET_POSITION_STORAGE_KEY,
      JSON.stringify(position),
    );
  }, [position]);

  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const widgetRect = widgetRef.current?.getBoundingClientRect();
    if (!widgetRect) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - widgetRect.left,
      offsetY: event.clientY - widgetRect.top,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const next = {
      x: event.clientX - dragRef.current.offsetX,
      y: event.clientY - dragRef.current.offsetY,
    };

    setPosition(clampPosition(next));
  };

  const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <>
      <NavigationBar />
      <TokenRefreshModal />
      <main className="app-content">
        <Outlet />
      </main>
      <div
        ref={widgetRef}
        className="floating-netradio-widget"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className="floating-netradio-widget__drag-handle"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          style={{ color: 'white' }}
        >
          Move
        </div>
        <NetRadioWidget />
      </div>
    </>
  );
};

export default AppLayout;

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ActionDock } from './components/ActionDock';
import { ChronicleDrawer } from './components/ChronicleDrawer';
import { EventModal, StatusModal, TileInspectorCard } from './components/EventAndStatusModals';
import { TitleScreen } from './components/TitleScreen';
import { TopHud } from './components/TopHud';
import { soundEngine } from './game/audio';
import { GRID_COLS, GRID_ROWS, SURFACE_ROW, TOOLS } from './game/constants';
import { Language, detectInitialLanguage } from './game/i18n';
import {
  Camera3DState,
  ColonyScene3D,
  createDefaultCamera3D,
} from './game/renderer3d';
import {
  buildStructure,
  createInitialGameState,
  markDigCell,
  resolveEventChoice,
  sendSurfaceExpedition,
  stepSimulation,
  toggleLaw,
} from './game/simulation';
import { GameState, LawId, ToolId } from './game/types';

function mapPhaseToDataset(phase: GameState['phase']): string {
  switch (phase) {
    case 'TITLE':
      return 'title';
    case 'PLAYING':
      return 'playing';
    case 'PAUSED':
      return 'paused';
    case 'VICTORY':
    case 'GAME_OVER':
      return 'gameover';
  }
}

export default function App() {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const stateRef = useRef<GameState>(createInitialGameState(autostart));
  const cameraRef = useRef<Camera3DState>(createDefaultCamera3D());
  const scene3dRef = useRef<ColonyScene3D | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const calloutLayerRef = useRef<HTMLDivElement | null>(null);
  const depthRulerRef = useRef<HTMLDivElement | null>(null);
  const keysHeldRef = useRef<Set<string>>(new Set());
  const hoverCellRef = useRef<{ gx: number; gy: number } | null>(null);
  const dragRef = useRef<{
    active: boolean;
    mode: 'pan' | 'orbit';
    startX: number;
    startY: number;
    camStartX: number;
    camStartY: number;
    camStartAz: number;
    camStartEl: number;
    moved: boolean;
  }>({
    active: false,
    mode: 'pan',
    startX: 0,
    startY: 0,
    camStartX: 0,
    camStartY: 0,
    camStartAz: 0,
    camStartEl: 0,
    moved: false,
  });

  // Throttled HUD snapshot state (never updated at 60Hz)
  const [, setHudTick] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lang, setLangState] = useState<Language>(() => detectInitialLanguage());
  const langRef = useRef<Language>(lang);

  const handleSetLang = useCallback((nextLang: Language) => {
    langRef.current = nextLang;
    setLangState(nextLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hollow_creek_lang', nextLang);
    }
    document.documentElement.lang = nextLang;
  }, []);

  const handleToggleLang = useCallback(() => {
    handleSetLang(langRef.current === 'cs' ? 'en' : 'cs');
  }, [handleSetLang]);

  const syncHud = useCallback(() => {
    document.body.dataset.state = mapPhaseToDataset(stateRef.current.phase);
    setHudTick((t) => t + 1);
  }, []);

  // Initialize dataset.state and html lang on mount
  useEffect(() => {
    document.body.dataset.state = mapPhaseToDataset(stateRef.current.phase);
    document.documentElement.lang = langRef.current;
  }, []);

  const handleResetView = useCallback(() => {
    const def = createDefaultCamera3D();
    const cam = cameraRef.current;
    cam.targetAzimuth = def.targetAzimuth;
    cam.targetElevation = def.targetElevation;
    cam.targetDistance = def.targetDistance;
  }, []);

  const handleStart = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === 'TITLE') {
      s.phase = 'PLAYING';
      s.speed = 1;
      const def = createDefaultCamera3D();
      cameraRef.current.targetX = def.targetX;
      cameraRef.current.targetY = def.targetY;
      cameraRef.current.targetAzimuth = def.targetAzimuth;
      cameraRef.current.targetElevation = def.targetElevation;
      cameraRef.current.targetDistance = def.targetDistance;
      keysHeldRef.current.clear();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      soundEngine.play('event');
      syncHud();
    }
  }, [syncHud]);

  const handleRestart = useCallback(() => {
    stateRef.current = createInitialGameState(true);
    cameraRef.current = createDefaultCamera3D();
    keysHeldRef.current.clear();
    setDrawerOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    syncHud();
  }, [syncHud]);

  const handleReturnToTitle = useCallback(() => {
    stateRef.current = createInitialGameState(false);
    cameraRef.current = createDefaultCamera3D();
    keysHeldRef.current.clear();
    setDrawerOpen(false);
    syncHud();
  }, [syncHud]);

  const handleTogglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === 'PLAYING') {
      s.phase = 'PAUSED';
      keysHeldRef.current.clear();
      syncHud();
    } else if (s.phase === 'PAUSED') {
      s.phase = 'PLAYING';
      keysHeldRef.current.clear();
      syncHud();
    }
  }, [syncHud]);

  const handleSetSpeed = useCallback(
    (speed: 0 | 1 | 2 | 4) => {
      stateRef.current.speed = speed;
      syncHud();
    },
    [syncHud]
  );

  const handleToggleMute = useCallback(() => {
    const next = !soundEngine.isMuted();
    soundEngine.setMuted(next);
    setMuted(next);
  }, []);

  const handleSelectTool = useCallback(
    (toolId: ToolId) => {
      stateRef.current.selectedTool = toolId;
      syncHud();
    },
    [syncHud]
  );

  const handleSendExpedition = useCallback(() => {
    if (sendSurfaceExpedition(stateRef.current)) {
      syncHud();
    }
  }, [syncHud]);

  const handleToggleLaw = useCallback(
    (lawId: LawId) => {
      toggleLaw(stateRef.current, lawId);
      syncHud();
    },
    [syncHud]
  );

  const handleEventChoice = useCallback(
    (choiceId: string) => {
      resolveEventChoice(stateRef.current, choiceId);
      syncHud();
    },
    [syncHud]
  );

  // Unified Keyboard Input & Focus-Loss Hygiene
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      keysHeldRef.current.add(key);

      const s = stateRef.current;
      if (s.phase === 'TITLE') {
        if (key === 'enter' || key === ' ') {
          e.preventDefault();
          handleStart();
        }
        return;
      }

      if (key === 'escape' || key === 'p') {
        if (s.phase === 'PLAYING' || s.phase === 'PAUSED') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      if (s.phase !== 'PLAYING') return;

      if (key === ' ') {
        e.preventDefault();
        handleSetSpeed(s.speed === 0 ? 1 : 0);
      } else if (key === 'm') {
        handleToggleMute();
      } else if (key === 'l') {
        setDrawerOpen((o) => !o);
      } else if (key === 'e') {
        handleSendExpedition();
      } else if (key === 'r') {
        handleResetView();
      } else {
        const matchedTool = TOOLS.find((t) => t.hotkey.toLowerCase() === key);
        if (matchedTool) {
          handleSelectTool(matchedTool.id);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key.toLowerCase());
    };

    const clearInputs = () => {
      keysHeldRef.current.clear();
      dragRef.current.active = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', clearInputs);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', clearInputs);
    };
  }, [
    handleResetView,
    handleSelectTool,
    handleSendExpedition,
    handleSetSpeed,
    handleStart,
    handleToggleMute,
    handleTogglePause,
  ]);

  // Mount Three.js 3D Renderer once and pace simulation/render loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene3d = new ColonyScene3D(container);
    scene3dRef.current = scene3d;

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsedSec = 0;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const simDt = Math.min(Math.max(rawDt, 0.001), 0.05);
      const camDt = Math.min(Math.max(rawDt, 0.001), 0.16);
      elapsedSec += simDt;

      const s = stateRef.current;
      const cam = cameraRef.current;

      // Camera Panning & 3D Orbiting
      if (s.phase === 'TITLE') {
        cam.targetX = 19.6 + Math.sin(elapsedSec * 0.25) * 1.5;
        cam.targetY = -4.0 + Math.cos(elapsedSec * 0.18) * 0.65;
        cam.targetAzimuth = 0.36 + Math.sin(elapsedSec * 0.3) * 0.16;
        cam.targetElevation = 0.22;
        cam.targetDistance = 12.6;
      } else if (s.phase === 'PLAYING') {
        const panSpeed = Math.max(6, cam.distance * 0.72) * camDt;
        const held = keysHeldRef.current;
        if (held.has('w') || held.has('arrowup')) cam.targetY += panSpeed;
        if (held.has('s') || held.has('arrowdown')) cam.targetY -= panSpeed;
        if (held.has('a') || held.has('arrowleft')) cam.targetX -= panSpeed;
        if (held.has('d') || held.has('arrowright')) cam.targetX += panSpeed;
        if (held.has('q')) cam.targetAzimuth -= 1.5 * camDt;
        if (held.has('c')) cam.targetAzimuth += 1.5 * camDt;
      }

      // Clamp 3D camera inside diorama bounds
      cam.targetX = THREE.MathUtils.clamp(cam.targetX, 4, GRID_COLS - 4);
      cam.targetY = THREE.MathUtils.clamp(cam.targetY, -(GRID_ROWS - 2), -1.5);
      cam.targetAzimuth = THREE.MathUtils.clamp(cam.targetAzimuth, -0.72, 0.72);
      cam.targetElevation = THREE.MathUtils.clamp(cam.targetElevation, -0.38, 0.55);
      cam.targetDistance = THREE.MathUtils.clamp(cam.targetDistance, 6.5, 42);

      // Exponential damping
      cam.x = THREE.MathUtils.damp(cam.x, cam.targetX, 10, camDt);
      cam.y = THREE.MathUtils.damp(cam.y, cam.targetY, 10, camDt);
      cam.azimuth = THREE.MathUtils.damp(cam.azimuth, cam.targetAzimuth, 10, camDt);
      cam.elevation = THREE.MathUtils.damp(cam.elevation, cam.targetElevation, 10, camDt);
      cam.distance = THREE.MathUtils.damp(cam.distance, cam.targetDistance, 10, camDt);

      // Step simulation
      const prevPhase = s.phase;
      const prevDay = s.day;
      const prevShift = Math.floor(s.timeOfDay / 6);
      const prevEvent = s.activeEvent;
      const prevTiles = s.stats.tilesExcavated;
      const prevExp = s.expeditionActive;

      stepSimulation(s, simDt);

      if (s.stats.tilesExcavated > prevTiles) {
        scene3d.spawnBurst(21 + (Math.random() - 0.5) * 4, 4 + Math.random() * 3, 10, 0xd4a373);
      }

      // Drain queued sound cues
      while (s.soundCueQueue.length > 0) {
        const cue = s.soundCueQueue.shift();
        if (cue) soundEngine.play(cue);
      }

      scene3d.renderFrame(
        s,
        cam,
        hoverCellRef.current,
        elapsedSec,
        simDt,
        langRef.current,
        calloutLayerRef.current,
        depthRulerRef.current
      );

      // Sync React HUD only on discrete transitions
      if (
        prevPhase !== s.phase ||
        prevDay !== s.day ||
        prevShift !== Math.floor(s.timeOfDay / 6) ||
        prevEvent !== s.activeEvent ||
        prevExp !== s.expeditionActive ||
        prevTiles !== s.stats.tilesExcavated
      ) {
        document.body.dataset.state = mapPhaseToDataset(s.phase);
        setHudTick((t) => t + 1);
      }

      if (scene3d.isSoftwareGl) {
        frameId = scene3d.afterDraw(() => {
          if (!disposed) frameId = requestAnimationFrame(tick);
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      scene3dRef.current = null;
      scene3d.dispose();
    };
  }, []);

  // Pointer interactions on the 3D viewport (Left-Drag Pan, Right-Drag Orbit, Left-Click Dig/Build, Wheel Zoom)
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current.phase !== 'PLAYING') return;
    const isOrbit = e.button === 2 || e.shiftKey;
    dragRef.current = {
      active: true,
      mode: isOrbit ? 'orbit' : 'pan',
      startX: e.clientX,
      startY: e.clientY,
      camStartX: cameraRef.current.targetX,
      camStartY: cameraRef.current.targetY,
      camStartAz: cameraRef.current.targetAzimuth,
      camStartEl: cameraRef.current.targetElevation,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const scene3d = scene3dRef.current;
    if (!scene3d) return;

    if (!dragRef.current.active) {
      hoverCellRef.current = scene3d.screenToGrid(e.clientX, e.clientY);
      return;
    }

    if (stateRef.current.phase !== 'PLAYING') return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) > 5) {
      dragRef.current.moved = true;
      if (dragRef.current.mode === 'orbit') {
        cameraRef.current.targetAzimuth = dragRef.current.camStartAz - dx * 0.0055;
        cameraRef.current.targetElevation = dragRef.current.camStartEl + dy * 0.0045;
      } else {
        const panScale = cameraRef.current.distance * 0.0014;
        cameraRef.current.targetX = dragRef.current.camStartX - dx * panScale;
        cameraRef.current.targetY = dragRef.current.camStartY + dy * panScale;
      }
    }
  };

  const handleViewportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasMoved = dragRef.current.moved;
    const mode = dragRef.current.mode;
    dragRef.current.active = false;
    if (wasMoved || mode === 'orbit' || stateRef.current.phase !== 'PLAYING') return;

    const scene3d = scene3dRef.current;
    if (!scene3d) return;
    const { gx, gy } = scene3d.screenToGrid(e.clientX, e.clientY);
    if (gx < 0 || gx >= GRID_COLS || gy <= SURFACE_ROW || gy >= GRID_ROWS) return;

    const s = stateRef.current;
    const tool = s.selectedTool;
    let changed = false;

    if (tool === 'inspect') {
      s.selectedCell = { x: gx, y: gy };
      changed = true;
    } else if (tool === 'dig') {
      changed = markDigCell(s, gx, gy);
      if (changed) {
        scene3d.spawnBurst(gx, gy, 8, 0xe89b3c);
      }
    } else {
      changed = buildStructure(s, gx, gy, tool);
      if (changed) {
        scene3d.spawnBurst(gx, gy, 10, 0x4ade80);
      }
    }

    if (changed) {
      syncHud();
    }
  };

  const handleViewportWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (stateRef.current.phase !== 'PLAYING') return;
    const step = e.deltaY > 0 ? 1.6 : -1.6;
    cameraRef.current.targetDistance = THREE.MathUtils.clamp(
      cameraRef.current.targetDistance + step,
      6.5,
      42
    );
  };

  const state = stateRef.current;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0b0d11] select-none">
      {/* Dedicated Empty WebGL Mount Container */}
      <div
        ref={mountRef}
        data-testid="colony-3d-viewport"
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onWheel={handleViewportWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0"
      />

      {/* Sibling Projected 3D Callouts & Left Depth Ruler (zero React re-renders) */}
      <div
        ref={depthRulerRef}
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 w-11 bg-[#0b0d11]/70 pointer-events-none z-[5]"
      />
      <div
        ref={calloutLayerRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none z-[6]"
      />

      {/* Title Screen */}
      {state.phase === 'TITLE' && (
        <TitleScreen lang={lang} onSetLang={handleSetLang} onStart={handleStart} />
      )}

      {/* Playing HUD */}
      {state.phase !== 'TITLE' && (
        <>
          <TopHud
            state={state}
            lang={lang}
            muted={muted}
            onSetSpeed={handleSetSpeed}
            onToggleMute={handleToggleMute}
            onToggleLang={handleToggleLang}
            onResetView={handleResetView}
            onOpenPause={handleTogglePause}
          />

          <ActionDock
            state={state}
            lang={lang}
            drawerOpen={drawerOpen}
            onSelectTool={handleSelectTool}
            onSendExpedition={handleSendExpedition}
            onToggleDrawer={() => setDrawerOpen((o) => !o)}
          />

          <TileInspectorCard
            state={state}
            lang={lang}
            onClose={() => {
              stateRef.current.selectedCell = null;
              syncHud();
            }}
          />

          {drawerOpen && (
            <ChronicleDrawer
              state={state}
              lang={lang}
              onClose={() => setDrawerOpen(false)}
              onToggleLaw={handleToggleLaw}
            />
          )}
        </>
      )}

      {/* Narrative Choice Modal */}
      <EventModal state={state} lang={lang} onChoose={handleEventChoice} />

      {/* Pause / Victory / Game Over Modal */}
      <StatusModal
        state={state}
        lang={lang}
        onResume={handleTogglePause}
        onRestart={handleRestart}
        onTitle={handleReturnToTitle}
      />
    </main>
  );
}

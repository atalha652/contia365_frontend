import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { LIVE_SCENES } from "./ticketsDemoScript";
import { PRESENT_SCENE_KEY, PRESENT_STORAGE_KEY } from "../../pages/TicketsDemo";

const TicketsPresenterBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(
    () => sessionStorage.getItem(PRESENT_STORAGE_KEY) === "1"
  );
  const [sceneIndex, setSceneIndex] = useState(() => {
    const raw = Number(sessionStorage.getItem(PRESENT_SCENE_KEY) || 0);
    return Number.isFinite(raw) ? raw : 0;
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("present") === "1") {
      sessionStorage.setItem(PRESENT_STORAGE_KEY, "1");
      setActive(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (!active) return undefined;
    sessionStorage.setItem(PRESENT_SCENE_KEY, String(sceneIndex));
    return undefined;
  }, [active, sceneIndex]);

  const scene = LIVE_SCENES[sceneIndex] || LIVE_SCENES[0];
  const remaining = useMemo(
    () => LIVE_SCENES.length - sceneIndex - 1,
    [sceneIndex]
  );

  if (!active) return null;

  const goScene = (nextIndex) => {
    const bounded = Math.max(0, Math.min(LIVE_SCENES.length - 1, nextIndex));
    setSceneIndex(bounded);
    const next = LIVE_SCENES[bounded];
    if (next?.path && location.pathname + location.search !== next.path) {
      const url = new URL(next.path, window.location.origin);
      url.searchParams.set("present", "1");
      navigate(`${url.pathname}${url.search}`);
    }
  };

  const exit = () => {
    sessionStorage.removeItem(PRESENT_STORAGE_KEY);
    sessionStorage.removeItem(PRESENT_SCENE_KEY);
    setActive(false);
    const params = new URLSearchParams(location.search);
    if (params.has("present")) {
      params.delete("present");
      navigate(`${location.pathname}${params.toString() ? `?${params}` : ""}`, { replace: true });
    }
  };

  return (
    <div className="fixed left-4 right-4 bottom-4 z-[80] pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-4xl rounded-2xl border border-bd-50 bg-bg-50/95 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-fg-60">
              Live demo  ·  {scene.sprint}  ·  {scene.ticket}  ·  {sceneIndex + 1}/{LIVE_SCENES.length}
            </p>
            <p className="text-sm font-semibold text-fg-40 mt-1">{scene.click}</p>
            <p className="text-sm text-fg-60 mt-1">{scene.say}</p>
          </div>
          <button
            type="button"
            onClick={exit}
            className="h-8 w-8 rounded-lg hover:bg-bg-60 inline-flex items-center justify-center text-fg-60"
            aria-label="Exit live demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => goScene(sceneIndex - 1)}
            disabled={sceneIndex === 0}
            className="h-8 px-3 rounded-lg border border-bd-50 text-xs font-medium disabled:opacity-40 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            type="button"
            onClick={() => goScene(sceneIndex + 1)}
            disabled={sceneIndex >= LIVE_SCENES.length - 1}
            className="h-8 px-3 rounded-lg bg-ac-02 text-white text-xs font-medium disabled:opacity-40 inline-flex items-center gap-1"
          >
            Next scene
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-fg-60">
            {remaining > 0 ? `${remaining} scene${remaining === 1 ? "" : "s"} left` : "Last scene — then Exit"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketsPresenterBar;

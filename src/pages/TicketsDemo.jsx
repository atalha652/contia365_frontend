import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  Play,
  Radio,
} from "lucide-react";
import { LIVE_SCENES, SLIDES } from "../components/demo/ticketsDemoScript";

export const PRESENT_STORAGE_KEY = "contia_tickets_present";
export const PRESENT_SCENE_KEY = "contia_tickets_scene";

const STEPS = [
  { label: "Country", state: "Done" },
  { label: "Fiscal profile", state: "Done" },
  { label: "Calculate", state: "Done" },
  { label: "Review & approve", state: "Done" },
  { label: "Send modelo", state: "Live" },
  { label: "Justificante", state: "Live" },
];

const TicketChip = ({ id }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-ac-02/15 text-ac-02 border border-ac-02/30">
    {id}
  </span>
);

const PipelineVisual = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl">
    {STEPS.map((step) => (
      <div key={step.label} className="rounded-2xl border border-bd-50 bg-bg-60 p-4">
        <p className="text-[11px] uppercase tracking-wider text-fg-60">{step.state}</p>
        <p className="text-lg font-semibold text-fg-40 mt-1">{step.label}</p>
      </div>
    ))}
  </div>
);

const CardsVisual = () => (
  <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
    <div className="rounded-2xl border border-bd-50 bg-bg-60 p-5">
      <p className="text-xs text-fg-60">Modelo 130 · Q3 2026</p>
      <p className="text-sm font-medium text-fg-60 mt-3">IRPF to Pay</p>
      <p className="text-3xl font-bold text-fg-40">€1,640.00</p>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-fg-60"><span>Gross Income</span><span className="text-fg-40">€12,400.00</span></div>
        <div className="flex justify-between text-fg-60"><span>Deductible Expenses</span><span className="text-fg-40">€4,200.00</span></div>
        <div className="flex justify-between font-semibold text-fg-40"><span>Net Income</span><span>€8,200.00</span></div>
      </div>
      <p className="text-[11px] text-fg-60 mt-3">Reads irpf_payable · total_income · taxable_income</p>
    </div>
    <div className="rounded-2xl border border-bd-50 bg-bg-60 p-5">
      <p className="text-xs text-fg-60">Filing status — not a card dropdown</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {["DRAFT", "CALCULATED", "IN_REVIEW", "APPROVED"].map((s, i) => (
          <span
            key={s}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              i === 3 ? "bg-ac-02/15 text-fg-40 border-ac-02/40" : "bg-bg-50 text-fg-60 border-bd-50"
            }`}
          >
            {s.replace("_", " ")}
          </span>
        ))}
      </div>
      <p className="text-sm text-fg-60 mt-4">No pending / filed / paid / overdue control on the calculator.</p>
    </div>
  </div>
);

const VatVisual = () => (
  <div className="max-w-xl rounded-2xl border border-bd-50 bg-bg-60 p-5">
    <p className="text-xs text-fg-60">Modelo 303 · VAT Payable</p>
    <p className="text-3xl font-bold text-fg-40 mt-1">€1,470.00</p>
    <p className="text-xs font-semibold text-fg-60 mt-5 mb-2">Breakdown by Rate</p>
    {[
      ["21% VAT", "€1,260.00", "€210.00", "€1,050.00"],
      ["10% VAT", "€480.00", "€60.00", "€420.00"],
      ["4% VAT", "€0.00", "€0.00", "€0.00"],
      ["0% VAT", "€0.00", "€0.00", "€0.00"],
    ].map(([rate, out, inn, net]) => (
      <div key={rate} className="grid grid-cols-4 gap-2 py-2 border-b border-bd-50 last:border-0 text-sm">
        <span className="text-fg-60">{rate}</span>
        <span className="text-fg-40 text-right">{out}</span>
        <span className="text-fg-40 text-right">{inn}</span>
        <span className="text-fg-40 text-right font-medium">{net}</span>
      </div>
    ))}
  </div>
);

const GuardsVisual = () => (
  <div className="grid md:grid-cols-3 gap-3 max-w-4xl">
    {[
      { code: "409", title: "Duplicate period", body: "Second 303 for the same NIF and period is refused with the existing reference." },
      { code: "403", title: "Owner only", body: "A non-owner cannot review, approve, or submit. Roles come later." },
      { code: "Waitlist", title: "Italy & White Label", body: "Join waitlist writes a row. Italy cannot reach 303 endpoints." },
    ].map((item) => (
      <div key={item.code} className="rounded-2xl border border-bd-50 bg-bg-60 p-4">
        <p className="text-xs font-semibold text-ac-02">{item.code}</p>
        <p className="text-base font-semibold text-fg-40 mt-2">{item.title}</p>
        <p className="text-sm text-fg-60 mt-2">{item.body}</p>
      </div>
    ))}
  </div>
);

const XmlVisual = () => (
  <div className="max-w-3xl rounded-2xl border border-bd-50 bg-bg-60 p-5 font-mono text-sm">
    <p className="text-fg-60">aeat_modelo_client.py  ·  not aeat_client.py</p>
    <pre className="mt-3 text-fg-40 whitespace-pre-wrap leading-relaxed">{`<T3030 ...>
  <Cabecera><NIF>00000000T</NIF><Ejercicio>2026</Ejercicio></Cabecera>
  <Casillas>150 / 160 / 03 ... from engine totals</Casillas>
</T3030>`}</pre>
    <p className="text-xs text-fg-60 mt-4 font-sans">Invoices still use Facturae / VeriFactu. Separate pipe.</p>
  </div>
);

const SubmitVisual = () => (
  <div className="max-w-xl rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
    <p className="text-sm font-semibold text-fg-40">AEAT result</p>
    <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
      <div>
        <dt className="text-xs text-fg-60">Code</dt>
        <dd className="text-fg-40 font-medium">0</dd>
      </div>
      <div>
        <dt className="text-xs text-fg-60">CSV</dt>
        <dd className="text-fg-40 font-medium break-all">CSVTEST123</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-xs text-fg-60">Message</dt>
        <dd className="text-fg-40 font-medium">Declaración aceptada</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-xs text-fg-60">Justificante</dt>
        <dd className="text-fg-40 font-medium">JUS-1</dd>
      </div>
    </dl>
    <p className="text-xs text-fg-60 mt-4">Certificate password is entered per submit and never stored.</p>
  </div>
);

const MoreVisual = () => (
  <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
    <div className="rounded-2xl border border-bd-50 bg-bg-60 p-5">
      <p className="text-xs text-fg-60">T14</p>
      <p className="text-lg font-semibold text-fg-40 mt-1">130, then 111 / 115 / 390</p>
      <p className="text-sm text-fg-60 mt-2">Same APPROVED → XML → AEAT path. 111 and 190 stay blocked until percipient lines exist.</p>
    </div>
    <div className="rounded-2xl border border-bd-50 bg-bg-60 p-5">
      <p className="text-xs text-fg-60">T15</p>
      <p className="text-lg font-semibold text-fg-40 mt-1">Monthly 303 (REDEME)</p>
      <p className="text-sm text-fg-60 mt-2">Profile periodicity MENSUAL. Calculate and file 2026-03, not Q1.</p>
    </div>
  </div>
);

const CloseVisual = () => (
  <ul className="max-w-2xl space-y-3 text-fg-40">
    <li className="rounded-xl border border-bd-50 bg-bg-60 px-4 py-3 text-sm">AEAT sandbox for modelo presentación — different from VeriFactu.</li>
    <li className="rounded-xl border border-bd-50 bg-bg-60 px-4 py-3 text-sm">Official year-specific schema still required for production casillas.</li>
    <li className="rounded-xl border border-bd-50 bg-bg-60 px-4 py-3 text-sm">NRC payment is out of scope. Accepted is not paid.</li>
  </ul>
);

const visualFor = (id) => {
  switch (id) {
    case "pipeline":
      return <PipelineVisual />;
    case "s1":
      return <CardsVisual />;
    case "t3":
      return <VatVisual />;
    case "guards":
      return <GuardsVisual />;
    case "xml":
      return <XmlVisual />;
    case "submit":
      return <SubmitVisual />;
    case "more":
      return <MoreVisual />;
    case "close":
      return <CloseVisual />;
    default:
      return null;
  }
};

const TicketsDemo = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef(null);
  const slide = SLIDES[index];
  const totalMs = useMemo(() => SLIDES.reduce((sum, item) => sum + item.durationMs, 0), []);
  const elapsedMs = useMemo(
    () => SLIDES.slice(0, index).reduce((sum, item) => sum + item.durationMs, 0),
    [index]
  );

  const go = useCallback((next) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => {
      if (index >= SLIDES.length - 1) {
        setPlaying(false);
        return;
      }
      setIndex((prev) => prev + 1);
    }, slide.durationMs);
    return () => window.clearTimeout(timer);
  }, [playing, index, slide.durationMs]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        setPlaying((prev) => !prev);
      } else if (event.key === "ArrowRight") {
        go(index + 1);
      } else if (event.key === "ArrowLeft") {
        go(index - 1);
      } else if (event.key === "f" || event.key === "F") {
        toggleFullscreen();
      } else if (event.key === "Escape") {
        setPlaying(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 2200);
  };

  const toggleFullscreen = async () => {
    const node = rootRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setFullscreen(false);
      return;
    }
    await node.requestFullscreen();
    setFullscreen(true);
  };

  const startLiveTour = () => {
    sessionStorage.setItem(PRESENT_STORAGE_KEY, "1");
    sessionStorage.setItem(PRESENT_SCENE_KEY, "0");
    setPlaying(false);
    navigate(LIVE_SCENES[0].path);
  };

  const startRecording = async () => {
    setIndex(0);
    setPlaying(true);
    showControls();
    try {
      await toggleFullscreen();
    } catch {
      /* browser may block fullscreen without a gesture; Play still starts */
    }
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-bg-70 text-fg-40 flex flex-col"
      onMouseMove={showControls}
    >
      <div className="h-1 bg-bg-50">
        <div
          className="h-full bg-ac-02 transition-[width] duration-500"
          style={{ width: `${((elapsedMs + (playing ? 0 : 0)) / totalMs) * 100}%` }}
        />
      </div>

      <div className="flex-1 px-8 md:px-16 py-10 flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-fg-60">
            {slide.kicker || (slide.sprint ? `Sprint ${slide.sprint}` : "Contia365 · Tickets v2")}
          </p>
          <div className="flex items-center gap-2">
            {slide.tickets.map((ticket) => (
              <TicketChip key={ticket} id={ticket} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs text-fg-60 mb-3">
            {index + 1} / {SLIDES.length}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl">
            {slide.title}
          </h1>
          <div className="mt-10">{visualFor(slide.id)}</div>
        </div>
      </div>

      <div className="px-8 md:px-16 pb-6">
        <div className="rounded-2xl border border-bd-50 bg-bg-60 px-5 py-4">
          <p className="text-[11px] uppercase tracking-wider text-fg-60 mb-1">Say this</p>
          <p className="text-base md:text-lg text-fg-40 leading-snug">{slide.say}</p>
        </div>
      </div>

      <div
        className={`px-8 md:px-16 pb-8 flex flex-wrap items-center gap-2 transition-opacity ${
          controlsVisible || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={startRecording}
          className="h-10 px-4 rounded-xl bg-ac-02 text-white text-sm font-medium inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Play fullscreen
        </button>
        <button
          type="button"
          onClick={() => setPlaying((prev) => !prev)}
          className="h-10 px-4 rounded-xl bg-bg-50 border border-bd-50 text-sm font-medium inline-flex items-center gap-2"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => go(index - 1)}
          className="h-10 w-10 rounded-xl bg-bg-50 border border-bd-50 inline-flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="h-10 w-10 rounded-xl bg-bg-50 border border-bd-50 inline-flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="h-10 px-4 rounded-xl bg-bg-50 border border-bd-50 text-sm font-medium inline-flex items-center gap-2"
        >
          {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          Fullscreen
        </button>
        <button
          type="button"
          onClick={startLiveTour}
          className="h-10 px-4 rounded-xl bg-bg-50 border border-bd-50 text-sm font-medium inline-flex items-center gap-2"
        >
          <Radio className="w-4 h-4" />
          Record live product
        </button>
        <p className="text-xs text-fg-60 ml-2">Space play · arrows change slide · F fullscreen · Win+G to record</p>
      </div>
    </div>
  );
};

export default TicketsDemo;

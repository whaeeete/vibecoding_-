import { useEffect, useRef, useState } from "react";
import { Eraser, ImagePlus, RotateCcw, Trash2 } from "lucide-react";

interface SketchPadProps {
  onAttachSketch: (dataUrl: string) => void;
  onCancel: () => void;
}

const PEN_COLORS = [
  { label: "흑연", value: "#1C1917" },
  { label: "마리골드", value: "#F59E0B" },
  { label: "코발트", value: "#1D4ED8" },
  { label: "세이지", value: "#047857" },
  { label: "크림슨", value: "#BE123C" },
];

export function SketchPad({ onAttachSketch, onCancel }: SketchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>("#1C1917");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
    setIsDrawing(true);
    setHasStroke(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [...historyRef.current.slice(-14), snapshot];
  }

  function handleUndo() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || historyRef.current.length <= 1) return;
    const nextHistory = historyRef.current.slice(0, -1);
    historyRef.current = nextHistory;
    ctx.putImageData(nextHistory[nextHistory.length - 1], 0, 0);
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    setHasStroke(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAttachSketch(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAttachCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onAttachSketch(canvas.toDataURL("image/png"));
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">러프 구도 스케치 패드</h3>
          <p className="text-xs text-stone-500">
            간단히 형태와 배치만 그려 보내면 멘토가 구도를 보고 조언해 줍니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 whitespace-nowrap shrink-0"
          >
            <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
            사진 올리기
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
        <div className="flex items-center gap-2">
          {PEN_COLORS.map((c) => {
            const active = !isEraser && color === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-label={`${c.label} 색상`}
                onClick={() => {
                  setIsEraser(false);
                  setColor(c.value);
                }}
                className={`h-6 w-6 cursor-pointer rounded-full border transition-transform ${
                  active ? "scale-110 border-amber-500 ring-2 ring-amber-200" : "border-stone-300"
                }`}
                style={{ backgroundColor: c.value }}
              />
            );
          })}
          <span className="mx-1 h-4 w-px bg-stone-200" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setIsEraser((prev) => !prev)}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isEraser ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
            지우개
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setLineWidth(w)}
              aria-label={`선 두께 ${w}px`}
              className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                lineWidth === w ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {w === 2 ? "가는선" : w === 4 ? "중간선" : "굵은선"}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-stone-200" aria-hidden="true" />
          <button
            type="button"
            onClick={handleUndo}
            title="되돌리기"
            aria-label="되돌리기"
            className="cursor-pointer rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            title="모두 지우기"
            aria-label="모두 지우기"
            className="cursor-pointer rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block h-52 w-full cursor-crosshair touch-none bg-white"
        />
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 whitespace-nowrap shrink-0"
        >
          닫기
        </button>
        <button
          type="button"
          disabled={!hasStroke}
          onClick={handleAttachCanvas}
          className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 whitespace-nowrap shrink-0"
        >
          이 스케치 첨부하기
        </button>
      </div>
    </div>
  );
}

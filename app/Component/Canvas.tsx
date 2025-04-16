'use client';

import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import Button from './Button';

type CanvasShape =
  | {
      id: string;
      type: 'rectangle' | 'triangle' | 'ellipse' | 'line';
      x: number;
      y: number;
      width: number;
      height: number;
      stroke: string;
      strokeWidth: number;
      fill: string;
    }
  | {
      id: string;
      type: 'free-draw';
      points: { x: number; y: number }[];
      stroke: string;
      strokeWidth: number;
    };

type Tool = 'free-draw' | 'rectangle' | 'line' | 'triangle' | 'ellipse';

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [selectedSizeLabel, setSelectedSizeLabel] = useState('Rectangle (2:3)');
  const [drawColor, setDrawColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(1);
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasShape[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasShape[][]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentTool, setCurrentTool] = useState<Tool>('free-draw');
  const [currentFreeDrawPoints, setCurrentFreeDrawPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isPortrait, setIsPortrait] = useState(false);

  const sizes = [
    { label: 'Rectangle (2:3)', width: 800, height: 533 },
    { label: 'Square (1:1)', width: 600, height: 600 },
    { label: 'Runner (1:4)', width: 800, height: 200 },
  ];

  function pushUndo() {
    setUndoStack((prev) => [...prev, shapes]);
    setRedoStack([]);
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const shape of shapes) {
      ctx.lineWidth = shape.strokeWidth;
      ctx.strokeStyle = shape.stroke;

      if (shape.type === 'rectangle') {
        ctx.fillStyle = shape.fill;
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.fill();
        ctx.stroke();
      }

      if (shape.type === 'free-draw') {
        ctx.beginPath();
        shape.points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }

      if (shape.type === 'triangle') {
        ctx.fillStyle = shape.fill;
        ctx.beginPath();
        ctx.moveTo(shape.x + shape.width / 2, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.lineTo(shape.x, shape.y + shape.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      if (shape.type === 'ellipse') {
        ctx.fillStyle = shape.fill;
        ctx.beginPath();
        ctx.ellipse(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          shape.width / 2,
          shape.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
      }

      if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.stroke();
      }
    }

    if (currentTool === 'free-draw' && currentFreeDrawPoints.length > 1) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = drawColor;
      ctx.beginPath();
      currentFreeDrawPoints.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    if (startPos && mousePos) {
      const x = Math.min(startPos.x, mousePos.x);
      const y = Math.min(startPos.y, mousePos.y);
      const width = Math.abs(mousePos.x - startPos.x);
      const height = Math.abs(mousePos.y - startPos.y);

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = drawColor;
      ctx.fillStyle = fillColor;

      if (currentTool === 'rectangle') {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
      }

      if (currentTool === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      if (currentTool === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          width / 2,
          height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
      }

      if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
      }
    }
  }, [
    shapes,
    backgroundColor,
    drawColor,
    fillColor,
    lineWidth,
    startPos,
    mousePos,
    currentTool,
    currentFreeDrawPoints,
  ]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (['rectangle', 'triangle', 'ellipse', 'line'].includes(currentTool)) {
      setStartPos({ x, y });
    } else if (currentTool === 'free-draw') {
      setCurrentFreeDrawPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (currentTool === 'free-draw' && currentFreeDrawPoints.length > 0) {
      setCurrentFreeDrawPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (currentTool === 'free-draw' && currentFreeDrawPoints.length > 1) {
      const newShape: CanvasShape = {
        id: crypto.randomUUID(),
        type: 'free-draw',
        points: currentFreeDrawPoints,
        stroke: drawColor,
        strokeWidth: lineWidth,
      };
      pushUndo();
      setShapes((prev) => [...prev, newShape]);
    }

    if (
      startPos &&
      ['rectangle', 'triangle', 'ellipse', 'line'].includes(currentTool)
    ) {
      let shapeX = Math.min(startPos.x, clientX);
      let shapeY = Math.min(startPos.y, clientY);
      let width = Math.abs(clientX - startPos.x);
      let height = Math.abs(clientY - startPos.y);

      if (currentTool === 'line') {
        shapeX = startPos.x;
        shapeY = startPos.y;
        width = clientX - startPos.x;
        height = clientY - startPos.y;
      }

      const newShape: CanvasShape = {
        id: crypto.randomUUID(),
        type: currentTool as 'rectangle' | 'triangle' | 'ellipse' | 'line',
        x: shapeX,
        y: shapeY,
        width,
        height,
        stroke: drawColor,
        fill: fillColor,
        strokeWidth: lineWidth,
      };
      pushUndo();
      setShapes((prev) => [...prev, newShape]);
    }

    setMousePos(null);
    setStartPos(null);
    setCurrentFreeDrawPoints([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-6">
          <Button
            onClick={() => {
              setIsPortrait(!isPortrait);
              setCanvasSize({
                width: canvasSize.height,
                height: canvasSize.width,
              });
            }}
          >
            {isPortrait ? 'Portrait' : 'Landscape'}
          </Button>
          <div>
            Background Color
            <HexColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
            />
          </div>
          <div>
            Color
            <HexColorPicker color={drawColor} onChange={setDrawColor} />
          </div>
          <div className="block space-y-2">
            <Button onClick={() => setCurrentTool('free-draw')}>
              ✏️ Free Draw
            </Button>
            <Button onClick={() => setCurrentTool('line')}>📏 Line</Button>
            <Button onClick={() => setCurrentTool('rectangle')}>
              🟦 Rectangle
            </Button>
            <Button onClick={() => setCurrentTool('triangle')}>
              🔺 Triangle
            </Button>
            <Button onClick={() => setCurrentTool('ellipse')}>
              🟠 Ellipse
            </Button>
          </div>
          <Button
            onClick={() => {
              if (undoStack.length === 0) {
                return;
              }

              const prev = [...undoStack];
              const last = prev.pop()!;
              setUndoStack(prev);
              setRedoStack((redo) => [...redo, shapes]);
              setShapes(last);
            }}
          >
            ↩️ Undo
          </Button>
          <Button
            onClick={() => {
              if (redoStack.length === 0) {
                return;
              }

              const next = [...redoStack];
              const last = next.pop()!;
              setRedoStack(next);
              setUndoStack((undo) => [...undo, shapes]);
              setShapes(last);
            }}
          >
            ↪️ Redo
          </Button>
          <div className="m-2">
            <div>Line Thickness: {lineWidth}px</div>
            <input
              type="range"
              min={1}
              max={100}
              value={lineWidth}
              onChange={(event) =>
                setLineWidth(Number(event.currentTarget.value))
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            {sizes.map((size) => (
              <label key={`size-${size.label}`} className="block">
                <input
                  type="radio"
                  name="rugSize"
                  value={size.label}
                  checked={selectedSizeLabel === size.label}
                  onChange={() => {
                    setCanvasSize({ width: size.width, height: size.height });
                    setSelectedSizeLabel(size.label);
                  }}
                />
                <span className="ml-2">{size.label}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => {
                setShapes([]);
                setUndoStack([]);
                setRedoStack([]);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                const canvas = canvasRef.current;

                if (!canvas) {
                  return;
                }

                const link = document.createElement('a');
                link.download = 'design.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
              }}
            >
              Download
            </Button>
          </div>
        </div>
        <div className="flex items-start justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border-2 border-black cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
}

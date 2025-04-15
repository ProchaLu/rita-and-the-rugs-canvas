'use client';

import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import Button from './Button';

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [selectedSizeLabel, setSelectedSizeLabel] = useState('Rectangle (2:3)');
  const [drawColor, setDrawColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(1);

  const sizes = [
    { label: 'Rectangle (2:3)', width: 800, height: 533 },
    { label: 'Square (1:1)', width: 600, height: 600 },
    { label: 'Runner (1:4)', width: 800, height: 200 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = drawColor;
    ctx.lineCap = 'round';

    const handleMouseDown = (e: MouseEvent) => {
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      setIsDrawing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDrawing, drawColor, lineWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [backgroundColor]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-6">
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
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
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
          />
        </div>
      </div>
    </div>
  );
}

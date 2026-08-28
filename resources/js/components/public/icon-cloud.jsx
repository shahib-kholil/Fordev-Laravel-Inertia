import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export function IconCloud({ images = [], showControl = true }) {
    const canvasRef = useRef(null);
    const [iconPositions, setIconPositions] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [targetRotation, setTargetRotation] = useState(null);
    const animationFrameRef = useRef(0);
    const rotationRef = useRef({ x: 0, y: 0 });
    const iconCanvasesRef = useRef([]);
    const imagesLoadedRef = useRef([]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setIsPaused(mediaQuery.matches);
        const handleChange = (event) => setIsPaused(event.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        imagesLoadedRef.current = new Array(images.length).fill(false);
        iconCanvasesRef.current = images.map((src, index) => {
            const offscreen = document.createElement('canvas');
            offscreen.width = 40;
            offscreen.height = 40;
            const offCtx = offscreen.getContext('2d');
            if (!offCtx) return offscreen;

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                offCtx.clearRect(0, 0, 40, 40);
                offCtx.beginPath();
                offCtx.arc(20, 20, 20, 0, Math.PI * 2);
                offCtx.closePath();
                offCtx.clip();
                offCtx.drawImage(img, 0, 0, 40, 40);
                imagesLoadedRef.current[index] = true;
            };
            img.src = src;
            return offscreen;
        });
    }, [images]);

    useEffect(() => {
        const numIcons = images.length || 20;
        const offset = 2 / numIcons;
        const increment = Math.PI * (3 - Math.sqrt(5));
        setIconPositions(Array.from({ length: numIcons }, (_, i) => {
            const y = i * offset - 1 + offset / 2;
            const r = Math.sqrt(1 - y * y);
            const phi = i * increment;
            return { x: Math.cos(phi) * r * 100, y: y * 100, z: Math.sin(phi) * r * 100, id: i };
        }));
    }, [images.length]);

    function handleMouseDown(event) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect || !canvasRef.current) return;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        iconPositions.forEach((icon) => {
            const cosX = Math.cos(rotationRef.current.x);
            const sinX = Math.sin(rotationRef.current.x);
            const cosY = Math.cos(rotationRef.current.y);
            const sinY = Math.sin(rotationRef.current.y);
            const rotatedX = icon.x * cosY - icon.z * sinY;
            const rotatedZ = icon.x * sinY + icon.z * cosY;
            const rotatedY = icon.y * cosX + rotatedZ * sinX;
            const screenX = canvasRef.current.width / 2 + rotatedX;
            const screenY = canvasRef.current.height / 2 + rotatedY;
            const radius = 20 * ((rotatedZ + 200) / 300);

            if ((x - screenX) ** 2 + (y - screenY) ** 2 < radius ** 2) {
                const targetX = -Math.atan2(icon.y, Math.sqrt(icon.x * icon.x + icon.z * icon.z));
                const targetY = Math.atan2(icon.x, icon.z);
                const currentX = rotationRef.current.x;
                const currentY = rotationRef.current.y;
                const distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);
                setTargetRotation({ x: targetX, y: targetY, startX: currentX, startY: currentY, startTime: performance.now(), duration: Math.min(2000, Math.max(800, distance * 1000)) });
            }
        });

        setIsDragging(true);
        setLastMousePos({ x: event.clientX, y: event.clientY });
    }

    function handleMouseMove(event) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        if (!isDragging) return;

        rotationRef.current = {
            x: rotationRef.current.x + (event.clientY - lastMousePos.y) * 0.002,
            y: rotationRef.current.y + (event.clientX - lastMousePos.x) * 0.002,
        };
        setLastMousePos({ x: event.clientX, y: event.clientY });
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            const dx = mousePos.x - centerX;
            const dy = mousePos.y - centerY;
            const speed = 0.003 + (Math.sqrt(dx * dx + dy * dy) / maxDistance) * 0.01;

            if (targetRotation) {
                const progress = Math.min(1, (performance.now() - targetRotation.startTime) / targetRotation.duration);
                const eased = easeOutCubic(progress);
                rotationRef.current = {
                    x: targetRotation.startX + (targetRotation.x - targetRotation.startX) * eased,
                    y: targetRotation.startY + (targetRotation.y - targetRotation.startY) * eased,
                };
                if (progress >= 1) setTargetRotation(null);
            } else if (!isDragging && !isPaused) {
                rotationRef.current = {
                    x: rotationRef.current.x + (dy / canvas.height) * speed,
                    y: rotationRef.current.y + (dx / canvas.width) * speed,
                };
            }

            iconPositions.forEach((icon, index) => {
                const cosX = Math.cos(rotationRef.current.x);
                const sinX = Math.sin(rotationRef.current.x);
                const cosY = Math.cos(rotationRef.current.y);
                const sinY = Math.sin(rotationRef.current.y);
                const rotatedX = icon.x * cosY - icon.z * sinY;
                const rotatedZ = icon.x * sinY + icon.z * cosY;
                const rotatedY = icon.y * cosX + rotatedZ * sinX;
                const scale = (rotatedZ + 200) / 300;
                const opacity = Math.max(0.2, Math.min(1, (rotatedZ + 150) / 200));

                ctx.save();
                ctx.translate(canvas.width / 2 + rotatedX, canvas.height / 2 + rotatedY);
                ctx.scale(scale, scale);
                ctx.globalAlpha = opacity;
                if (iconCanvasesRef.current[index] && imagesLoadedRef.current[index]) {
                    ctx.drawImage(iconCanvasesRef.current[index], -20, -20, 40, 40);
                }
                ctx.restore();
            });

            const hasPendingAssets = images.length > 0 && !imagesLoadedRef.current.every(Boolean);
            if (!isPaused || isDragging || targetRotation || hasPendingAssets) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [images.length, iconPositions, isDragging, isPaused, mousePos, targetRotation]);

    return (
        <div className="relative inline-block">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                className="size-full max-h-[22rem] max-w-[22rem] rounded-3xl"
                aria-label="Interactive 3D Icon Cloud"
                role="img"
            />
            {showControl && (
                <Button variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)} aria-label={isPaused ? 'Play Animation' : 'Pause Animation'} className="absolute right-2 top-2">
                    {isPaused ? <Play /> : <Pause />}
                </Button>
            )}
        </div>
    );
}

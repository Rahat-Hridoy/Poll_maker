'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
    targetDate: string;
    onComplete?: () => void;
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();

            if (difference <= 0) {
                setTimeLeft('00:00:00');
                if (onComplete) onComplete();
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            let parts = [];
            if (days > 0) parts.push(`${days}d`);
            parts.push(`${hours.toString().padStart(2, '0')}h`);
            parts.push(`${minutes.toString().padStart(2, '0')}m`);
            parts.push(`${seconds.toString().padStart(2, '0')}s`);

            setTimeLeft(parts.join(' '));
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    return (
        <div className="flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 animate-pulse">
            <Clock className="h-3 w-3" />
            <span>Goes live in: {timeLeft}</span>
        </div>
    );
}

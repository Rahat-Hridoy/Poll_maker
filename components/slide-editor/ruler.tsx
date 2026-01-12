"use client"

import React, { useMemo } from 'react'

interface RulerProps {
    orientation: 'horizontal' | 'vertical'
    length: number
    unit?: number
    zoom?: number
    gap?: number
}

export function Ruler({ orientation, length, unit = 100, zoom = 1, gap = 0 }: RulerProps) {
    const thickness = 20

    // Generate ticks
    const ticks = useMemo(() => {
        const items = []
        // Add some extra length just in case
        const totalLength = length + 50

        for (let i = 0; i <= totalLength; i += 10) {
            const isMajor = i % 100 === 0
            const isMedium = i % 50 === 0
            const tickLength = isMajor ? thickness : isMedium ? thickness * 0.6 : thickness * 0.3

            items.push({
                pos: i,
                isMajor,
                length: tickLength
            })
        }
        return items
    }, [length])

    return (
        <div
            className={`absolute bg-muted text-[8px] text-muted-foreground select-none flex overflow-hidden z-10 border-border`}
            style={{
                [orientation === 'horizontal' ? 'left' : 'top']: 0,
                [orientation === 'horizontal' ? 'top' : 'left']: -(thickness + gap),
                width: orientation === 'horizontal' ? length : thickness,
                height: orientation === 'horizontal' ? thickness : length,
                borderBottom: orientation === 'horizontal' ? '1px solid' : 'none',
                borderRight: orientation === 'vertical' ? '1px solid' : 'none',
                borderTop: orientation === 'horizontal' ? '' : 'none',
                borderLeft: orientation === 'vertical' ? ' ' : 'none',
            }}
        >
            <svg
                width="100%"
                height="100%"
                className="pointer-events-none"
            >
                {ticks.map((tick) => {
                    if (orientation === 'horizontal') {
                        return (
                            <React.Fragment key={tick.pos}>
                                <line
                                    x1={tick.pos}
                                    y1={thickness}
                                    x2={tick.pos}
                                    y2={thickness - tick.length}
                                    stroke="currentColor"
                                    strokeWidth={tick.isMajor ? 1 : 0.5}
                                />
                                {tick.isMajor && (
                                    <text
                                        x={tick.pos + 2}
                                        y={10}
                                        className="fill-current"
                                        style={{ fontSize: 8 }}
                                    >
                                        {tick.pos}
                                    </text>
                                )}
                            </React.Fragment>
                        )
                    } else {
                        return (
                            <React.Fragment key={tick.pos}>
                                <line
                                    x1={thickness}
                                    y1={tick.pos}
                                    x2={thickness - tick.length}
                                    y2={tick.pos}
                                    stroke="currentColor"
                                    strokeWidth={tick.isMajor ? 1 : 0.5}
                                />
                                {tick.isMajor && (
                                    <text
                                        x={2}
                                        y={tick.pos + 8}
                                        className="fill-current"
                                        style={{ fontSize: 8, writingMode: 'vertical-lr', textOrientation: 'sideways' }}
                                    >
                                        {tick.pos}
                                    </text>
                                )}
                            </React.Fragment>
                        )
                    }
                })}
            </svg>
        </div>
    )
}

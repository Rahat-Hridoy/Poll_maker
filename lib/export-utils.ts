"use client"

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import { Presentation, Slide } from './data';

/**
 * Universal Color Normalizer
 * Uses a hidden canvas to convert ANY CSS color string (oklch, lab, oklab, hex, named, etc.)
 * into a standard rgba() string that html2canvas is guaranteed to support.
 */
const normalizeColorToRgba = (color: string): string => {
    if (!color || color === 'transparent' || color === 'initial' || color === 'inherit') return 'rgba(0,0,0,0)';

    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return color;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    } catch (e) {
        console.warn("Color normalization failed for:", color, e);
        return color;
    }
};

// Selection of properties that often contain colors
const COLOR_PROPERTIES = [
    'color', 'backgroundColor', 'borderColor',
    'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'fill', 'stroke', 'outlineColor', 'textShadow', 'boxShadow'
];

/**
 * Deep Sanitizer for the cloned document.
 * 1. Removes all external stylesheets (preventing the parser from seeing oklch/lab in rules).
 * 2. Applies computed RGB colors to every element as inline styles.
 */
const deepSanitizeClone = (originalRoot: HTMLElement, clonedDoc: Document) => {
    // 1. Remove all stylesheets from the clone to prevent parsing crashes
    const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(s => s.remove());

    // 2. Map original computed styles to clones
    const originalElements = [originalRoot, ...Array.from(originalRoot.querySelectorAll('*'))];
    const clonedRoot = clonedDoc.getElementById(originalRoot.id);
    if (!clonedRoot) return;
    const clonedElements = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll('*'))];

    if (originalElements.length !== clonedElements.length) {
        console.warn("Cloned DOM structure differs from original. Sanitization might be incomplete.");
    }

    const count = Math.min(originalElements.length, clonedElements.length);
    for (let i = 0; i < count; i++) {
        const orig = originalElements[i] as HTMLElement;
        const clone = clonedElements[i] as HTMLElement;
        const computedStyle = window.getComputedStyle(orig);

        // Normalize and bake-in all color properties
        COLOR_PROPERTIES.forEach(prop => {
            const value = (computedStyle as any)[prop];
            if (value) {
                clone.style.setProperty(prop, normalizeColorToRgba(value), 'important');
            }
        });

        // Neutralize gradients that might contain oklch (complex to parse, so we simplify)
        if (computedStyle.backgroundImage.includes('oklch') || computedStyle.backgroundImage.includes('lab')) {
            clone.style.backgroundImage = 'none';
        }

        // Ensure visibility and layout stability
        clone.style.opacity = computedStyle.opacity;
        clone.style.display = computedStyle.display;
        clone.style.visibility = computedStyle.visibility;
    }
};

// Helper to wait for images
const waitForImages = (element: HTMLElement) => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    return Promise.all(promises);
};

export async function exportToPDF(presentation: Presentation) {
    try {
        console.log("Starting PDF export with deep color sanitization...");
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: presentation.aspectRatio === '4:3' ? [1000, 750] : [1000, 562.5]
        });

        const slideElements = document.querySelectorAll('[id^="slide-canvas-"]');

        if (slideElements.length === 0) {
            alert("No slide content found to export. Please ensure the slide is loaded.");
            return;
        }

        for (let i = 0; i < slideElements.length; i++) {
            const originalElement = slideElements[i] as HTMLElement;
            await waitForImages(originalElement);

            const canvas = await html2canvas(originalElement, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    deepSanitizeClone(originalElement, clonedDoc);
                }
            });

            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage();

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
        }

        pdf.save(`${presentation.title || 'presentation'}.pdf`);
    } catch (error) {
        console.error("PDF Export failed:", error);
        alert(`PDF Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function exportToPPTX(presentation: Presentation) {
    try {
        const pptx = new pptxgen();
        pptx.layout = presentation.aspectRatio === '4:3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';

        for (const slideData of presentation.slides) {
            const slide = pptx.addSlide();

            if (slideData.background) {
                if (slideData.background.startsWith('#')) {
                    slide.background = { color: slideData.background.replace('#', '') };
                } else if (slideData.background.startsWith('http')) {
                    slide.background = { path: slideData.background };
                }
            }

            try {
                const elements = JSON.parse(slideData.content);
                for (const el of elements) {
                    const x = (el.x / 1000) * 10;
                    const y = (el.y / (presentation.aspectRatio === '4:3' ? 750 : 562.5)) * 10;
                    const w = (el.width / 1000) * 10;
                    const h = (el.height / (presentation.aspectRatio === '4:3' ? 750 : 562.5)) * 10;

                    if (el.type === 'text') {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = el.content || '';
                        const text = tempDiv.innerText;

                        slide.addText(text, {
                            x, y, w, h,
                            fontSize: el.style.fontSize ? parseInt(el.style.fontSize.toString()) * 0.75 : 18,
                            color: el.style.color ? el.style.color.toString().replace('#', '') : '000000',
                            align: el.style.textAlign as any || 'left',
                            fontFace: el.style.fontFamily as any || 'Arial',
                            rotate: el.rotation || 0
                        });
                    } else if (el.type === 'image') {
                        slide.addImage({
                            path: el.content,
                            x, y, w, h,
                            rotate: el.rotation || 0
                        });
                    } else if (['rect', 'circle', 'triangle', 'star'].includes(el.type)) {
                        let shapeType: any = 'RECTANGLE';
                        if (el.type === 'circle') shapeType = 'OVAL';
                        if (el.type === 'triangle') shapeType = 'TRIANGLE';
                        if (el.type === 'star') shapeType = 'STAR_5_POINT';

                        slide.addShape(shapeType, {
                            x, y, w, h,
                            fill: { color: el.style.backgroundColor ? el.style.backgroundColor.toString().replace('#', '') : 'CCCCCC' },
                            line: { color: el.style.borderColor ? el.style.borderColor.toString().replace('#', '') : '000000', width: 1 },
                            rotate: el.rotation || 0
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to parse slide content for PPTX", e);
            }
        }

        await pptx.writeFile({ fileName: `${presentation.title || 'presentation'}.pptx` });
    } catch (error) {
        console.error("PPTX Export failed:", error);
        alert(`PPTX Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

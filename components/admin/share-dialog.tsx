'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Download, Copy, Check, Share2, Link as LinkIcon, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
    url: string;
    shortCode: string;
    title: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({ url, shortCode, title, trigger, open, onOpenChange }: ShareDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    const copyToClipboard = async (text: string, type: 'link' | 'code') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'link') {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            } else {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const downloadQRCode = () => {
        const qrId = `qr-code-svg-${title.replace(/\s+/g, '_')}`;
        const svg = document.getElementById(qrId);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `QR_Code_${title.replace(/\s+/g, '_')}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <>
            {trigger && (
                <div onClick={() => setIsOpen?.(true)}>
                    {trigger}
                </div>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-2xl rounded-4xl border-border dark:border-white/10 p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 pb-4 bg-primary/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Share2 className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black">Share Poll</DialogTitle>
                                <DialogDescription className="text-xs font-medium">Spread the word and get more votes.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {/* Left Column: Link & Code */}
                            <div className="md:col-span-3 space-y-6">
                                {/* Sharable Link */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <LinkIcon className="h-3 w-3" /> Sharable Link
                                    </label>
                                    <div className="flex gap-2 group">
                                        <div className="flex-1 px-4 h-12 bg-muted/50 rounded-xl flex items-center text-sm font-medium truncate border border-transparent group-hover:border-border transition-colors">
                                            {url}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className={cn("h-12 w-12 rounded-xl shrink-0 transition-all", copiedLink && "bg-emerald-50 text-emerald-600 border-emerald-200")}
                                            onClick={() => copyToClipboard(url, 'link')}
                                        >
                                            {copiedLink ? <Check className="h-5 w-5" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Unique Code */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Hash className="h-3 w-3" /> Poll Code
                                    </label>
                                    <div className="flex gap-2 group">
                                        <div className="flex-1 px-4 h-14 bg-primary/5 text-primary rounded-xl flex items-center text-3xl font-black tracking-[0.25em] border border-primary/20 group-hover:border-primary/40 transition-colors">
                                            {shortCode}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className={cn("h-14 w-14 rounded-xl shrink-0 transition-all", copiedCode && "bg-emerald-50 text-emerald-600 border-emerald-200")}
                                            onClick={() => copyToClipboard(shortCode, 'code')}
                                        >
                                            {copiedCode ? <Check className="h-6 w-6" /> : <Copy className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: QR Code */}
                            <div className="md:col-span-2 flex flex-col justify-between">
                                <div className="space-y-2 h-full flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 md:justify-center">
                                        <Share2 className="h-3 w-3" /> Scan & Vote
                                    </label>
                                    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/20 transition-colors w-full">
                                        <QRCodeSVG
                                            id={`qr-code-svg-${title.replace(/\s+/g, '_')}`}
                                            value={url}
                                            size={100}
                                            level="H"
                                            includeMargin={true}
                                        />
                                        <Button variant="ghost" size="sm" onClick={downloadQRCode} className="mt-2 h-7 text-[10px] font-bold text-primary uppercase tracking-wider hover:bg-primary/5">
                                            <Download className="mr-1.5 h-3 w-3" /> Save Image
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

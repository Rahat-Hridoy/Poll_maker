'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Download, QrCode } from 'lucide-react';

interface QRCodeDialogProps {
    url: string;
    title: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function QRCodeDialog({ url, title, trigger, open, onOpenChange }: QRCodeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    const downloadQRCode = () => {
        const svg = document.getElementById('qr-code-svg');
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code for {title}</DialogTitle>
                        <DialogDescription>
                            Scan this code or download it to share your poll.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border">
                        <QRCodeSVG
                            id="qr-code-svg"
                            value={url}
                            size={256}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <DialogFooter className="flex sm:justify-center gap-2">
                        <Button onClick={downloadQRCode} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download as PNG
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

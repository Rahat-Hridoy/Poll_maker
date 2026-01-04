'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownFromLine, Loader2 } from 'lucide-react';
import { importPolls } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function ImportButton() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await importPolls(formData);
            if (result.success) {
                // Success - refresh data automatically
                router.refresh();
            } else {
                alert(`Import failed: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred during import.");
        } finally {
            setIsLoading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <>
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleClick} disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ArrowDownFromLine className="mr-2 h-4 w-4" />
                )}
                Import CSV
            </Button>
        </>
    );
}

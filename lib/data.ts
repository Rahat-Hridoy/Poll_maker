export type QuestionType = 'single' | 'multiple' | 'text';

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface PollQuestion {
    id: string;
    text: string;
    type: QuestionType;
    options: PollOption[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string; // In real app, this should be hashed!
}

export interface PollClient {
    name: string;
    email: string;
    time: string;
}

export interface Poll {
    id: string;
    shortCode: string;
    title: string;
    description?: string;
    status: 'draft' | 'published' | 'closed' | 'scheduled';
    scheduledAt?: string;
    createdAt: string;
    visitors: number;
    totalVotes: number;
    questions: PollQuestion[];
    creatorId?: string; // Optional for now to support legacy/mock polls
    settings?: PollSettings;
    style?: PollStyle;
    clients?: PollClient[];
}

export interface Slide {
    id: string;
    content: string; // JSON string from TipTap
    background?: string; // color hex or image url
    layout?: 'blank' | 'title' | 'title-content'; // basic layouts
}

export interface Presentation {
    id: string;
    shortCode?: string; // Optional for migration, but new ones will have it
    title: string;
    slides: Slide[];
    theme: string; // 'default', 'dark', 'pastel', etc.
    aspectRatio?: '16:9' | '4:3' | '1:1';
    createdAt: string;
    updatedAt: string;
    creatorId?: string;
}



export interface PollSettings {
    allowMultipleVotes: boolean;
    showResults: boolean;
    allowEditVote: boolean;
}

export interface PollTitleStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'light' | 'normal' | 'medium' | 'bold';
    color: string;
}

export interface PollQuestionStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'light' | 'normal' | 'medium' | 'bold';
    color: string;
    input: {
        borderShape: 'square' | 'rounded' | 'pill' | 'dashed' | 'solid' | 'border-less';
        borderColor: string;
        backgroundColor: string;
        shadow: boolean;
    };
}

export interface PollOptionStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'light' | 'normal' | 'medium' | 'bold';
    color: string;
    radio: {
        type: 'classic' | 'filled' | 'custom';
        size: 'sm' | 'md' | 'lg';
        activeColor: string;
    };
    container: {
        borderShape: 'square' | 'rounded' | 'pill';
        borderColor: string;
        backgroundColor: string;
        hoverEffect: boolean;
        padding: number;
        gap: number;
    };
}

export interface PollStyle {
    // Legacy/Global Fallbacks
    backgroundColor: string;
    textColor: string;
    primaryColor: string;
    fontFamily: string;
    boxShape: 'rounded' | 'square' | 'pill';
    theme: string;

    // New Granular Styles
    title?: PollTitleStyle;
    question?: PollQuestionStyle;
    option?: PollOptionStyle;
}

export const POLL_TEMPLATES: { name: string; style: PollStyle }[] = [
    {
        name: "Blank Canvas",
        style: {
            backgroundColor: "#ffffff",
            textColor: "#000000",
            primaryColor: "#2563eb",
            fontFamily: "Inter, sans-serif",
            boxShape: "rounded",
            theme: "default",
            title: { fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 'bold', color: "#000000" },
            question: {
                fontFamily: "Inter, sans-serif", fontSize: 18, fontWeight: 'medium', color: "#000000",
                input: { borderShape: 'rounded', borderColor: '#e2e8f0', backgroundColor: '#f8fafc', shadow: false }
            },
            option: {
                fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 'normal', color: "#334155",
                radio: { type: 'classic', size: 'md', activeColor: '#2563eb' },
                container: { borderShape: 'rounded', borderColor: '#e2e8f0', backgroundColor: '#ffffff', hoverEffect: true, padding: 12, gap: 10 }
            }
        }
    },
    {
        name: "Midnight Modern",
        style: {
            backgroundColor: "#0f172a",
            textColor: "#f8fafc",
            primaryColor: "#8b5cf6",
            fontFamily: "Inter, sans-serif",
            boxShape: "pill",
            theme: "dark",
            title: { fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 'bold', color: "#f8fafc" },
            question: {
                fontFamily: "Inter, sans-serif", fontSize: 18, fontWeight: 'medium', color: "#e2e8f0",
                input: { borderShape: 'pill', borderColor: '#334155', backgroundColor: '#1e293b', shadow: true }
            },
            option: {
                fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 'normal', color: "#cbd5e1",
                radio: { type: 'filled', size: 'md', activeColor: '#8b5cf6' },
                container: { borderShape: 'pill', borderColor: '#334155', backgroundColor: '#1e293b', hoverEffect: true, padding: 14, gap: 12 }
            }
        }
    },
    {
        name: "Corporate Clean",
        style: {
            backgroundColor: "#f8fafc",
            textColor: "#1e293b",
            primaryColor: "#0f766e",
            fontFamily: "Georgia, serif",
            boxShape: "square",
            theme: "professional",
            title: { fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 'bold', color: "#0f766e" },
            question: {
                fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 'medium', color: "#1e293b",
                input: { borderShape: 'square', borderColor: '#cbd5e1', backgroundColor: '#ffffff', shadow: false }
            },
            option: {
                fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 'normal', color: "#334155",
                radio: { type: 'classic', size: 'md', activeColor: '#0f766e' },
                container: { borderShape: 'square', borderColor: '#e2e8f0', backgroundColor: '#ffffff', hoverEffect: false, padding: 10, gap: 8 }
            }
        }
    }
];

export const DEFAULT_STYLE: PollStyle = POLL_TEMPLATES[0].style;

// Temporary Mock Data storage (in memory)
// In a real app we'd use a database.
// For this demo, we can simulate persistent storage with localStorage in components, 
// but for server components we might need a simpler file-based approach or just static mocks to start.

export const MOCK_POLLS: Poll[] = [
    {
        id: "poll-1",
        shortCode: "12345",
        title: "Best Programming Language 2024",
        description: "Help us decide which language rules them all.",
        status: 'published',
        createdAt: new Date().toISOString(),
        visitors: 1240,
        totalVotes: 856,
        questions: [
            {
                id: "q-1",
                text: "What is your primary language?",
                type: "single",
                options: [
                    { id: "opt-1", text: "TypeScript", votes: 450 },
                    { id: "opt-2", text: "Python", votes: 300 },
                    { id: "opt-3", text: "Rust", votes: 106 }
                ]
            }
        ]
    },
    {
        id: "poll-2",
        shortCode: "67890",
        title: "Team Lunch Preferences",
        status: 'draft',
        createdAt: new Date().toISOString(),
        visitors: 0,
        totalVotes: 0,
        questions: []
    }
];

export const MOCK_PRESENTATIONS: Presentation[] = [
    {
        id: "pres-1",
        shortCode: "54321",
        title: "Welcome Presentation",
        theme: "default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slides: [
            {
                id: "slide-1",
                content: JSON.stringify([
                    {
                        id: "title-1",
                        type: "text",
                        x: 100,
                        y: 100,
                        width: 800,
                        height: 200,
                        content: '<h1>Welcome to Slide Maker</h1><p style="text-align: center">Click to edit this text</p>',
                        style: {
                            color: '#000000',
                            textAlign: 'center'
                        }
                    }
                ]),
                background: "#ffffff"
            }
        ]
    }
];



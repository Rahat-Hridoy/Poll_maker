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

export interface Poll {
    id: string;
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
}

export interface PollSettings {
    allowMultipleVotes: boolean;
    showResults: boolean;
    allowEditVote: boolean;
}

export interface PollStyle {
    backgroundColor: string;
    textColor: string;
    primaryColor: string;
    fontFamily: string;
    boxShape: 'rounded' | 'square' | 'pill';
    theme: string;
    chartType: 'bar' | 'pie';
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
            chartType: "bar"
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
            chartType: "bar"
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
            chartType: "pie"
        }
    }
];

// Temporary Mock Data storage (in memory)
// In a real app we'd use a database.
// For this demo, we can simulate persistent storage with localStorage in components, 
// but for server components we might need a simpler file-based approach or just static mocks to start.

export const MOCK_POLLS: Poll[] = [
    {
        id: "poll-1",
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
        title: "Team Lunch Preferences",
        status: 'draft',
        createdAt: new Date().toISOString(),
        visitors: 0,
        totalVotes: 0,
        questions: []
    }
];

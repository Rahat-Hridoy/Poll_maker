export class VoteDto {
    answers: Record<string, string>;
    voterInfo: {
        name: string;
        email: string;
    };
}

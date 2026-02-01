export interface JobApplication {
    id: string;
    user: string;
    company: string;
    role: string;
    location: string;
    status: "Applied" | "Interviewing" | "Offer" | "Rejected";
    jobLink?: string;
    appliedOn: string;
    note?: string;
    interviewStage?: string;
    nextInterviewDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateJobApplicationData {
    company: string;
    role: string;
    location: string;
    status?: "Applied" | "Interviewing" | "Offer" | "Rejected";
    jobLink?: string;
    appliedOn?: string;
    note?: string;
    interviewStage?: string;
    nextInterviewDate?: string;
}

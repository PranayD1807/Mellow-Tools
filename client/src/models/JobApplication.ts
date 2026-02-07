import { EncryptableEntity } from "./EncryptableEntity";

export class JobApplication extends EncryptableEntity {
    id!: string;
    user!: string;
    company!: string;
    role!: string;
    location!: string;
    status!: "Applied" | "Interviewing" | "Offer" | "Rejected";
    jobLink?: string;
    appliedOn!: string;
    note?: string;
    interviewStage?: string;
    nextInterviewDate?: string;
    createdAt!: string;
    updatedAt!: string;

    encryptFields(): (keyof this)[] {
        return ["company", "role", "location", "jobLink", "note", "interviewStage"];
    }
}

export class CreateJobApplicationData extends EncryptableEntity {
    company!: string;
    role!: string;
    location!: string;
    status?: "Applied" | "Interviewing" | "Offer" | "Rejected";
    jobLink?: string;
    appliedOn?: string;
    note?: string;
    interviewStage?: string;
    nextInterviewDate?: string;

    encryptFields(): (keyof this)[] {
        return ["company", "role", "location", "jobLink", "note", "interviewStage"];
    }
}

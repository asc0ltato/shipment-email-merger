import { IEmail } from "./email.types";
import { ISummary } from "./summary.types";

export interface IEmailGroup {
    emailGroupId: string;
    userId?: number;
    createdAt: Date;
    updatedAt: Date;
    emails?: IEmail[];
    summary?: ISummary;
    summaries?: ISummary[];
}
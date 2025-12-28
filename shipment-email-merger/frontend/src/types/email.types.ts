export interface IEmail {
    id: string;
    from: string;
    to: string;
    subject: string;
    date: Date;
    emailGroupId: string;
    status: 'not_processed' | 'processing' | 'processed' | 'failed';
    text?: string;
    html?: string;
    attachments?: IEmailAttachment[];
}

export interface IEmailAttachment {
    id: string;
    emailId: string;
    filename: string;
    content?: Buffer;
    contentType?: string;
    size?: number;
}
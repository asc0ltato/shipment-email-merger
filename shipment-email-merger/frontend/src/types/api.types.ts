import {IEmailGroup} from "@/types/email-group.types";

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface EmailStats {
    new: number;
    processing: number;
    processed: number;
    failed: number;
    total: number;
}

export interface EmailGroupListResponse {
    emailGroups: IEmailGroup[];
    emailStats: EmailStats;
    total: number;
}

export interface RefreshEmailGroupResponse {
    emailGroup: IEmailGroup;
    emailCount: number;
    newEmails: number;
    isNewGroup: boolean;
}

export interface FindEmailsResponse {
    emailCount: number;
    created: boolean;
    emailGroupId: string;
    emailGroup?: IEmailGroup;
    newEmails?: number;
    isNewGroup: boolean;
}

export interface SyncEmailsResponse {
    created: number;
    updated: number;
    newEmails: number;
    createdGroups: IEmailGroup[];
    updatedGroups: string[];
    actualNewEmails: number;
    emailStats?: EmailStats;
}
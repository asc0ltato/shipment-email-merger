'use client';

import { useState } from 'react';

interface AvatarProps {
    email: string;
    size?: number;
}

const getAvatarUrl = (email: string, size: number = 64) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain === 'gmail.com') {
        const emailHash = Buffer.from(email.trim().toLowerCase()).toString('hex');
        return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
    }
    if (domain === 'mail.ru' || domain === 'inbox.ru' || domain === 'list.ru' || domain === 'bk.ru') {
        const emailHash = Buffer.from(email.trim().toLowerCase()).toString('hex');
        return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
    }
    const emailHash = Buffer.from(email.trim().toLowerCase()).toString('hex');
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
};

const getInitials = (email: string) => {
    const namePart = email.split('@')[0];
    if (namePart.includes('.')) {
        const parts = namePart.split('.');
        return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
    }
    return namePart.substring(0, 2).toUpperCase();
};

export function Avatar({ email, size = 40 }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return (
            <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-sm">{getInitials(email)}</span>
                </div>
                <div className="absolute -inset-1 border-2 border-white/30 rounded-full animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="relative">
            <img
                src={getAvatarUrl(email, size)}
                alt={`Avatar for ${email}`}
                className="w-10 h-10 rounded-full shadow-lg border-2 border-white/80"
                onError={() => setImageError(true)}
            />
            <div className="absolute -inset-1 border-2 border-white/30 rounded-full animate-pulse"></div>
        </div>
    );
}
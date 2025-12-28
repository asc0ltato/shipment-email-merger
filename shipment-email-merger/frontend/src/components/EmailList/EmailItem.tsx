import { IEmail } from '@/types/email.types';
import { attachmentsApi } from '@/lib/api';
import { Avatar } from './Avatar';

interface EmailItemProps {
    email: IEmail;
    isExpanded: boolean;
    onToggle: (email: IEmail) => void;
    emailGroupId?: string;
    onEmailRead?: (emailId: string) => void;
}

const getEmailStatusColors = (status: IEmail['status']) => {
    switch (status) {
        case 'not_processed':
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-200',
                dot: 'bg-gray-500',
                leftBorder: 'border-l-gray-400'
            };
        case 'processing':
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-200',
                dot: 'bg-blue-500',
                leftBorder: 'border-l-blue-400'
            };
        case 'processed':
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-200',
                dot: 'bg-green-500',
                leftBorder: 'border-l-green-400'
            };
        case 'failed':
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                border: 'border-orange-200',
                dot: 'bg-orange-500',
                leftBorder: 'border-l-orange-400'
            };
        default:
            return {
                bg: 'bg-slate-100',
                text: 'text-slate-800',
                border: 'border-slate-200',
                dot: 'bg-slate-500',
                leftBorder: 'border-l-slate-400'
            };
    }
};

const downloadAttachmentFile = async (emailGroupId: string, filename: string) => {
    try {
        const blob = await attachmentsApi.downloadAttachment(emailGroupId, filename);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Error downloading attachment:', error);
        alert('Error downloading file');
    }
};

export function EmailItem({ email, isExpanded, onToggle, emailGroupId, onEmailRead }: EmailItemProps) {
    const statusColors = getEmailStatusColors(email.status);

    const handleEmailClick = (email: IEmail) => {
        onToggle(email);
    };

    const handleAttachmentDownload = (event: React.MouseEvent, filename: string) => {
        event.stopPropagation();
        if (emailGroupId) {
            downloadAttachmentFile(emailGroupId, filename);
        } else {
            console.error('No email group ID available for download');
            alert('Cannot download attachment: email group ID not available');
        }
    };

    const handleContentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    const handleTextSelect = (event: React.MouseEvent) => {
        if (event.target instanceof Element && event.target.closest('.email-content')) {
            event.stopPropagation();
        }
    };

    return (
        <div
            className={`border border-slate-200/60 rounded-xl cursor-pointer transition-all duration-300 bg-white/80 backdrop-blur-sm border-l-4 ${statusColors.leftBorder} ${
                isExpanded ? 'shadow-md' : 'hover:shadow-sm hover:bg-white/90'
            }`}
            onClick={() => handleEmailClick(email)}
        >
           <div className={`p-4 rounded-xl ${
                isExpanded ? `${statusColors.bg.replace('100', '50')}/50` : ''
            }`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`flex-shrink-0 w-2 h-2 ${statusColors.dot} rounded-full animate-pulse`}></span>
                        <h3 className="font-medium text-slate-800 text-sm truncate">
                            {email.subject || 'No Subject'}
                        </h3>
                    </div>
                    <div className="text-xs text-slate-500 text-right font-medium">
                        {new Date(email.date).toLocaleString('eu-RU', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div
                    className="p-4 border-t border-slate-200/60 email-content"
                    onClick={handleContentClick}
                    onMouseDown={handleTextSelect}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <Avatar email={email.from} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800 text-sm">{email.from}</p>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">To: {email.to}</p>
                        </div>
                    </div>

                    <div
                        className="mt-4 pt-4 border-t border-slate-200/60"
                        onClick={handleContentClick}
                    >
                        <div className="prose prose-sm prose-slate max-w-none">
                            {email.text ? (
                                <p
                                    className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap select-text"
                                    onClick={handleContentClick}
                                >
                                    {email.text}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">
                                    No email content available
                                </p>
                            )}
                        </div>
                    </div>

                    {email.attachments && email.attachments.length > 0 && emailGroupId && (
                        <div
                            className="mt-4 pt-4 border-t border-slate-200/60"
                            onClick={handleContentClick}
                        >
                            <div className="text-sm font-semibold text-slate-700 mb-3">Attachments</div>
                            <div className="flex flex-wrap gap-2">
                                {email.attachments.map((attachment, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => handleAttachmentDownload(e, attachment.filename)}
                                        className="flex items-center gap-2 text-xs bg-white border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-sm hover:bg-slate-50"
                                        title={`Download ${attachment.filename}`}
                                    >
                                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <span className="font-medium">
                                            {attachment.filename}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
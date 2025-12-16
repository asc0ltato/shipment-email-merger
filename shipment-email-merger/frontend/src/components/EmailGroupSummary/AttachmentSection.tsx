import { IEmailAttachment } from '@/types/email.types';
import { attachmentsApi } from '@/lib/api';

interface AttachmentSectionProps {
    attachments: IEmailAttachment[];
    emailGroupId: string;
}

const downloadAttachment = async (emailGroupId: string, filename: string) => {
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

export function AttachmentSection({ attachments, emailGroupId }: AttachmentSectionProps) {
    if (!attachments || attachments.length === 0) {
        return null;
    }

    const handleDownload = (filename: string) => {
        downloadAttachment(emailGroupId, filename);
    };

    const getFileIcon = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return (
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                );
            case 'doc':
            case 'docx':
                return (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                );
            case 'xls':
            case 'xlsx':
                return (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                );
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                Attachments ({attachments.length})
            </h4>
            <div className="space-y-1.5">
                {attachments.map((attachment, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded-md border border-slate-200 hover:border-slate-300 transition-colors group"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(attachment.filename)}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-800 truncate">
                                    {attachment.filename}
                                </p>
                                {attachment.size && (
                                    <p className="text-xs text-slate-500">
                                        {formatFileSize(attachment.size)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDownload(attachment.filename)}
                            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-800 text-white font-medium py-1 px-2 rounded-md transition-colors duration-200 text-xs opacity-0 group-hover:opacity-100"
                            title={`Download ${attachment.filename}`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
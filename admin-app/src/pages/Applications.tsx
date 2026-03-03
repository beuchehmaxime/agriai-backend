import { useState } from 'react';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useApplications, useUpdateApplicationStatus } from '../features/applications/hooks';

const Applications = () => {
    const { data: applications, isLoading } = useApplications();
    const updateStatusMutation = useUpdateApplicationStatus();
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    const exportPdf = async (url: string, id: string) => {
        setIsDownloading(id);
        try {
            const cleanUrl = url.replace(/\\/g, '/');
            const targetUrl = cleanUrl.startsWith('http') ? cleanUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/${cleanUrl}`;

            const response = await fetch(targetUrl);
            const blob = await response.blob();

            const pdfBlob = new Blob([blob], { type: 'application/pdf' });

            const blobUrl = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `Certificate_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed, falling back to direct tab', error);
            window.open(url, '_blank');
        } finally {
            setIsDownloading(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading applications...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expert Applications</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and approve applications from farmers to become Agronomists.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applications?.map((app) => (
                    <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{app.user?.name || 'Applicant'}</h3>
                                <p className="text-sm text-gray-500">{app.user?.phoneNumber}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${app.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                {app.status}
                            </span>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm space-y-2">
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500 font-medium">Institution:</span>
                                    <span className="col-span-2 text-gray-900 font-medium">{app.institution}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500 font-medium">Certificate:</span>
                                    <span className="col-span-2 text-gray-900 font-medium">{app.certificateType} ({app.obtainedYear})</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500 font-medium">Experience:</span>
                                    <span className="col-span-2 text-gray-600 font-medium">{app.experience}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-gray-500 font-medium">Qualifications:</span>
                                    <span className="col-span-2 text-gray-600 font-medium">{app.qualifications}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => exportPdf(app.certificateUrl, app.id)}
                                disabled={isDownloading === app.id}
                                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium bg-blue-50 p-3 rounded-xl border border-blue-100 w-fit transition-colors disabled:opacity-75 disabled:cursor-wait"
                            >
                                <ExternalLink size={16} />
                                {isDownloading === app.id ? 'Processing File...' : 'Download Certificate Document'}
                            </button>
                        </div>

                        {app.status === 'PENDING' && (
                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'REJECTED' })}
                                    disabled={updateStatusMutation.isPending}
                                    className="flex-1 px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    <XCircle size={18} className="stroke-[2.5]" /> Reject
                                </button>
                                <button
                                    onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'APPROVED' })}
                                    disabled={updateStatusMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-md shadow-green-500/20 transition-all font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle size={18} className="stroke-[2.5]" /> Approve
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {applications?.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                        No applications pending or processed.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Applications;

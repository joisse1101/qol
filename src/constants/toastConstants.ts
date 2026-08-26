import { toast } from 'sonner';

const UPLOAD_SUCCESS = 'Upload successful.';
const UPLOAD_FAILURE = 'Upload failed. Please try again.';
const DOWNLOAD_FAILED = 'Download failed. Please try again.';
const DOWNLOAD_STARTED = 'Downloading file...';

export function showUploadDownloadToast(type: 'upload' | 'download', isSuccess: boolean) {
    if (isSuccess) {
        if (type === 'upload') {
            toast.success(UPLOAD_SUCCESS);
        } else if (type === 'download') {
            toast.info(DOWNLOAD_STARTED);
        }
    } else {
        if (type === 'upload') {
            toast.error(UPLOAD_FAILURE);
        } else if (type === 'download') {
            toast.error(DOWNLOAD_FAILED);
        }
    }
}

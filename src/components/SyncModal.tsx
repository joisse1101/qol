import { Modal } from '@joisse1101/ui-library';
import React from 'react';

interface SyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleLoad: () => void;
    handleSave: () => void;
    syncStatus: 'local' | 'remote' | 'synced';
}

const UPLOAD_TEXT = 'Upload data to Gist';
const DOWNLOAD_TEXT = 'Download data from Gist';
const SYNCED_TEXT = 'Your data is already synced. Would you still like to download it from the remote Gist?';

export const SyncModal: React.FC<SyncModalProps> = ({
    isOpen,
    onClose,
    handleLoad,
    handleSave,
    syncStatus
}) => {
    const buttonText = syncStatus === 'local' ? { primary: UPLOAD_TEXT, secondary: DOWNLOAD_TEXT } : { primary: DOWNLOAD_TEXT, secondary: UPLOAD_TEXT };
    return (
        <Modal
            isOpen={isOpen}
            onSubmit={() => {
                if (syncStatus === 'local') { handleSave() } else { handleLoad() }
                onClose();
            }}
            onCancel={() => {
                if (syncStatus === 'local') { handleLoad() } else { handleSave() }
                onClose();
            }}
            onClose={onClose}
            title={'Sync Data'}
            modalType="confirmation"
            buttonText={buttonText}
        >
            <div className='form-container'>
                {syncStatus === 'synced' ? (
                    <p>{SYNCED_TEXT}</p>
                ) : (
                    <p>Your {syncStatus === 'local' ? 'local' : 'remote'} data is more recent. Would you like to {syncStatus === 'local' ? 'upload it to the remote Gist' : 'download it from the remote Gist'}?</p>
                )}
            </div>
        </Modal>
    );
};
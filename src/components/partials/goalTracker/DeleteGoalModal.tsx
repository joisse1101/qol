import { Modal } from '@joisse1101/ui-library';
import React from 'react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export const DeleteGoalModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onDelete
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onSubmit={onDelete}
            onClose={onClose}
            title={'Delete Goal'}
            modalType="destructive"
            buttonText={{ primary: 'Delete', secondary: 'Cancel' }}
        >
            <div className='form-container'>
                <p>Are you sure you want to delete this goal? This action cannot be undone.</p>
            </div>
        </Modal>
    );
};
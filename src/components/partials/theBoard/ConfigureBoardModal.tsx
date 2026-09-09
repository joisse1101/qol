import { Modal, DateInput } from "@joisse1101/ui-library";
import { useState } from "react";
import type { Board } from "../../../db/theLogsDb";
import { useBoards } from "@/hooks/useBoards";

interface ConfigureBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    board?: Board;
}
export const ConfigureBoardModal: React.FC<ConfigureBoardModalProps> = ({
    isOpen,
    onClose,
    board,
}) => {
    const [boardName, setBoardName] = useState<string>(board?.name ?? '');
    const [columns, setColumns] = useState<string[]>(board?.columns ?? []);
    const [startDate, setStartDate] = useState<string>(board?.startDate ?? '');
    const [endDate, setEndDate] = useState<string>(board?.endDate ?? '');
    const [errors, setErrors] = useState<string[]>([]);

    const { addBoard, updateBoard } = useBoards();

    const handleValidateAndSubmit = () => {
        const newErrors: string[] = [];
        if (!boardName) newErrors.push('Board name is required.');
        // if (!columns || columns.length === 0) newErrors.push('At least one column is required.');
        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }
        // Update the board state in the database
        if (board) {
            updateBoard(board.id, { name: boardName });
        } else {
            addBoard({ name: boardName });
        }
        onClose();
    };
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${board ? 'Configure' : 'Create'} Board`}
            onSubmit={handleValidateAndSubmit}

        >
            <div className='form-container'>
                <div className="form-group">
                    <label htmlFor="board-name">Board Name:</label>
                    <input type="text" id="board-name" name="board-name" placeholder="Board Name" value={boardName} onChange={(e) => setBoardName(e.target.value)} />
                </div>
                <div className='form-row'>
                    <DateInput label="Start Date:" id="start-date" name="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <DateInput label="End Date:" id="end-date" name="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                {errors.length > 0 &&
                    <div className='error-messages'>
                        {errors.map((error, index) => (
                            <div key={index} className="error-message">{error}</div>
                        ))}
                    </div>
                }
            </div>
        </Modal>
    )
}
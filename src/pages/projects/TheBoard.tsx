import { useBoardData, useBoards } from '@/hooks/useBoards';
import { useState, useEffect } from 'react';
import { Button, DateInput, InlineSelect } from '@joisse1101/ui-library';
import { ConfigureBoardModal } from '@/components/partials/theBoard/ConfigureBoardModal';
import { getDisplayDate } from '@/utils/dates';
import { Column } from '@/components/partials/theBoard/Column';

export default function TheBoard() {
    const { boards, removeBoard } = useBoards();
    const [userSelectedBoardId, setUserSelectedBoardId] = useState(boards?.[0]?.id ?? '');
    const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
    const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);

    const boardOptions = (boards?.map(b => ({ value: b.id, label: b.name })) ?? []);
    const selectedBoardId = userSelectedBoardId && boardOptions.some(b => b.value === userSelectedBoardId) ? userSelectedBoardId : boards?.[0]?.id || '';
    const { board, ticketsByColumn } = useBoardData(selectedBoardId);

    useEffect(() => {
        if (userSelectedBoardId === 'add') {
            setIsAddBoardModalOpen(true);
        }
    }, [userSelectedBoardId]);

    return (
        <div className="board-wrapper">
            {board && <>
                <div className="board-meta">
                    <div className="board-meta-name">
                        <h3>{board?.name}</h3>
                        <div>
                            <span className="date">{`${getDisplayDate(new Date(board.startDate))}${board.endDate ? ` - ${getDisplayDate(new Date(board.endDate))}` : ''}`}</span>
                            <Button
                                onClick={() => setIsConfigureModalOpen(true)}
                                variant="secondary"
                                icon={true}
                            >
                                🛠
                            </Button>
                            {boards.length > 1 && (
                                <Button
                                    onClick={() => removeBoard(board.id)}
                                    variant="danger"
                                    icon={true}
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="board-meta-select">

                        <InlineSelect
                            label="Project Board:"
                            options={[...boardOptions, { value: 'add', label: '+ Add New Board' }]}
                            value={selectedBoardId}
                            onChange={(value) => setUserSelectedBoardId(value)}
                        />
                    </div>
                </div>
                <div className="column-container">
                    {Object.entries(ticketsByColumn).map(([columnName, tickets]) => (
                        <Column
                            key={columnName}
                            boardId={board.id}
                            columnName={columnName}
                            tickets={tickets}
                        />
                    ))}
                </div>
            </>
            }
            <ConfigureBoardModal
                key={isAddBoardModalOpen ? 'add' : 'configure'}
                isOpen={isConfigureModalOpen || isAddBoardModalOpen}
                onClose={() => {
                    setIsConfigureModalOpen(false);
                    setIsAddBoardModalOpen(false);
                }}
                board={(isAddBoardModalOpen || !board) ? undefined : board}
            />
        </div   >
    );
}
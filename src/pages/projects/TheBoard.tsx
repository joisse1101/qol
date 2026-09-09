import { useBoardData, useBoards } from '@/hooks/useBoards';
import { useState } from 'react';
import { Button, InlineSelect } from '@joisse1101/ui-library';
import { ConfigureBoardModal } from '@/components/partials/theBoard/ConfigureBoardModal';

export default function TheBoard() {
    const { boards, removeBoard } = useBoards();
    const [userSelectedBoardId, setUserSelectedBoardId] = useState(boards?.[0]?.id ?? '');
    const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
    const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);

    const selectedBoardId = userSelectedBoardId || boards?.[0]?.id || '';
    const { board, ticketsByColumn, isLoading } = useBoardData(selectedBoardId);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    // Fallback UI when board is missing
    if (!board) {
        return (
            <div className="p-4 text-center">
                <h2>Board not found</h2>
                <p>This board doesn't exist yet.</p>
                <Button onClick={() => setIsAddBoardModalOpen(true)}>
                    Create Default Board
                </Button>
            </div>
        );
    }

    return (
        <>
            <div>
                <h1>{board.name}</h1>
                <InlineSelect
                    label="Project Board:"
                    options={boards?.map(b => ({ value: b.id, label: b.name })) ?? []}
                    value={selectedBoardId}
                    onChange={(value) => setUserSelectedBoardId(value)}
                />
                <Button onClick={() => setIsAddBoardModalOpen(true)}
                    variant="primary"
                    icon={true}>
                    ✚
                </Button>
                <Button
                    onClick={() => setIsConfigureModalOpen(true)}
                    variant="secondary"
                    icon={true}
                >
                    🛠
                </Button>
                <Button
                    onClick={() => removeBoard(board.id)}
                    variant="danger"
                    icon={true}
                >
                    ✕
                </Button>
                <div className="board-container">
                    {Object.entries(ticketsByColumn).map(([columnName, tickets]) => (
                        <div className="card" key={columnName}>
                            <h2>{columnName}</h2>
                            <ul>
                                {tickets.map((ticket) => (
                                    <li key={ticket.id}>{ticket.title}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <ConfigureBoardModal
                key={isAddBoardModalOpen ? 'add' : 'configure'}
                isOpen={isConfigureModalOpen || isAddBoardModalOpen}
                onClose={() => {
                    setIsConfigureModalOpen(false);
                    setIsAddBoardModalOpen(false);
                }}
                board={isAddBoardModalOpen ? undefined : board}
            />
        </>
    );
}
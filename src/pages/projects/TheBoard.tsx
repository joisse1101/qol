import { useBoardData, useBoards } from '@/hooks/useBoards';
import { Button } from '@joisse1101/ui-library';

export default function TheBoard() {
    const { boardIds, addDefaultBoard } = useBoards();
    const { board, ticketsByColumn, isLoading } = useBoardData(boardIds?.[0] ?? '');

    if (isLoading) {
        return <p>Loading...</p>;
    }

    // Fallback UI when board is missing
    if (!board) {
        return (
            <div className="p-4 text-center">
                <h2>Board not found</h2>
                <p>This board doesn't exist yet.</p>
                <Button onClick={async () => await addDefaultBoard('Project Board')}>
                    Create Default Board
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h1>{board.name}</h1>
            {Object.entries(ticketsByColumn).map(([columnName, tickets]) => (
                <div key={columnName}>
                    <h2>{columnName}</h2>
                    <ul>
                        {tickets.map((ticket) => (
                            <li key={ticket.id}>{ticket.title}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
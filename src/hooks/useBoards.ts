// hooks/useBoards.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { logDb, BoardSchema, type Ticket, type Board } from '@/db/theLogsDb';

export function useBoards() {
    const boardIds = useLiveQuery(async () => {
        const boards = await logDb.boards.toArray();
        return boards.map((b) => b.id);
    }, []);
    
    const addDefaultBoard = async (customName = 'My New Board') => {
        const count = await logDb.boards.count();

        const newBoard: Board = BoardSchema.parse({
            name: customName,
            columns: ['TODO', 'In Progress', 'Done'],
            position: count,
        });

        await logDb.boards.put(newBoard);
        return newBoard;
    };

    return {boardIds, addDefaultBoard};
}

export function useBoardData(boardId: string) {
    // 1. Live Query (Pure Read)
    const data = useLiveQuery(
        async () => {
            const board = await logDb.boards.get(boardId);
            if (!board) return null;

            const boardTickets = await logDb.boardTickets
                .where('boardId')
                .equals(boardId)
                .toArray();

            const tickets = await logDb.tickets.bulkGet(boardTickets.map((bt) => bt.ticketId));
            const validTickets = tickets.flatMap((t) => (t ? [t] : []));
            const ticketMap = Object.fromEntries(validTickets.map((t) => [t.id, t]));

            const ticketsByColumn: Record<string, Ticket[]> = Object.fromEntries(
                board.columns.map((col) => [col, []])
            );

            for (const bt of boardTickets) {
                const ticket = ticketMap[bt.ticketId];
                const col = bt.columnName ?? (ticket as any)?.column;
                if (ticket && ticketsByColumn[col]) {
                    ticketsByColumn[col].push(ticket);
                }
            }

            return { board, ticketsByColumn };
        },
        [boardId],
        undefined // undefined = loading, null = not found
    );

   

    return {
        board: data?.board ?? null,
        ticketsByColumn: data?.ticketsByColumn ?? {},
        isLoading: data === undefined,
    };
}
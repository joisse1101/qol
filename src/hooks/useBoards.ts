// hooks/useBoards.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { logDb, BoardSchema, type Ticket, type Board, type BoardState, TicketSchema, BoardTicketSchema } from '@/db/theLogsDb';

export function useColumns(boardId: string, columnId: string) {
    const tickets = useLiveQuery(
        async () => {
            const boardTickets = await logDb.boardTickets
                .where('boardId')
                .equals(boardId)
                .and(bt => bt.columnName === columnId)
                .toArray();

            const tickets = await logDb.tickets.bulkGet(boardTickets.map((bt) => bt.ticketId));
            return tickets.flatMap((t) => (t ? [t] : []));
        },
        [boardId, columnId],
        []
    );

    const addTicket = async () => {
        const ticketId = await logDb.tickets.add(TicketSchema.parse({ title: "New Ticket" }))
        const count = await logDb.boardTickets
            .where('boardId')
            .equals(boardId)
            .and(bt => bt.columnName === columnId)
            .count();
        await logDb.boardTickets.add(BoardTicketSchema.parse({
            boardId,
            columnName: columnId,
            ticketId,
            position: count + 1,
        }));
    };



    return { addTicket, tickets };
}

export function useBoards() {
    const boards = useLiveQuery(() => logDb.boards.orderBy('position').toArray());

    const addBoard = async (newBoard: Partial<BoardState>) => {
        let customName = newBoard.name ?? 'New Board';
        if (await logDb.boards.where('name').equals(customName).first() !== undefined) {
            customName += `-${crypto.randomUUID().slice(0, 4)}`;
        };
        const count = await logDb.boards.count();

        const boardToAdd: Board = BoardSchema.parse({
            name: customName,
            columns: newBoard.columns ?? ['TODO', 'In Progress', 'Done'],
            position: count,
        });

        await logDb.boards.add(boardToAdd);
        return boardToAdd;
    };

    const updateBoard = async (boardId: string, updates: Partial<BoardState>) => {
        const board = await logDb.boards.get(boardId);
        if (!board) return null;
        const updatedBoard = { ...board, ...updates };
        await logDb.boards.put(updatedBoard);
        return updatedBoard;
    };

    const removeBoard = async (boardId: string) => {
        await logDb.boardTickets.where('boardId').equals(boardId).delete();
        await logDb.boards.delete(boardId);

        const boardCount = await logDb.boards.count()

        if (boardCount === 0) {
            await addBoard({ name: 'Default Board' });
        }
    };

    return {
        boards: boards ?? [],
        isLoading: boards === undefined,
        addBoard,
        updateBoard,
        removeBoard,
    };
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
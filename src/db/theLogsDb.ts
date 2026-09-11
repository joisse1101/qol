import Dexie, { type Table } from 'dexie';
import { z } from 'zod';

export const LogEntrySchema = z.object({
    id: z.uuid().default(() => crypto.randomUUID()),
    content: z.string(),
    createdAt: z.iso.datetime().default(() => new Date().toISOString()),
    updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
    ticketId: z.optional(z.string()),
});

export const TicketSchema = z.object({
    id: z.uuid().default(() => crypto.randomUUID()),
    title: z.string(),
    createdAt: z.iso.datetime().default(() => new Date().toISOString()),
    updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const BoardTicketSchema = z.object({
    id: z.uuid().default(() => crypto.randomUUID()),
    boardId: z.string(),
    ticketId: z.string(),
    columnName: z.string(),
    position: z.number(),
    assignedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const BoardSchema = z.object({
    id: z.uuid().default(() => crypto.randomUUID()),
    name: z.string(),
    columns: z.array(z.string()).default(['TODO', 'In Progress', 'Done']),
    position: z.number().default(0),
    startDate: z.iso.datetime().default(() => new Date().toISOString()),
    endDate: z.optional(z.iso.datetime()),
    createdAt: z.iso.datetime().default(() => new Date().toISOString()),
    updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Board = z.infer<typeof BoardSchema>;
export type CreateBoard = z.input<typeof BoardSchema>;
export type BoardState = Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;

export type BoardTicket = z.infer<typeof BoardTicketSchema>;
export type CreateBoardTicket = z.input<typeof BoardTicketSchema>;

export type Ticket = z.infer<typeof TicketSchema>;
export type CreateTicket = z.input<typeof TicketSchema>;

export type LogEntry = z.infer<typeof LogEntrySchema>;
export type CreateLogEntry = z.input<typeof LogEntrySchema>;

export class LogDatabase extends Dexie {
    logEntries!: Table<LogEntry, string>;
    boards!: Table<Board, string>;
    boardTickets!: Table<BoardTicket, string>;
    tickets!: Table<Ticket, string>;

    constructor() {
        super('LogDatabase');
        this.version(1).stores({
            logEntries: 'id, createdAt, updatedAt, ticketId',
            boards: 'id, name, position, startDate, endDate, createdAt, updatedAt',
            boardTickets: 'id, boardId, ticketId, columnName, position, assignedAt',
            tickets: 'id, title, createdAt, updatedAt',
        });
    }
}

export const logDb = new LogDatabase();

const defaultBoard = BoardSchema.parse({
    id: crypto.randomUUID(),
    name: 'Default Board',
    columns: ['TODO', 'In Progress', 'Done'],
    position: 0,
});

logDb.on('ready', async () => {
    const count = await logDb.boards.count();
    if (count === 0) {
        await logDb.boards.add(defaultBoard);
    }
})
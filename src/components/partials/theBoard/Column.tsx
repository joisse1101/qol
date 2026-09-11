import { useColumns } from '@/hooks/useBoards';
import { Button } from '@joisse1101/ui-library';

interface ColumnProps {
    boardId: string;
    columnName: string;
    tickets: { id: string; title: string }[];
}
export const Column: React.FC<ColumnProps> = ({ boardId, columnName }) => {
    const {addTicket, tickets} = useColumns(boardId, columnName); 
    return (
        <div className="column" key={columnName}>
            <div className="header">
                <span>{columnName}</span>
                <Button
                    onClick={() => { addTicket(); }}
                    variant="primary"
                    icon={true}
                >
                    +
                </Button>
            </div>
            <ul>
                {tickets.map((ticket) => (
                    <li key={ticket.id}>{ticket.title}</li>
                ))}
            </ul>
        </div>
    );
};
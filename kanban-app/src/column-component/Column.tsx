import { FaPlus } from "react-icons/fa";
import "./Column.css"
import type { ColumnId, KanbanColumn } from "./KanbanColumn";
import type { RefObject } from "react";

interface ColumnProp{
    columnInfo: KanbanColumn
    headerColor: string
    createTaskDialogRef: RefObject<HTMLDialogElement | null>
    setActiveColumn: React.Dispatch<React.SetStateAction<ColumnId>>
}

function Column({columnInfo, headerColor, createTaskDialogRef, setActiveColumn} : ColumnProp){
    return(
        <div className="column-container">
            <div className="column-header" style={{"backgroundColor": headerColor}}>
                <p>{columnInfo.name}</p>
                <FaPlus className="create-new-task-icon" onClick={() => {
                    createTaskDialogRef.current?.showModal();
                    setActiveColumn(columnInfo.id);
                }}/>
            </div>
        </div>
    );
}

export default Column;
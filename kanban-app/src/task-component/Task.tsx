import type { KanbanTask } from "./KanbanTask";
import { IoCalendarClearOutline } from "react-icons/io5";

import "./Task.css"
interface TaskProps{
    task: KanbanTask
    // handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void
    // handleDrop: (event: React.DragEvent<HTMLDivElement>, columnId: ColumnId) => void
}

function formatDate(date: string){
    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });

    return formattedDate;
}

function Task({task} : TaskProps){
    return (
       <div className="task-container">
            <p>{task.title}</p>
            <div style={{"display": "flex", "alignItems": "center"}}>
                <IoCalendarClearOutline style={{"width":"15px", "height": "auto"}}/>
                <p style={{"margin": "0px", "marginLeft":"5px", "fontSize":"small"}}>{formatDate(task.end_date)}</p>
            </div>
        </div>
    );
}

export default Task;
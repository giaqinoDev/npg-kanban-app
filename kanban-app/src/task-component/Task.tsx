import type { KanbanTask } from "./KanbanTask";
import "./Task.css"
interface TaskProps{
    task: KanbanTask
    // handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void
    // handleDrop: (event: React.DragEvent<HTMLDivElement>, columnId: ColumnId) => void
}

function Task({task} : TaskProps){
    return (
       <div className="task-container">
            <p>{task.title}</p>
            <p>{task.content}</p>
        </div>
    );
}

export default Task;
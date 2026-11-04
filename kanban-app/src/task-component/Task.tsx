import type { KanbanTask } from "./KanbanTask";
import { IoCalendarClearOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";


import "./Task.css"
import type { RefObject } from "react";
interface TaskProps{
    task: KanbanTask
    setActiveTask: React.Dispatch<React.SetStateAction<KanbanTask|null>>
    viewTaskDialogRef: RefObject<HTMLDialogElement | null>
    updateTaskDialogRef: RefObject<HTMLDialogElement | null>
}

function formatDate(date: string){
    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return formattedDate;
}

function Task({task, setActiveTask, viewTaskDialogRef, updateTaskDialogRef} : TaskProps){
    return (
       <div className="task-container">
            <div style={{"display":"flex", "alignItems":"cener"}}>
                <p>{task.title}</p>
                <div className="priority-tag" style={{"backgroundColor" : task.priority == "low" ? "#ffed63" : task.priority == "high" ? "#ff6750" : "#c9c9c9"}}>
                    <p style={{"margin":"0px", "fontSize": "small"}}>{task.priority}</p>
                </div>
            </div>
            <div style={{"display": "flex", "alignItems": "center"}}>
                <IoCalendarClearOutline style={{"width":"15px", "height": "auto"}}/>
                <p style={{"margin": "0px", "marginLeft":"5px", "fontSize":"small"}}>{formatDate(task.end_date)}</p>
            </div>
            <div style={{"display": "flex", "alignItems":"center"}}>
                <div style={{"marginLeft":"auto"}}>
                    <FaEdit className="op-icon" onClick={() => {
                        setActiveTask(task);
                        updateTaskDialogRef.current?.showModal();
                    }}/>
                    <FaRegEye className="op-icon" onClick={() => {
                        setActiveTask(task);
                        viewTaskDialogRef.current?.showModal();
                    }}/>
                </div>
                
            </div>
        </div>
    );
}

export default Task;
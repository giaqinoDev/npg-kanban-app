import type { RefObject } from "react";
import type { TaskShape } from "../lib/types";
import LabelList from "../label-component/LabelList";
import { RxCross2 } from "react-icons/rx";
import { IoCalendarClearOutline } from "react-icons/io5";
import "./ViewTaskModal.css"
interface ViewTaskModalProps{
    ref: RefObject<HTMLDialogElement | null>;
    task: TaskShape | null
}

function formatDate(date: string | null | undefined){
    if(date == undefined){
        return "";
    }
    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return formattedDate;
}

function ViewTaskModal({ref, task}:ViewTaskModalProps){
    return(
        <dialog ref={ref} className="modal-container">
            <div className="modal-header">
                <h3>{task?.title}</h3> 
                <RxCross2 className="exit-modal-icon" onClick={() => ref.current?.close()}/>
            </div>
            <div>
                <div className="priority-view-tag" style={{"backgroundColor" : task?.priority == "low" ? "#ffed63" : task?.priority == "high" ? "#ff6750" : "#c9c9c9"}}>
                    <p style={{"margin":"0px", "fontSize": "small"}}>{task?.priority}</p>
                </div>
                <LabelList labels={task?.labels ?? []}/>
                <div style={{"display":"flex", "alignItems":"center"}}>
                    <IoCalendarClearOutline style={{"width":"20px", "height":"auto", "marginRight": "8px"}}/>
                    <p>{formatDate(task?.start_date) + " - " + formatDate(task?.end_date)}</p>
                </div>
                <p>Description:</p>
                <p>{task?.content}</p>
            </div>
        </dialog>
    );
}

export default ViewTaskModal;
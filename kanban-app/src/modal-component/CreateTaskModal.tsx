import type { RefObject } from "react";
import { RxCross2 } from "react-icons/rx";
import "./CreateTaskModal.css"
import { RiPencilAiFill } from "react-icons/ri";
import type { ColumnId } from "../column-component/KanbanColumn";

interface CreateTaskModalProp{
    ref: RefObject<HTMLDialogElement | null>;
    activeColumn: ColumnId;
    setActiveColumn: React.Dispatch<React.SetStateAction<ColumnId>>
}

function CreateTaskModal({ref, activeColumn, setActiveColumn}: CreateTaskModalProp){

    function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>){
        setActiveColumn(event.target.value as ColumnId);
    }
    return(
        <dialog ref={ref} className="modal-container">
            <div className="modal-header">
                <RiPencilAiFill style={{"marginRight": "10px", "width": "20px", "height":"auto"}}/>
                <h3>New Task</h3> 
                <RxCross2 className="exit-modal-icon" onClick={() => ref.current?.close()}/>
            </div>
            <div className="general-input-field">
                <p>Title*</p>
                <input type="text" required={true}></input>
            </div>
            <div className="general-input-field">
                <p>Category</p>
                <select value={activeColumn} onChange={handleCategoryChange}>
                    <option value="todo">To Do</option>
                    <option value="inProgress" selected>In Progress</option>
                    <option value="inReview">In Review</option>
                    <option value="done">Done</option>
                </select>

                <p style={{"marginLeft": "20px"}}>Priority</p>
                <select>
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <p>Description:</p>
            <textarea className="modal-input-field" rows={5} cols={40} placeholder="Type your task..."></textarea>
            <div className="button-container">
                <button className="create-task-button">Create Task</button>
            </div>
        </dialog>
    );
}

export default CreateTaskModal
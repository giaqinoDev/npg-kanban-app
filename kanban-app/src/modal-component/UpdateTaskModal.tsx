import { useEffect, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import { RxCross2 } from "react-icons/rx";
import "./CreateTaskModal.css"
import { KanbanTask, type PriorityId } from "../task-component/KanbanTask";
import type { ColumnId } from "../column-component/KanbanColumn";
import { FaEdit } from "react-icons/fa";

interface UpdateTaskModalProp{
    task: KanbanTask | null
    ref: RefObject<HTMLDialogElement | null>;
    replaceTask: (updatedTask: KanbanTask) => void;
    removeTask: (columnId : ColumnId, taskId : string) => void;
}

function UpdateTaskModal({ref, task, replaceTask, removeTask}: UpdateTaskModalProp){
    // function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>){
    //     setActiveColumn(event.target.value as ColumnId);
    // }
    const [titleVal, setTitleVal] = useState<string | undefined>(task?.title);
    const [categoryVal, setCategoryVal] = useState<ColumnId | undefined>(task?.category);
    const [startDateVal, setStartDateVal] = useState<string | undefined>(task?.start_date);
    const [endDateVal, setEndDateVal] = useState<string | undefined>(task?.end_date);
    const [descriptionVal, setDescriptionVal] = useState<string | undefined>(task?.content);
    const [priorityVal, setPriorityVal] = useState<PriorityId | undefined>(task?.priority);

    useEffect(() => {
        if (!task){
            return;
        }
        setTitleVal(task.title);
        setCategoryVal(task.category);
        setStartDateVal(task.start_date);
        setEndDateVal(task.end_date);
        setDescriptionVal(task.content);
        setPriorityVal(task.priority);

    }, [task]);
    function handleUpdateTask(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        if(!task){
            return;
        }
        const formData = new FormData(event.currentTarget);

        const newTask = new KanbanTask(
            task.id,
            formData.get("title") as string,
            formData.get("category") as ColumnId,
            formData.get("start date") as string,
            formData.get("end date") as string,
            formData.get("description") as string,
            formData.get("priority") as PriorityId,
            task.position
        );

        replaceTask(newTask);
        ref.current?.close();
    }
    return(
        <dialog ref={ref} className="modal-container">
            <div className="modal-header">
                <FaEdit style={{"marginRight": "10px", "width": "20px", "height":"auto"}}/>
                <h3>{task?.title}</h3> 
                <RxCross2 className="exit-modal-icon" onClick={() => ref.current?.close()}/>
            </div>
            <form onSubmit={handleUpdateTask}>
                <div className="general-input-field">
                    <p>Title*</p>
                    <input onChange={(event: ChangeEvent<HTMLInputElement>) => setTitleVal(event.target.value)}value={titleVal} type="text" required={true} maxLength={100} name="title"></input>
                </div>
                <div className="general-input-field">
                    <p>Category</p>
                    <select onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategoryVal(event.target.value as ColumnId)} value={categoryVal} name="category">
                        <option value="todo">To Do</option>
                        <option value="inProgress" selected>In Progress</option>
                        <option value="inReview">In Review</option>
                        <option value="done">Done</option>
                    </select>

                    <p style={{"marginLeft": "20px"}}>Priority</p>
                    <select onChange={(event: ChangeEvent<HTMLSelectElement>) => setPriorityVal(event.target.value as PriorityId)} value={priorityVal} name="priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="general-input-field">
                    <p>Start Date</p>
                    <input onChange={(event: ChangeEvent<HTMLInputElement>) => setStartDateVal(event.target.value)} value={startDateVal} name="start date" type="date" required></input>

                    <p style={{"marginLeft": "20px"}}>End Date</p>
                    <input onChange={(event: ChangeEvent<HTMLInputElement>) => setEndDateVal(event.target.value)} value={endDateVal} name="end date" type="date" required></input>
                </div>
                <p>Description:</p>
                <textarea onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescriptionVal(event.target.value)} value={descriptionVal} name="description" className="modal-input-field" rows={5} cols={40} placeholder="Type your task..."></textarea>
                <div className="button-container">
                    <button type="button" className="delete-task-button" onClick={() => {
                        if(task){
                            removeTask(task.category, task.id)
                        }
                        ref.current?.close();
                    }}>Delete</button>
                    <button type="submit" className="create-task-button">Update</button>
                </div>
            </form>
        </dialog>
    );
}

export default UpdateTaskModal;
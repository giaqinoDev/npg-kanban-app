import { useEffect, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import { RxCross2 } from "react-icons/rx";
import "./CreateTaskModal.css"
import { FaEdit } from "react-icons/fa";
import type { Category, Priority, TaskShape } from "../lib/types";

interface UpdateTaskModalProp{
    task: TaskShape | null;
    ref: RefObject<HTMLDialogElement | null>;
    replaceTask: (updatedTask: TaskShape) => Promise<boolean>;
    removeTask: (columnId: Category, taskId: string) => Promise<boolean>;
}

function UpdateTaskModal({ref, task, replaceTask, removeTask}: UpdateTaskModalProp){
    const [titleVal, setTitleVal] = useState<string | undefined>(task?.title);
    const [categoryVal, setCategoryVal] = useState<Category | undefined>(task?.category);
    const [startDateVal, setStartDateVal] = useState<string | undefined | null>(task?.start_date);
    const [endDateVal, setEndDateVal] = useState<string | undefined | null>(task?.end_date);
    const [descriptionVal, setDescriptionVal] = useState<string | undefined>(task?.content);
    const [priorityVal, setPriorityVal] = useState<Priority | undefined>(task?.priority);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    useEffect(() => {
        if (!task){
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitleVal(task.title);
        setCategoryVal(task.category);
        setStartDateVal(task.start_date);
        setEndDateVal(task.end_date);
        setDescriptionVal(task.content);
        setPriorityVal(task.priority);
        setFormError(null);
    }, [task]);

    async function handleUpdateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!task) return;

        const title = titleVal?.trim();
        const startDate = startDateVal || null;
        const endDate = endDateVal || null;

        if (!title) {
            setFormError("Title can't be blank");
            return;
        }
        if (startDate && endDate && endDate < startDate) {
            setFormError("End date must be on or after the start date");
            return;
        }

        // Copy the original task and override only the edited fields.
        // id, created_by, position, labels and timestamps carry over unchanged.
        const updatedTask: TaskShape = {
            ...task,
            title,
            category: categoryVal as Category,
            priority: priorityVal as Priority,
            start_date: startDate,
            end_date: endDate,
            content: descriptionVal as string,
        };

        setFormError(null);
        setSubmitting(true);
        const saved = await replaceTask(updatedTask);
        setSubmitting(false);

        if(saved){
            ref.current?.close();
        }
    }

    // function handleDelete() {
    //     if(!task){
    //         return;
    //     }
    //     removeTask(task.category, task.id);
    //     ref.current?.close();
    // }

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
                    <select onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategoryVal(event.target.value as Category)} value={categoryVal} name="category">
                        <option value="todo">To Do</option>
                        <option value="inProgress" selected>In Progress</option>
                        <option value="inReview">In Review</option>
                        <option value="done">Done</option>
                    </select>

                    <p style={{"marginLeft": "20px"}}>Priority</p>
                    <select onChange={(event: ChangeEvent<HTMLSelectElement>) => setPriorityVal(event.target.value as Priority)} value={priorityVal} name="priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="general-input-field">
                    <p>Start Date</p>
                    <input onChange={(event: ChangeEvent<HTMLInputElement>) => setStartDateVal(event.target.value)} value={startDateVal as string} name="start date" type="date" required></input>

                    <p style={{"marginLeft": "20px"}}>End Date</p>
                    <input onChange={(event: ChangeEvent<HTMLInputElement>) => setEndDateVal(event.target.value)} value={endDateVal as string} name="end date" type="date" required></input>
                </div>
                <p>Description:</p>
                <textarea onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescriptionVal(event.target.value)} value={descriptionVal} name="description" className="modal-input-field" rows={5} cols={40} placeholder="Type your task..."></textarea>
                {formError && <p className="form-error">{formError}</p>}
                <div className="button-container">
                    <button type="button" className="delete-task-button" onClick={() => {
                        if(task){
                            removeTask(task.category, task.id)
                        }
                        ref.current?.close();
                    }}>Delete</button>
                    <button type="submit" className="create-task-button" disabled={submitting}>
                        {submitting ? "Saving…" : "Update"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}

export default UpdateTaskModal;
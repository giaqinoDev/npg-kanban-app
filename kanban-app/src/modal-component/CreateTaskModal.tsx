import { useState, type FormEvent, type RefObject } from "react";
import { RxCross2 } from "react-icons/rx";
import "./CreateTaskModal.css"
import { RiPencilAiFill } from "react-icons/ri";
import type { Category, Label, NewTask, Priority } from "../lib/types";
import LabelPicker from "../label-component/LabelPicker";

interface CreateTaskModalProp{
    ref: RefObject<HTMLDialogElement | null>;
    activeColumn: Category;
    setActiveColumn: React.Dispatch<React.SetStateAction<Category>>
    addNewTask: (input: NewTask, labelIds: string[]) => Promise<boolean>;
    labels: Label[];
    labelCreationDialogRef: RefObject<HTMLDialogElement | null>;
}

function CreateTaskModal({ref, activeColumn, setActiveColumn, addNewTask, labels, labelCreationDialogRef}: CreateTaskModalProp){
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
        
    function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>){
        setActiveColumn(event.target.value as Category);
    }

    async function handleCreateNewTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget; // keep a reference: currentTarget is null after an await
        const formData = new FormData(form);

        const title = (formData.get("title") as string).trim();
        // An empty date input gives "", but the database wants null for "no date"
        const startDate = (formData.get("start date") as string) || null;
        const endDate = (formData.get("end date") as string) || null;

        if (!title) {
            setFormError("Title can't be blank");
            return;
        }
        if (startDate && endDate && endDate < startDate) {
            setFormError("End date must be on or after the start date");
            return;
        }

        const newTask: NewTask = {
            title,
            category: formData.get("category") as Category,
            priority: formData.get("priority") as Priority,
            start_date: startDate,
            end_date: endDate,
            content: (formData.get("description") as string) ?? "",
        };

        setFormError(null);
        setSubmitting(true);
        // A selected label may have been deleted since it was picked
        const saved = await addNewTask(newTask, selectedLabelIds.filter((id) => labels.some((label) => label.id === id)));
        setSubmitting(false);

        if (saved) {
            form.reset();
            setSelectedLabelIds([]);
            ref.current?.close();
        }
    }

    return(
        <dialog ref={ref} className="modal-container">
            <div className="modal-header">
                <RiPencilAiFill style={{"marginRight": "10px", "width": "20px", "height":"auto"}}/>
                <h3>New Task</h3> 
                <RxCross2 className="exit-modal-icon" onClick={() => ref.current?.close()}/>
            </div>
            <form onSubmit={handleCreateNewTask}>
                <div className="general-input-field">
                    <p>Title*</p>
                    <input type="text" required={true} maxLength={100} name="title"></input>
                </div>
                <div className="general-input-field">
                    <p>Category</p>
                    <select value={activeColumn} onChange={handleCategoryChange} name="category">
                        <option value="todo">To Do</option>
                        <option value="inProgress" selected>In Progress</option>
                        <option value="inReview">In Review</option>
                        <option value="done">Done</option>
                    </select>

                    <p style={{"marginLeft": "20px"}}>Priority</p>
                    <select name="priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="general-input-field">
                    <p>Start Date</p>
                    <input name="start date" type="date" required></input>

                    <p style={{"marginLeft": "20px"}}>End Date</p>
                    <input name="end date" type="date" required></input>
                </div>
                <LabelPicker
                    labels={labels}
                    selectedIds={selectedLabelIds}
                    setSelectedIds={setSelectedLabelIds}
                    labelCreationDialogRef={labelCreationDialogRef}
                />
                <p>Description:</p>
                <textarea name="description" className="modal-input-field" rows={5} cols={40} placeholder="Type your task..."></textarea>
                {formError && <p className="form-error">{formError}</p>}
                <div className="button-container">
                    <button className="create-task-button" disabled={submitting}>
                        {submitting ? "Creating…" : "Create Task"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}

export default CreateTaskModal
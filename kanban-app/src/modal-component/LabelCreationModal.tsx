import { useState, type FormEvent, type RefObject } from "react";
import { IoMdPricetag } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import "./CreateTaskModal.css"
import "../label-component/Label.css"
import { LabelColorHex, LabelColors, type Label, type LabelColor } from "../lib/types";

interface LabelCreationModalProps{
    ref: RefObject<HTMLDialogElement | null>;
    labels: Label[];
    addNewLabel: (name: string, color: LabelColor) => Promise<void>;
    removeLabel: (labelId: string) => Promise<void>;
}

function LabelCreationModal({ref, labels, addNewLabel, removeLabel}:LabelCreationModalProps){
    const [activeColor, setActiveColor] = useState<LabelColor>("red");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    async function handleCreateLabel(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget; // keep a reference: currentTarget is null after an await
        const title = (new FormData(form).get("title") as string).trim();

        if (!title) {
            setFormError("Title can't be blank");
            return;
        }

        setFormError(null);
        setSubmitting(true);
        try {
            await addNewLabel(title, activeColor);
            form.reset();
            setActiveColor("red");
            ref.current?.close();
        }
        catch (error) {
            setFormError((error as { message?: string })?.message ?? "Failed to create label");
        }
        finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteLabel(label: Label) {
        if (!window.confirm(`Delete "${label.name}"? It will be removed from every task using it.`)) {
            return;
        }

        setFormError(null);
        setDeletingId(label.id);
        try {
            await removeLabel(label.id);
        }
        catch (error) {
            setFormError((error as { message?: string })?.message ?? "Failed to delete label");
        }
        finally {
            setDeletingId(null);
        }
    }

    return(
        <dialog ref={ref} className="modal-container" onClose={() => setFormError(null)}>
            <div className="modal-header">
                <IoMdPricetag style={{"marginRight": "10px", "width": "20px", "height":"auto"}}/>
                <h3>Create Label</h3>
                <RxCross2 className="exit-modal-icon" onClick={() => ref.current?.close()}/>
            </div>
            <form onSubmit={handleCreateLabel}>
                <div className="general-input-field">
                    <p>Title*</p>
                    <input type="text" required={true} maxLength={25} name="title"></input>
                </div>
                <div style={{"display":"flex", "alignItems":"center"}}>
                    <div style={{"marginRight":"10px"}}>Color</div>
                    <div style={{ "display": "flex", "flexWrap": "wrap"}}>
                        {LabelColors.map((color) => (
                            <button
                            key={color}
                            type="button"
                            aria-label={color}
                            aria-pressed={color === activeColor}
                            onClick={() => setActiveColor(color)}
                            style={{
                                width: 23,
                                height: 23,
                                margin: 3,
                                borderRadius: "50%",
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: LabelColorHex[color],
                                boxShadow: color === activeColor ? `0 0 0 2px #fff, 0 0 0 4px ${LabelColorHex[color]}` : "none",
                            }}
                            />
                        ))}
                    </div>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="button-container">
                    <button className="create-task-button" disabled={submitting}>
                        {submitting ? "Creating…" : "Create Label"}
                    </button>
                </div>
            </form>
            {labels.length > 0 && (
                <div>
                    <p>Your labels</p>
                    <div className="label-list">
                        {labels.map((label) => (
                            <span key={label.id} className="label-chip" style={{"backgroundColor": `${LabelColorHex[label.color]}22`}}>
                                {/*<span className="label-dot" style={{"backgroundColor": LabelColorHex[label.color]}}/>*/}
                                {label.name}
                                <button
                                type="button"
                                className="label-delete-button"
                                aria-label={`Delete label ${label.name}`}
                                disabled={deletingId !== null}
                                onClick={() => handleDeleteLabel(label)}
                                >
                                    <RxCross2/>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </dialog>
    );
}

export default LabelCreationModal;

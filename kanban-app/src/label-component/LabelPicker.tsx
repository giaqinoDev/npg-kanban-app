import type { RefObject } from "react";
import { FaPlus } from "react-icons/fa";
import { LabelColorHex, type Label } from "../lib/types";
import "./Label.css"

interface LabelPickerProps{
    labels: Label[];
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    labelCreationDialogRef: RefObject<HTMLDialogElement | null>;
}

function LabelPicker({labels, selectedIds, setSelectedIds, labelCreationDialogRef}: LabelPickerProps){
    function toggleLabel(id: string){
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]);
    }

    return(
        <div>
            <p>Labels</p>
            <div className="label-list">
                {labels.map((label) => {
                    const selected = selectedIds.includes(label.id);
                    return(
                        <button
                        key={label.id}
                        type="button"
                        className="label-chip label-option"
                        aria-pressed={selected}
                        onClick={() => toggleLabel(label.id)}
                        style={selected ? {"backgroundColor": `${LabelColorHex[label.color]}22`, "borderColor": LabelColorHex[label.color]} : undefined}
                        >
                            <span className="label-dot" style={{"backgroundColor": LabelColorHex[label.color]}}/>
                            {label.name}
                        </button>
                    );
                })}
                <button type="button" className="label-chip label-option" onClick={() => labelCreationDialogRef.current?.showModal()}>
                    <FaPlus style={{"width":"10px", "height":"auto"}}/>
                    New label
                </button>
            </div>
        </div>
    );
}

export default LabelPicker;

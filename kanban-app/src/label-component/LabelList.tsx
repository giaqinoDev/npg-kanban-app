import { LabelColorHex, type Label } from "../lib/types";
import "./Label.css"

interface LabelListProps{
    labels: Label[];
}

function LabelList({labels}: LabelListProps){
    if(labels.length === 0){
        return null;
    }
    return(
        <div className="label-list">
            {labels.map((label) => (
                <span key={label.id} className="label-chip" style={{"backgroundColor": `${LabelColorHex[label.color]}22`}}>
                    {/*<span className="label-dot" style={{"backgroundColor": LabelColorHex[label.color]}}/>*/}
                    {label.name}
                </span>
            ))}
        </div>
    );
}

export default LabelList;

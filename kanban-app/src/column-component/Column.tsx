import { FaPlus } from "react-icons/fa";
import "./Column.css"
import type { ColumnId, KanbanColumn } from "./KanbanColumn";
import type { RefObject } from "react";
import type { KanbanTask } from "../task-component/KanbanTask";
import Task from "../task-component/Task";
import { Draggable, Droppable, type DraggableProvided, type DroppableProvided } from "@hello-pangea/dnd";

interface ColumnProp{
    columnInfo: KanbanColumn
    headerColor: string
    createTaskDialogRef: RefObject<HTMLDialogElement | null>
    setActiveColumn: React.Dispatch<React.SetStateAction<ColumnId>>
}

function Column({columnInfo, headerColor, createTaskDialogRef, setActiveColumn} : ColumnProp){
    return(
        <div className="column-container">
            <div className="column-header" style={{"backgroundColor": headerColor}}>
                <p>{columnInfo.name}</p>
                <div style={{"marginLeft":"auto", "display":"flex"}}>
                    <p style={{"marginRight":"10px"}}>{columnInfo.items.length}</p>
                    <FaPlus className="create-new-task-icon" onClick={() => {
                        createTaskDialogRef.current?.showModal();
                        setActiveColumn(columnInfo.id);
                    }}/>
                </div>
            </div>
            <Droppable droppableId={columnInfo.id}>
                {(provided: DroppableProvided) => {
                    return (<div 
                        className="category-tasks"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {
                            columnInfo.items.map((task:KanbanTask, index:number) => 
                                <Draggable
                                    key={task.id}
                                    draggableId={task.id}
                                    index={index}
                                >
                                    {(provided: DraggableProvided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <Task task={task}/>
                                        </div>
                                    )}
                                    
                                </Draggable>
                            )
                        }
                        {provided.placeholder}
                    </div>);
                }}
            </Droppable>
        </div>
    );
}

export default Column;
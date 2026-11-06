import { FaPlus } from "react-icons/fa";
import "./Column.css"
import type { RefObject } from "react";
import { Draggable, Droppable, type DraggableProvided, type DroppableProvided } from "@hello-pangea/dnd";
import type { Category, TaskShape } from "../lib/types";
import type { KanbanColumn } from "./KanbanColumn";
import Task from "../task-component/Task";

interface ColumnProp{
    columnInfo: KanbanColumn,
    headerColor: string
    createTaskDialogRef: RefObject<HTMLDialogElement | null>
    viewTaskDialogRef: RefObject<HTMLDialogElement | null>
    updateTaskDialogRef: RefObject<HTMLDialogElement | null>
    setActiveColumn: React.Dispatch<React.SetStateAction<Category>>
    setActiveTask: React.Dispatch<React.SetStateAction<TaskShape|null>>
}

function Column({columnInfo, headerColor, createTaskDialogRef, viewTaskDialogRef, updateTaskDialogRef, setActiveColumn, setActiveTask} : ColumnProp){
    return(
        <div className="column-container">
            <div className="column-header" style={{"backgroundColor": headerColor}}>
                <p style={{ fontWeight: "bold" }}>{}</p>
                <div style={{"marginLeft":"auto", "display":"flex"}}>
                    <p style={{"marginRight":"10px"}}>{columnInfo?.tasks?.length}</p>
                    <FaPlus className="create-new-task-icon" onClick={() => {
                        createTaskDialogRef.current?.showModal();
                        setActiveColumn(columnInfo.category);
                    }}/>
                </div>
            </div>
            <Droppable droppableId={columnInfo.category}>
                {(provided: DroppableProvided) => {
                    return (<div 
                        className="category-tasks"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {
                            columnInfo?.tasks?.map((task:TaskShape, index:number) => 
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
                                            <Task task={task} setActiveTask={setActiveTask} viewTaskDialogRef={viewTaskDialogRef} updateTaskDialogRef={updateTaskDialogRef}/>
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
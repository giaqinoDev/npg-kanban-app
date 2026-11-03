import { useRef, useState } from "react"
import { KanbanColumn, type ColumnId } from "./column-component/KanbanColumn";
import { KanbanTask } from "./task-component/KanbanTask";
import Column from "./column-component/Column";
import "./App.css";
import CreateTaskModal from "./modal-component/CreateTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

function App() {

  const [columns, setColumns] = useState({
    "todo": new KanbanColumn(
      "To Do", 
      "todo", 
      [new KanbanTask("1", "Task 1", "todo", "low", "Item 1"), 
      new KanbanTask("2", "Task 2", "todo", "low", "Item 2")]),
    "inProgress": new KanbanColumn(
      "In Progress", 
      "inProgress", 
      [new KanbanTask("3", "Task 3", "inProgress", "medium", "Item 3"), 
        new KanbanTask("4", "Task 4", "inProgress", "medium", "Item 4")]),
    "inReview": new KanbanColumn(
      "In Review", 
      "inReview", 
      [new KanbanTask("5", "Task 5", "inReview", "low", "Item 5"), 
        new KanbanTask("6", "Task 6", "inReview", "high", "Item 6")]),
    "done": new KanbanColumn(
      "Done", 
      "done", 
      [new KanbanTask("7", "Task 7", "done", "high", "Item 7"), 
        new KanbanTask("8", "Task 8", "done", "high", "Item 8")])
  });
  type DraggedItem = {
    columnId: keyof typeof columns,
    task: KanbanTask
  }
  //const [newTask, setNewTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnId>("todo");
  //const [draggedTask, setDraggedTask] = useState<DraggedItem | null>(null);
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);
  function handleDragEnd(result: DropResult){
    const{source, destination} = result;

    if(!destination){
      return;
    }
    if(source.droppableId == destination.droppableId && source.index == destination.index){
      return;
    }

    setColumns(prev => {
      const sourceId = source.droppableId as keyof typeof prev;
      const destinationId = destination.droppableId as keyof typeof prev;

      //Create copy of original columns task array
      const sourceItems = [...prev[sourceId].items];
      //remove specific task from task array and return in new array
      const [movedTask] = sourceItems.splice(source.index, 1);

      //Re ordering in the same column
      if(sourceId == destinationId){
        //Insert moved task into new position (i.e destination.index)
        sourceItems.splice(destination.index, 0, movedTask);
        //return updated state
        return {
          ...prev,
          [sourceId]:{
            ...prev[sourceId],
            items: sourceItems
          }
        }
      }
      //Moving tasks between columns
      const destinationItems = [...prev[destinationId].items]
      //Update the tasks category to reflect its new column
      const updatedTask = new KanbanTask(
        movedTask.id,
        movedTask.title,
        destinationId,
        movedTask.priority,
        movedTask.content
      );
      destinationItems.splice(destination.index, 0, updatedTask);

      return{
        ...prev,
        [sourceId]:{
          ...prev[sourceId],
          items: sourceItems
        },
        [destinationId]:{
          ...prev[destinationId],
          items: destinationItems
        }
      }
    })
  }

  function addNewTask(newTask: KanbanTask | null){
    if(!newTask || newTask.content.trim() == ""){
      return;
    }

    const updatedColumns = {...columns};
    updatedColumns[newTask.category].items.push(
      new KanbanTask(Date.now.toString(), newTask.title, newTask.category, newTask.priority, newTask.content)
    );
    console.log("added new task")
    setColumns(updatedColumns);
    //setNewTask(null);
  }

  function removeTask(columnId : keyof typeof columns, taskId : keyof typeof columns){
    const updatedColumns = {...columns};

    //Filter out task from column
    updatedColumns[columnId].items = updatedColumns[columnId].items.filter((task:KanbanTask) => task.id !== taskId);

    setColumns(updatedColumns);
  }

  return (
      <div id="app-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-columns">
            <Column columnInfo={columns["todo"]} headerColor="rgb(252, 70, 70)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
            <Column columnInfo={columns["inProgress"]} headerColor="rgb(70, 106, 252)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
            <Column columnInfo={columns["inReview"]} headerColor="rgb(252, 194, 70)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
            <Column columnInfo={columns["done"]} headerColor="rgb(69, 255, 134)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
          </div>
        </DragDropContext>

        <CreateTaskModal 
          ref={createTaskDialogRef} 
          activeColumn={activeColumn} 
          setActiveColumn={setActiveColumn}
          addNewTask={addNewTask}
          />
      </div>
  )
}

export default App

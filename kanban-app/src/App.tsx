import { useRef, useState } from "react"
import { KanbanColumn, type ColumnId } from "./column-component/KanbanColumn";
import { KanbanTask } from "./task-component/KanbanTask";
import Column from "./column-component/Column";
import "./App.css";
import CreateTaskModal from "./modal-component/CreateTaskModal";

function App() {

  const [columns, setColumns] = useState({
    "todo": new KanbanColumn("To Do", "todo", [new KanbanTask("1", "Item 1"), new KanbanTask("2", "Item 2")]),
    "inProgress": new KanbanColumn("In Progress", "inProgress", [new KanbanTask("3", "Item 3"), new KanbanTask("4", "Item 4")]),
    "inReview": new KanbanColumn("In Review", "inReview", [new KanbanTask("5", "Item 5"), new KanbanTask("6", "Item 6")]),
    "done": new KanbanColumn("Done", "done", [new KanbanTask("7", "Item 7"), new KanbanTask("8", "Item 8")])
  });
  type DraggedItem = {
    columnId: keyof typeof columns,
    task: KanbanTask
  }
  const [newTask, setNewTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnId>("todo");
  const [draggedTask, setDraggedTask] = useState<DraggedItem | null>(null);
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);

  function addNewTask(){
    if(!newTask || newTask.content.trim() == ""){
      return;
    }

    const updatedColumns = {...columns};
    updatedColumns[activeColumn].items.push(
      new KanbanTask(Date.now.toString(), newTask.content)
    );

    setColumns(updatedColumns);
    setNewTask(null);
  }

  function removeTask(columnId : keyof typeof columns, taskId : keyof typeof columns){
    const updatedColumns = {...columns};

    //Filter out task from column
    updatedColumns[columnId].items = updatedColumns[columnId].items.filter((task:KanbanTask) => task.id !== taskId);

    setColumns(updatedColumns);
  }

  function handleDragStart(columnId: keyof typeof columns, task:KanbanTask){
    setDraggedTask({columnId, task});
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>){
    event.preventDefault();

    //handle dragging myself
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, columnId: keyof typeof columns){
    event.preventDefault();

    if(!draggedTask){
      return;
    }

    if(draggedTask.columnId == columnId){
      //Dragged and droped into the same column
      return;
    }

    const updatedColumns = {...columns};
    //Remove dragged task from old column
    updatedColumns[draggedTask.columnId].items = updatedColumns[draggedTask.columnId].items.filter((task:KanbanTask) => task.id != draggedTask.task.id);
    //Ad dragged task to new column
    updatedColumns[columnId].items.push(draggedTask.task);
    setColumns(updatedColumns);
    setDraggedTask(null);
  }
  return (
    <div id="app-container">
      <div className="kanban-columns">
        <Column columnInfo={columns["todo"]} headerColor="rgb(252, 70, 70)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
        <Column columnInfo={columns["inProgress"]} headerColor="rgb(70, 106, 252)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
        <Column columnInfo={columns["inReview"]} headerColor="rgb(252, 194, 70)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
        <Column columnInfo={columns["done"]} headerColor="rgb(69, 255, 134)" createTaskDialogRef={createTaskDialogRef} setActiveColumn={setActiveColumn}/>
      </div>

      <CreateTaskModal ref={createTaskDialogRef} activeColumn={activeColumn} setActiveColumn={setActiveColumn}/>
    </div>
  )
}

export default App

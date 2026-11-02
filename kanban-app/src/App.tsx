import { useState } from "react"
import { KanbanColumn } from "./column-component/KanbanColumn";
import { KanbanTask } from "./task-component/KanbanTask";

function App() {

  const [columns, setColumns] = useState({
    "todo": new KanbanColumn("To Do", [new KanbanTask("1", "Item 1"), new KanbanTask("2", "Item 2")]),
    "inProgress": new KanbanColumn("In Progress", [new KanbanTask("3", "Item 3"), new KanbanTask("4", "Item 4")]),
    "inReview": new KanbanColumn("In Review", [new KanbanTask("5", "Item 5"), new KanbanTask("6", "Item 6")]),
    "done": new KanbanColumn("Done", [new KanbanTask("7", "Item 7"), new KanbanTask("8", "Item 8")])
  });
  type DraggedItem = {
    columnId: keyof typeof columns,
    task: KanbanTask
  }
  const [newTask, setNewTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<keyof typeof columns>("todo");
  const [draggedTask, setDraggedTask] = useState<DraggedItem | null>(null);

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
    <>
      <div>hello</div>
    </>
  )
}

export default App

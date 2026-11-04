import { useRef, useState } from "react"
import { KanbanColumn, type ColumnId } from "./column-component/KanbanColumn";
import { KanbanTask } from "./task-component/KanbanTask";
import Column from "./column-component/Column";
import "./App.css";
import CreateTaskModal from "./modal-component/CreateTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import ViewTaskModal from "./modal-component/ViewTaskModal";

//Return copies of the tasks with their position (and category) matching their index in the column
function reindexTasks(tasks: KanbanTask[], category: ColumnId): KanbanTask[]{
  return tasks.map((task, index) => 
    task.position === index && task.category === category
      ? task
      : new KanbanTask(task.id, task.title, category, task.start_date, task.end_date, task.content, task.priority, index)
  );
}

function App() {

  const [columns, setColumns] = useState({
    "todo": new KanbanColumn(
      "To Do", 
      "todo", 
      [new KanbanTask("1", "Task 1", "todo", "2026-11-01", "2026-11-01", "Item 1", "low", 0), 
      new KanbanTask("2", "Task 2", "todo", "2026-11-01", "2026-11-01", "Item 2", "low", 1)]),
    "inProgress": new KanbanColumn(
      "In Progress", 
      "inProgress", 
      [new KanbanTask("3", "Task 3", "inProgress", "2026-11-01", "2026-11-01", "Item 3", "medium", 0), 
        new KanbanTask("4", "Task 4", "inProgress", "2026-11-01", "2026-11-01", "Item 4", "medium", 1)]),
    "inReview": new KanbanColumn(
      "In Review", 
      "inReview", 
      [new KanbanTask("5", "Task 5", "inReview", "2026-11-01", "2026-11-01", "Item 5", "low", 0), 
        new KanbanTask("6", "Task 6", "inReview", "2026-11-01", "2026-11-01", "Item 6", "high", 1)]),
    "done": new KanbanColumn(
      "Done", 
      "done", 
      [new KanbanTask("7", "Task 7", "done", "2026-11-01", "2026-11-01", "Item 7", "high", 0), 
        new KanbanTask("8", "Task 8", "done", "2026-11-01", "2026-11-01", "Item 8", "high", 1)])
  });

  const [activeColumn, setActiveColumn] = useState<ColumnId>("todo");
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);
  const viewTaskDialogRef = useRef<HTMLDialogElement>(null);
  const [activeTask, setActiveTask] = useState<KanbanTask|null>(null);

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
            items: reindexTasks(sourceItems, sourceId)
          }
        }
      }
      //Moving tasks between columns
      const destinationItems = [...prev[destinationId].items]
      destinationItems.splice(destination.index, 0, movedTask);

      //Reindex both columns (also updates the moved task's category to its new column)
      return{
        ...prev,
        [sourceId]:{
          ...prev[sourceId],
          items: reindexTasks(sourceItems, sourceId)
        },
        [destinationId]:{
          ...prev[destinationId],
          items: reindexTasks(destinationItems, destinationId)
        }
      }
    })
  }

  function addNewTask(newTask: KanbanTask | null){
    if(!newTask || newTask.content.trim() == ""){
      return;
    }

    setColumns(prev => {
      const columnId = newTask.category;
      return {
        ...prev,
        [columnId]:{
          ...prev[columnId],
          //Append to the end of the column and assign its position from its index
          items: reindexTasks([...prev[columnId].items, newTask], columnId)
        }
      }
    });
  }

  function removeTask(columnId : ColumnId, taskId : string){
    setColumns(prev => ({
      ...prev,
      [columnId]:{
        ...prev[columnId],
        //Filter out task from column and close the gap in positions
        items: reindexTasks(prev[columnId].items.filter((task:KanbanTask) => task.id !== taskId), columnId)
      }
    }));
  }

  return (
      <div id="app-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-columns">
            <Column 
              columnInfo={columns["todo"]} 
              headerColor="rgb(252, 70, 70)" 
              createTaskDialogRef={createTaskDialogRef} 
              viewTaskDialogRef={viewTaskDialogRef}
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={columns["inProgress"]} 
              headerColor="rgb(70, 106, 252)" 
              createTaskDialogRef={createTaskDialogRef}
              viewTaskDialogRef={viewTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={columns["inReview"]} 
              headerColor="rgb(252, 194, 70)" 
              createTaskDialogRef={createTaskDialogRef}
              viewTaskDialogRef={viewTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={columns["done"]} 
              headerColor="rgb(39, 239, 136)" 
              createTaskDialogRef={createTaskDialogRef} 
              viewTaskDialogRef={viewTaskDialogRef}
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
          </div>
        </DragDropContext>

        <CreateTaskModal 
          ref={createTaskDialogRef} 
          activeColumn={activeColumn}
          columnInfo={columns[activeColumn]}
          setActiveColumn={setActiveColumn}
          addNewTask={addNewTask}
          />
        
        <ViewTaskModal 
          ref={viewTaskDialogRef} 
          task={activeTask}
          />
      </div>
  )
}

export default App

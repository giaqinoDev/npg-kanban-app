import { useEffect, useRef, useState } from "react"
import { KanbanColumn } from "./column-component/KanbanColumn";
import Column from "./column-component/Column";
import "./App.css";
import CreateTaskModal from "./modal-component/CreateTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import ViewTaskModal from "./modal-component/ViewTaskModal";
import UpdateTaskModal from "./modal-component/UpdateTaskModal";
import { Categories, type Category, type NewTask, type TaskShape } from "./lib/types";
import { ensureSession } from "./lib/auth";
import { createTask, deleteTask, fetchTasks, moveTask, updateTask } from "./lib/api";

const column_titles: Record<Category, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  inReview: "In Review",
  done: "Done"
}

function buildColumns(tasks: TaskShape[]): Record<Category, KanbanColumn>{
  const columns = {} as Record<Category, KanbanColumn>;
  for(const category of Categories){
    const columnTasks = tasks.filter((task) => task.category === category).sort((taskA, taskB) => taskA.position - taskB.position);
    columns[category] = new KanbanColumn(column_titles[category], category, columnTasks);
  }
  return columns;
}

function reindexTasks(tasks: TaskShape[], category: Category): TaskShape[]{
  return tasks.map((task, index) => {

    if(task.position === index && task.category === category){
      return task;
    }

    const updatedTask: TaskShape = {
      ...task,
      position: index,
      category
    };

    return updatedTask;
      
  });
}

function App() {

  const [columns, setColumns] = useState(() => buildColumns([]));
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeColumn, setActiveColumn] = useState<Category>("todo");
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);
  const viewTaskDialogRef = useRef<HTMLDialogElement>(null);
  const updateTaskDialogRef = useRef<HTMLDialogElement>(null);
  const [activeTask, setActiveTask] = useState<TaskShape|null>(null);

  useEffect(() => {
    async function setUpSession(){
      try{
        await ensureSession(); //sign in for user or create new session for new users
        const tasks = await fetchTasks();
        setColumns(buildColumns(tasks));
      }
      catch(error: any){
        if(error){
          setError(error.message);
        }
        else{
          setError('Failed to load tasks');
        }
      }
      finally{
        setLoadingTasks(false);
      }
    }
    setUpSession();
  }, []);

  async function reloadTasks(){
    try{
      setColumns(buildColumns(await fetchTasks()));
    }
    catch(error: any){
      if(error){
        setError(error.message);
      }
      else{
        setError('Failed to load tasks');
      }
    }
  }

  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceId = source.droppableId as Category;
    const destinationId = destination.droppableId as Category;

    setColumns((prev) => {
      const sourceItems = [...(prev[sourceId].tasks ?? [])];
      const [movedTask] = sourceItems.splice(source.index, 1);
      if (!movedTask) return prev;

      if (sourceId === destinationId) {
        sourceItems.splice(destination.index, 0, movedTask);
        return { ...prev, [sourceId]: { ...prev[sourceId], tasks: reindexTasks(sourceItems, sourceId) } };
      }

      const destinationItems = [...(prev[destinationId].tasks ?? [])];
      destinationItems.splice(destination.index, 0, movedTask);
      return {
        ...prev,
        [sourceId]: { ...prev[sourceId], tasks: reindexTasks(sourceItems, sourceId) },
        [destinationId]: { ...prev[destinationId], tasks: reindexTasks(destinationItems, destinationId) },
      };
    });

    try {
      await moveTask(draggableId, destinationId, destination.index);
    } catch (error: any) {
      setError(error?.message ?? 'Failed to move task');
      reloadTasks();
    }
  }

  async function addNewTask(input: NewTask): Promise<boolean>{
    if(!input.title.trim()){
      return false;
    }
    try{
      const created = await createTask(input, (columns[input.category].tasks ?? []).length);
      setColumns((prev) => ({
        ...prev,
        [created.category]: {
          ...prev[created.category],
          tasks: [...(prev[created.category].tasks ?? []), created]
        }
      }));
      return true;
    }
    catch(error: any){
      if(error){
        setError(error.message);
      }
      else{
        setError('Failed to create task');
      }
      return false;
    }
  }

  async function replaceTask(updatedTask: TaskShape): Promise<boolean> {
    setError(null);
    try {
      const { title, priority, content, start_date, end_date } = updatedTask;
      const saved = await updateTask(updatedTask.id, { title, priority, content, start_date, end_date });

      const oldCategory = saved.category;
      const newCategory = updatedTask.category;

      if (oldCategory === newCategory) {
        setColumns((prev) => ({
          ...prev,
          [oldCategory]: {
            ...prev[oldCategory],
            tasks: (prev[oldCategory].tasks ?? []).map((t) => (t.id === saved.id ? saved : t)),
          },
        }));
        setActiveTask(saved);
        return true;
      }

      const newIndex = columns[newCategory]?.tasks?.length;
      await moveTask(saved.id, newCategory, newIndex as number);

      setColumns((prev) => ({
        ...prev,
        [oldCategory]: {
          ...prev[oldCategory],
          tasks: reindexTasks((prev[oldCategory].tasks ?? []).filter((t) => t.id !== saved.id), oldCategory),
        },
        [newCategory]: {
          ...prev[newCategory],
          tasks: reindexTasks([...(prev[newCategory].tasks ?? []), saved], newCategory),
        },
      }));
      setActiveTask({ ...saved, category: newCategory, position: newIndex as number });
      return true;
    } catch (error: any) {
      setError(error?.message ?? 'Failed to save task');
      reloadTasks();
      return false;
    }
  }

  async function removeTask(columnId: Category, taskId: string): Promise<boolean> {
    setError(null);
    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: reindexTasks((prev[columnId].tasks ?? []).filter((t) => t.id !== taskId), columnId),
      },
    }));
    try {
      await deleteTask(taskId);
      return true;
    } catch (error: any) {
      if(error){
        setError(error.message);
      }
      else{
        setError('Failed to delete task');
        reloadTasks();
      }
      return false;
    }
  }

  return (
      <div id="app-container">
        {loadingTasks && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-columns">
            <Column 
              columnInfo={columns["todo"]}
              headerColor="rgb(252, 70, 70)" 
              createTaskDialogRef={createTaskDialogRef} 
              viewTaskDialogRef={viewTaskDialogRef}
              updateTaskDialogRef={updateTaskDialogRef}
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}
              />
              
            <Column 
              columnInfo={columns["inProgress"]} 
              headerColor="rgb(70, 106, 252)" 
              createTaskDialogRef={createTaskDialogRef}
              viewTaskDialogRef={viewTaskDialogRef}
              updateTaskDialogRef={updateTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={columns["inReview"]} 
              headerColor="rgb(252, 194, 70)" 
              createTaskDialogRef={createTaskDialogRef}
              viewTaskDialogRef={viewTaskDialogRef} 
              updateTaskDialogRef={updateTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={columns["done"]} 
              headerColor="rgb(39, 239, 136)" 
              createTaskDialogRef={createTaskDialogRef} 
              viewTaskDialogRef={viewTaskDialogRef}
              updateTaskDialogRef={updateTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
          </div>
        </DragDropContext>

        <CreateTaskModal 
          ref={createTaskDialogRef} 
          activeColumn={activeColumn}
          setActiveColumn={setActiveColumn}
          addNewTask={addNewTask}
          />
        
        <ViewTaskModal 
          ref={viewTaskDialogRef} 
          task={activeTask}
          />
        
        <UpdateTaskModal
          ref={updateTaskDialogRef}
          task={activeTask}
          replaceTask={replaceTask}
          removeTask={removeTask}
        />
      </div>
  )
}


export default App
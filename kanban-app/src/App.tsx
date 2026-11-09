import { useEffect, useRef, useState } from "react"
import { KanbanColumn } from "./column-component/KanbanColumn";
import Column from "./column-component/Column";
import "./App.css";
import CreateTaskModal from "./modal-component/CreateTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import ViewTaskModal from "./modal-component/ViewTaskModal";
import UpdateTaskModal from "./modal-component/UpdateTaskModal";
import { Categories, type Category, type Label, type LabelColor, type NewTask, type TaskShape } from "./lib/types";
import { ensureSession } from "./lib/auth";
import { createLabel, createTask, deleteLabel, deleteTask, fetchLabels, fetchTasks, moveTask, updateTask } from "./lib/api";
import { FaPlus } from "react-icons/fa";
import LabelCreationModal from "./modal-component/LabelCreationModal";
import SearchBar from "./search-bar-component/SearchBar";

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


function taskMatchesSearch(task: TaskShape, searchQuery: string): boolean{
  const searchableText = [task.title, task.priority, ...task.labels.map((label) => label.name)].join(" ").toLowerCase();
  return searchQuery.toLowerCase().split(/\s+/).every((word) => searchableText.includes(word));
}

function App() {

  const [columns, setColumns] = useState(() => buildColumns([]));
  const [searchQuery, setSearchQuery] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeColumn, setActiveColumn] = useState<Category>("todo");
  const [activeTask, setActiveTask] = useState<TaskShape|null>(null);

  const createTaskDialogRef = useRef<HTMLDialogElement>(null);
  const viewTaskDialogRef = useRef<HTMLDialogElement>(null);
  const updateTaskDialogRef = useRef<HTMLDialogElement>(null);
  const labelCreationDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    async function setUpSession(){
      try{
        await ensureSession(); //sign in for user or create new session for new users
        const [tasks, savedLabels] = await Promise.all([fetchTasks(), fetchLabels()]);
        setColumns(buildColumns(tasks));
        setLabels(savedLabels);
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

    const destinationTasks = (columns[destinationId].tasks ?? []).filter((task) => task.id !== draggableId);
    const taskAtDrop = destinationTasks.filter((task) => taskMatchesSearch(task, searchQuery))[destination.index];
    const destinationIndex = taskAtDrop ? destinationTasks.indexOf(taskAtDrop) : destinationTasks.length;

    setColumns((prev) => {
      const sourceItems = [...(prev[sourceId].tasks ?? [])];
      const sourceIndex = sourceItems.findIndex((task) => task.id === draggableId);
      if (sourceIndex === -1) return prev;
      const [movedTask] = sourceItems.splice(sourceIndex, 1);

      if (sourceId === destinationId) {
        sourceItems.splice(destinationIndex, 0, movedTask);
        return { ...prev, [sourceId]: { ...prev[sourceId], tasks: reindexTasks(sourceItems, sourceId) } };
      }

      const destinationItems = [...(prev[destinationId].tasks ?? [])];
      destinationItems.splice(destinationIndex, 0, movedTask);
      return {
        ...prev,
        [sourceId]: { ...prev[sourceId], tasks: reindexTasks(sourceItems, sourceId) },
        [destinationId]: { ...prev[destinationId], tasks: reindexTasks(destinationItems, destinationId) },
      };
    });

    try {
      await moveTask(draggableId, destinationId, destinationIndex);
    } catch (error: any) {
      setError(error?.message ?? 'Failed to move task');
      reloadTasks();
    }
  }

  async function addNewLabel(name: string, color: LabelColor): Promise<void>{
    const created = await createLabel(name, color);
    setLabels((prev) => [...prev, created]);
  }

  async function removeLabel(labelId: string): Promise<void>{
    await deleteLabel(labelId);
    setLabels((prev) => prev.filter((label) => label.id !== labelId));
    setColumns((prev) => buildColumns(
      Categories.flatMap((category) => prev[category].tasks ?? []).map((task) => ({
        ...task,
        labels: task.labels.filter((label) => label.id !== labelId)
      }))
    ));
  }

  async function addNewTask(input: NewTask, labelIds: string[]): Promise<boolean>{
    if(!input.title.trim()){
      return false;
    }
    try{
      const created = await createTask(input, (columns[input.category].tasks ?? []).length, labelIds);
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
      const { title, priority, content, start_date, end_date, labels: taskLabels } = updatedTask;
      const saved = await updateTask(updatedTask.id, { title, priority, content, start_date, end_date }, taskLabels.map((label) => label.id));

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
    } 
    catch (error: any) {
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

  function visibleColumn(category: Category): KanbanColumn {
    const visibleTasks = (columns[category].tasks ?? []).filter((task) => taskMatchesSearch(task, searchQuery));
    return new KanbanColumn(column_titles[category], category, visibleTasks);
  }

  return (
      <div id="app-container">
        {loadingTasks && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        <div style={{"display":"flex", "margin":"10px"}}>
          <div style={{"display":"flex", "alignItems":"center", "marginLeft":"auto", "height":"fit-content"}}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
            <button style={{"display":"flex", "fontSize":"small", "padding":"10px"}} onClick={() => {labelCreationDialogRef.current?.showModal()}}>
              <FaPlus style={{"marginRight":"10px"}}/>
              Labels
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-columns">
            <Column 
              columnInfo={visibleColumn("todo")}
              headerColor="rgb(252, 70, 70)" 
              createTaskDialogRef={createTaskDialogRef} 
              viewTaskDialogRef={viewTaskDialogRef}
              updateTaskDialogRef={updateTaskDialogRef}
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}
              />
              
            <Column 
              columnInfo={visibleColumn("inProgress")}
              headerColor="rgb(70, 106, 252)" 
              createTaskDialogRef={createTaskDialogRef}
              viewTaskDialogRef={viewTaskDialogRef}
              updateTaskDialogRef={updateTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={visibleColumn("inReview")}
              headerColor="rgb(252, 194, 70)" 
              createTaskDialogRef={createTaskDialogRef}
              viewTaskDialogRef={viewTaskDialogRef} 
              updateTaskDialogRef={updateTaskDialogRef} 
              setActiveColumn={setActiveColumn}
              setActiveTask={setActiveTask}/>
            <Column 
              columnInfo={visibleColumn("done")}
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
          labels={labels}
          labelCreationDialogRef={labelCreationDialogRef}
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
          labels={labels}
          labelCreationDialogRef={labelCreationDialogRef}
        />

        <LabelCreationModal
          ref={labelCreationDialogRef}
          labels={labels}
          addNewLabel={addNewLabel}
          removeLabel={removeLabel}
        />
      </div>
  )
}


export default App
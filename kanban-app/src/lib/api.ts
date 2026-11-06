import { supabase } from "./supabaseClient";
import type { Category, Label, NewTask, TaskChanges, TaskShape } from "./types";

type TaskRow = Omit<TaskShape, 'labels'> & {
    tasks_labels: {
        labels: Label | null
    }[];
};

//turn TaskRow shape into array of labels
function toTask(row: TaskRow): TaskShape {
    //Split into two
    const {tasks_labels, ...rest} = row;
    //Map tasks_label to Label[]
    return{
        ...rest,
        labels: (tasks_labels ?? []).map((join) => join.labels).filter((label): label is Label => label !== null)
    }
}

export async function fetchTasks(): Promise<TaskShape[]>{
    //Grabs every task plus its repsective labels found through the task_label join table
    const {data, error} = await supabase.from('tasks').select('*, tasks_labels(labels(*))').order('position', {ascending: true});
    if(error){
        throw error;
    }
    //Transform supabase response to proper arrays of Tasks
    return (data as TaskRow[]).map(toTask);
}

export async function createTask(input: NewTask, position: number): Promise<TaskShape>{
    const {data, error} = await supabase.from('tasks').insert({...input, position}).select('*, tasks_labels(labels(*))').single();
    if(error){
        throw error;
    }
    return toTask(data as TaskRow);
}

export async function updateTask(id: string, changes: TaskChanges): Promise<TaskShape>{
    const {data, error} = await supabase.from('tasks').update(changes).eq('id', id).select('*, tasks_labels(labels(*))').single();
    if(error){
        throw error;
    }
    return toTask(data as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if(error){
    throw error;
  }
}

export async function moveTask(id: string, category: Category, index: number): Promise<void>{
    const {error} = await supabase.rpc('move_task', {
        p_task_id: id,
        p_category: category,
        p_index: index
    });
    if(error){
        throw error;
    }
}
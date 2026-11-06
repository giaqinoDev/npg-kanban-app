import { supabase } from "./supabaseClient";
import type { Category, Label, LabelColor, NewTask, TaskChanges, TaskShape } from "./types";

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
        labels: (tasks_labels ?? [])
            .map((join) => join.labels)
            .filter((label): label is Label => label !== null)
            .sort((labelA, labelB) => labelA.created_at.localeCompare(labelB.created_at))
    }
}

async function fetchTask(id: string): Promise<TaskShape>{
    const {data, error} = await supabase.from('tasks').select('*, tasks_labels(labels(*))').eq('id', id).single();
    if(error){
        throw error;
    }
    return toTask(data as TaskRow);
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

export async function createTask(input: NewTask, position: number, labelIds: string[]): Promise<TaskShape>{
    const {data, error} = await supabase.from('tasks').insert({...input, position}).select('*, tasks_labels(labels(*))').single();
    if(error){
        throw error;
    }
    const created = toTask(data as TaskRow);
    if(labelIds.length === 0){
        return created;
    }
    try{
        await setTaskLabels(created.id, labelIds);
        return await fetchTask(created.id);
    }
    catch(labelError){
        //Undo the insert so retrying from the still open form doesn't create a duplicate task
        await deleteTask(created.id);
        throw labelError;
    }
}

export async function updateTask(id: string, changes: TaskChanges, labelIds: string[]): Promise<TaskShape>{
    const {error} = await supabase.from('tasks').update(changes).eq('id', id);
    if(error){
        throw error;
    }
    await setTaskLabels(id, labelIds);
    return fetchTask(id);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if(error){
    throw error;
  }
}

export async function fetchLabels(): Promise<Label[]>{
    const {data, error} = await supabase.from('labels').select('*').order('created_at', {ascending: true});
    if(error){
        throw error;
    }
    return data as Label[];
}

export async function createLabel(name: string, color: LabelColor): Promise<Label>{
    const {data, error} = await supabase.from('labels').insert({name, color}).select('*').single();
    if(error){
        throw error.code === '23505' ? new Error(`You already have a label named "${name}"`) : error;
    }
    return data as Label;
}

export async function deleteLabel(id: string): Promise<void>{
    const {error} = await supabase.from('labels').delete().eq('id', id);
    if(error){
        throw error;
    }
}

async function setTaskLabels(taskId: string, labelIds: string[]): Promise<void>{
    const {error} = await supabase.rpc('set_task_labels', {
        p_task_id: taskId,
        p_label_ids: labelIds
    });
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
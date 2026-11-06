import type { Category, TaskShape } from "../lib/types";

export class KanbanColumn{
    name: string;
    category: Category;
    tasks: TaskShape[] | null

    
    constructor(name: string, category: Category, tasks: TaskShape[] | null){
        this.name = name;
        this.category = category;
        this.tasks = tasks;
    }

    setTasks(tasks: TaskShape[] | null){
        this.tasks = tasks;
    }
}
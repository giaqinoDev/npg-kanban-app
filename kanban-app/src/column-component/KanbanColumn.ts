import type { KanbanTask } from "../task-component/KanbanTask";

export class KanbanColumn{
    name: string;
    items: KanbanTask[]

    constructor(name: string, items: KanbanTask[]){
        this.name = name;
        this.items = items;
    }
}
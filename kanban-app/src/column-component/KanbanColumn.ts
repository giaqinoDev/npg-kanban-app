import type { KanbanTask } from "../task-component/KanbanTask";

export type ColumnId = "todo" | "inProgress" | "inReview" | "done";
export class KanbanColumn{
    name: string;
    id: ColumnId;
    items: KanbanTask[]

    constructor(name: string, id: ColumnId, items: KanbanTask[]){
        this.name = name;
        this.id = id;
        this.items = items;
    }
}
import type { ColumnId } from "../column-component/KanbanColumn";

export type PriorityId = "low" | "medium" | "high";
export class KanbanTask{
    id: string;
    title: string;
    category: ColumnId;
    priority: PriorityId;
    content: string;

    constructor(id: string, title: string, category: ColumnId, priority: PriorityId, content: string){
        this.id = id;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.content = content;
    }
}
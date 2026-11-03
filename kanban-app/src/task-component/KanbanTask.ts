import type { ColumnId } from "../column-component/KanbanColumn";

export type PriorityId = "low" | "medium" | "high";
export class KanbanTask{
    id: string;
    title: string;
    category: ColumnId;
    priority: PriorityId;
    start_date: string;
    end_date: string;
    content: string;
    position: number;

    constructor(id: string, title: string, category: ColumnId, start_date: string, end_date: string, content: string, priority: PriorityId, position:number){
        this.id = id;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.start_date = start_date;
        this.end_date = end_date;
        this.content = content;
        this.position = position;
    }
}
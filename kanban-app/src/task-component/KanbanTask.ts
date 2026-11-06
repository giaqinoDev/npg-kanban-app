import type { ColumnId } from "../column-component/KanbanColumn";
import type { Category, Priority } from "../lib/types";

export type PriorityId = "low" | "medium" | "high";
export class KanbanTask{
    id: string;
    title: string;
    category: Category;
    priority: PriorityId;
    start_date: string | null;;
    end_date: string | null;
    content: string;
    position: number;

    constructor(id: string, title: string, category: Category, start_date: string | null, end_date: string | null, content: string, priority: Priority, position:number){
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
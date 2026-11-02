export class KanbanTask{
    id: string;
    title: string;
    category: string;
    priority: string;
    content: string;

    constructor(id: string, content: string, title: string, priority: string, category: string){
        this.id = id;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.content = content;
    }
}
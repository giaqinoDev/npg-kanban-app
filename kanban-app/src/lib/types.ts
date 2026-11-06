export type Category = 'todo' | 'inProgress' | 'inReview' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type LabelColor = 'gray' | 'red' | 'orange' | 'green' | 'blue' | 'purple';
// Keys are the values allowed by the labels.color check constraint in the database
export const LabelColorHex: Record<LabelColor, string> = {
    red: "#EF4444",
    orange: "#F97316",
    green: "#22C55E",
    blue: "#3B82F6",
    purple: "#A855F7",
    gray: "#6B7280"
};
export const LabelColors = Object.keys(LabelColorHex) as LabelColor[];
export const Categories: Category[] = ['todo', 'inProgress', 'inReview', 'done'];

export interface Label{
    id: string;
    created_by: string;
    name: string;
    color: LabelColor;
    created_at: string;
}

export interface TaskShape{
    id: string;
    created_by: string;
    title: string;
    category: Category;
    start_date: string | null;
    end_date: string | null;
    content: string;
    priority: Priority;
    position: number;
    created_at: string;
    updated_at: string;
    labels: Label[];
}
export interface NewTask{
    title: string;
    category: Category;
    priority: Priority;
    content?: string;
    start_date?: string | null;
    end_date?: string | null;
}
export type TaskChanges = Partial<Omit<NewTask, 'category'>>;
import { Category } from "src/app/tab2/models/category";
import { User } from "src/app/users/models/user";

export class Item {
    _id?: string;
    description: string;
    quantity: number;
    unit?: string;
    status: boolean;
    category: Category;
    user: User;
}
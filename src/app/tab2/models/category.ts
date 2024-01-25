import { User } from "src/app/users/models/user";

export class Category {
    _id?: string;
    name: string;
    user: User;
}
import { User } from "src/app/users/models/user";

export class UpdateCategoryDto {
    originalName: string;
    newName: string;
    user: User;
}
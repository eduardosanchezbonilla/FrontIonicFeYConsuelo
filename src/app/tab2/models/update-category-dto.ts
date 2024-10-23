import { User } from "src/app/models/user/user";

export class UpdateCategoryDto {
    originalName: string;
    newName: string;
    user: User;
}
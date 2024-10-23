import { Musician } from "src/app/models/musician/musician";
import { UserDetail } from "./user-detail";

export class TokenUser {
    token: string;    
    username: string;
    roles:string[];
    musician: Musician;
    userDetail: UserDetail;
}
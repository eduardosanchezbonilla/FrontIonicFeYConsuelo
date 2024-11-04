import { Musician } from "src/app/models/musician/musician";
import { UserDetail } from "./user-detail";

export class User {
    _id?: string;    
    username: string;
    roles: string[];
    profile: string;
    passwordExpired: boolean;
    musician: Musician;
    userDetail: UserDetail;

    constructor(username: string, 
                roles:string[],
                profile: string,
                musician: Musician,
                uerDetail: UserDetail,
                _id?: string
    ) {
        this.username = username;
        this.roles = roles;
        this.profile = profile;
        this.musician = musician;
        this.userDetail = uerDetail;
        this._id = _id;
    }
}
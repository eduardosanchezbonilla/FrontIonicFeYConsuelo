export class User {
    _id?: string;    
    username: string;
    roles: string[];

    constructor(username: string, roles:string[],_id?: string) {
        this.username = username;
        this.roles = roles;
        this._id = _id;
    }
}

export class UserPartitureGroup {
    username: string;
    id: number;
    name: string;
    assigned: boolean;

    constructor(username?:string,
                id?: number,
                name?: string,
                assigned?: boolean
    ) {
        this.username = username;
        this.id = id;
        this.name = name;
        this.assigned = assigned;
    }
}
import { Role } from "../role/role";

export class UserRequest {
    username: string;
    password: string;
    roles: string[];
    role: Role;
    dni?: string;    
    name?: string;    
    surname?: string;    
    direction?: string;    
    municipality?: string;    
    province?: string;    
    email?: string;    
    image?: string;    
    description?: string;   
    phoneNumber?: string; 

    constructor(username:string, 
                password:string,
                roles:string[],
                role:Role,
                dni?: string,  
                name?: string,
                surname?: string,
                direction?: string,
                municipality?: string,
                province?: string,
                email?: string, 
                image?: string,    
                description?: string,
                phoneNumber?: string
            ) {
        this.username = username;
        this.password = password;
        this.roles = roles;
        this.role = role;
        this.dni = dni;
        this.name = name;
        this.surname = surname;
        this.direction = direction;
        this.municipality = municipality;
        this.province = province;
        this.email = email;
        this.image = image;
        this.description = description;        
        this.phoneNumber = phoneNumber;
    }
}
import { Musician } from "src/app/models/musician/musician";

export class UserDetail {
    dni?: string;    
    name?: string;    
    surname?: string;    
    direction?: string;    
    municipality?: string;    
    province?: string;    
    email?: string;    
    image?: string;    
    description?: string;    

    constructor(dni?: string,  
                name?: string,
                surname?: string,
                direction?: string,
                municipality?: string,
                province?: string,
                email?: string, 
                image?: string,    
                description?: string
            ) {
        this.dni = dni;
        this.name = name;
        this.surname = surname;
        this.direction = direction;
        this.municipality = municipality;
        this.province = province;
        this.email = email;
        this.image = image;
        this.description = description;        
    }
}
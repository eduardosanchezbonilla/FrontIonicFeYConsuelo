export class UserDetail {
    username?: string;
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

    constructor(dni?: string,  
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
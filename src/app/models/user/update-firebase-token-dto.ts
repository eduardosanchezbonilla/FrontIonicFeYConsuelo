export class UpdateFirebaseTokenDto {
    username: string;
    firebaseToken: string;    

    constructor(username: string,  
                firebaseToken: string
    ) {
        this.username = username;
        this.firebaseToken = firebaseToken;         
    }
}
import { AuthDto } from "../models/auth-dto";
import { User } from "../models/user";

export class Login { 
  static readonly type = '[Users] Login';
  constructor(public payload: {auth: AuthDto}) { }
}

/*export class GetUser {
  static readonly type = '[Users] Get user by email';
  constructor(public payload: {email: string}) { }
}

export class CreateUser {
  static readonly type = '[Users] Create user';
  constructor(public payload: {user: User}) { }
}*/

export class Logout {
  static readonly type = '[Users] Logout';  
}

/*export class DeleteUser {
  static readonly type = '[Users] Delete user';
  constructor(public payload: {idUser: string}) { }
}*/
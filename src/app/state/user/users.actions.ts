import { UpdateFirebaseTokenDto } from "src/app/models/user/update-firebase-token-dto";
import { AuthDto } from "../../models/user/auth-dto";
import { ChangePasswordDto } from "../../models/user/change-password-dto";
import { ResetPasswordDto } from "../../models/user/reset-password-dto";
import { UserRequest } from "src/app/models/user/user-request";

export class Login { 
  static readonly type = '[Users] Login';
  constructor(public payload: {auth: AuthDto}) { }
}

export class ChangeExpiredPassword { 
  static readonly type = '[Users] ChangeExpiredPassword';
  constructor(public payload: {changePassword: ChangePasswordDto}) { }
}

export class ResetPassword { 
  static readonly type = '[Users] ResetPassword';
  constructor(public payload: {resetPassword: ResetPasswordDto}) { }
}

export class UpdateFirebaseToken { 
  static readonly type = '[Users] UpdateFirebaseToken';
  constructor(public payload: {updateFirebaseToken: UpdateFirebaseTokenDto}) { }
}

export class Logout {
  static readonly type = '[Users] Logout';  
}

export class GetUsersGroupByRole {
  static readonly type = '[Users] GetUsersGroupByRole';
  constructor(public payload: {filter: string}) { }
}

export class GetAllRoles {
  static readonly type = '[Users] GetAllRoles';
  constructor(public payload: {}) { }
}

export class ResetUser {
  static readonly type = '[Users] Restet User';
  constructor(public payload: {}) { }
}

export class CreateUser {
  static readonly type = '[Users] Create User';
  constructor(public payload: {user: UserRequest}) { }
}

export class DeleteUser {
  static readonly type = '[Users] Delete USer';
  constructor(public payload: {username:string}) { }
}

export class UpdateUserDetail {
  static readonly type = '[User] Update UserDetail';
  constructor(public payload: {user: UserRequest}) { }
}

export class UpdateUserRoles {
  static readonly type = '[User] Update UserRoles';
  constructor(public payload: {user: UserRequest}) { }
}

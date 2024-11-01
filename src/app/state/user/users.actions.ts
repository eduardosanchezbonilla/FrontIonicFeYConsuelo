import { UpdateFirebaseTokenDto } from "src/app/models/user/update-firebase-token-dto";
import { AuthDto } from "../../models/user/auth-dto";
import { ChangePasswordDto } from "../../models/user/change-password-dto";
import { ResetPasswordDto } from "../../models/user/reset-password-dto";

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

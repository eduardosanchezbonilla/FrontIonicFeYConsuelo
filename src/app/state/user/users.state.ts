import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ChangeExpiredPassword, Login, Logout, ResetPassword, UpdateFirebaseToken } from './users.actions';
import { UsersService } from '../../services/user/users.service';
import { TokenUser } from '../../models/user/token-user';
import { StorageService } from 'src/app/services/storage/storage.service';
import { User } from '../../models/user/user';

export class UsersStateModel {
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<UsersStateModel>({
  name: 'users',
  defaults
})
@Injectable()
export class UsersState {

  @Selector()
  static success(state:UsersStateModel):boolean {
    return state.success;
  }

  @Selector()
  static errorStatusCode(state:UsersStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:UsersStateModel):string {
    return state.errorMessage;
  }

  constructor(
    private storage: StorageService, 
    private userService: UsersService
  ){}

  private getProfile(roles:string[]):string{
    if(roles.includes('SUPER_ADMIN')){
      return 'SUPER_ADMIN';
    }
    else if(roles.includes('ADMIN')){
      return 'ADMIN';
    }
    else if(roles.includes('MUSICO')){
      return 'MUSICO';
    }
    else{
      return 'INVITADO';
    }
  }

  @Action(Login)
  login(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: Login
  ) {
    return this.userService.login(payload.auth)
      .then( 
        async (token:TokenUser) => {               
          if(token){         
            await this.storage.setItem('token',token.token);
            let userToken = new User(
              token.username,
              token.roles,
              this.getProfile(token.roles),
              token.musician,
              token.userDetail
            );          
            await this.storage.setItem('user',JSON.stringify(userToken));  
            patchState({
              success: true,
              errorStatusCode: null,
              errorMessage: null
            })
          }
          else{
            patchState({
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error no controlado'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(ChangeExpiredPassword)
  changeExpiredPassword(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: ChangeExpiredPassword
  ) {
    return this.userService.changeExpiredPassword(payload.changePassword)
      .then( 
        async (token:TokenUser) => {          
            patchState({
              success: true,
              errorStatusCode: null,
              errorMessage: null
            })          
        }
      )
      .catch(
        async (error) => {          
          patchState({
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(ResetPassword)
  resetPassword(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: ResetPassword
  ) {
    return this.userService.resetPassword(payload.resetPassword)
      .then( 
        async (success:Boolean) => {       
            if(success)   {
              patchState({
                success: true,
                errorStatusCode: null,
                errorMessage: null
              })          
            }
            else{
              patchState({
                success: false,
                errorStatusCode: null,
                errorMessage: null
              })          
            }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(UpdateFirebaseToken)
  updateFirebaseToken(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: UpdateFirebaseToken
  ) {
    return this.userService.updateFirebaseToken(payload.updateFirebaseToken)
      .then( 
        async (success:Boolean) => {       
          if(success)   {
            patchState({
              success: true,
              errorStatusCode: null,
              errorMessage: null
            })          
          }
          else{
            patchState({
              success: false,
              errorStatusCode: null,
              errorMessage: null
            })          
          }
      }
      )
      .catch(
        async (error) => {          
          patchState({
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(Logout)
  async logout(
      { setState }: StateContext<UsersStateModel>,      
  ) {    
    await this.storage.clear();
    setState({
      success:false,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}

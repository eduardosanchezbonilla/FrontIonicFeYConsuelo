import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ChangeExpiredPassword, CreateUser, DeleteUser, GetAllRoles, GetUser, GetUsersGroupByRole, Login, Logout,  ResetPasswordUser, ResetUser, UpdateFirebaseToken, UpdateLassAccessDate, UpdateUserDetail, UpdateUserPassword, UpdateUserRoles } from './users.actions';
import { UsersService } from '../../services/user/users.service';
import { TokenUser } from '../../models/user/token-user';
import { StorageService } from 'src/app/services/storage/storage.service';
import { User } from '../../models/user/user';
import { UserGroupByRole } from 'src/app/models/user/user-group-by-role';
import { Role } from 'src/app/models/role/role';
import { UserResponse } from 'src/app/models/user/user-response';
import { ToastService } from 'src/app/services/toast/toast.service';

export class UsersStateModel {
  usersGroupByRole: UserGroupByRole[];
  user: UserResponse;
  roles: Role[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  usersGroupByRole: [],
  user: null,
  roles: [],
  finish: false,
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
  static finish(state:UsersStateModel):boolean {
    return state.finish;
  }

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

  @Selector()
  static usersGroupByRole(state:UsersStateModel):UserGroupByRole[] {
    return state.usersGroupByRole;
  }

  @Selector()
  static user(state:UsersStateModel):UserResponse {
    return state.user;
  }

  @Selector()
  static roles(state:UsersStateModel):Role[] {
    return state.roles;
  }

  constructor(
    private storage: StorageService, 
    private userService: UsersService,
    private toast:ToastService,
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
              token.musicianMarchSolos,
              token.userDetail,
              token.todayPerformance
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

  @Action(ResetPasswordUser)
  resetPasswordUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: ResetPasswordUser
  ) {
    return this.userService.resetPasswordUser(payload.resetPassword)
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

  @Action(UpdateLassAccessDate)
  updateLassAccessDate(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: UpdateLassAccessDate
  ) {
    return this.userService.updateLassAccessDate(payload.username)
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
      usersGroupByRole: [],
      user: null,
      roles: [],
      finish: false,
      success:false,
      errorStatusCode: null,
      errorMessage: null
    })
  }

  @Action(GetUsersGroupByRole)
  getUsersGroupByRole(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: GetUsersGroupByRole
  ) {
    return this.userService.getUsersGroupByRole(payload.filter)
      .then(
          (usersGroupByRole:UserGroupByRole[]) => {
            patchState({
              finish: true,
              success: true,
              usersGroupByRole: usersGroupByRole,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
      )
      .catch(
        async (error) => {                    
          patchState({
            finish: true,
            success: false,
            usersGroupByRole: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetAllRoles)
  getAllRoles(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: GetAllRoles
  ) {
    return this.userService.getAllRoles()
      .then(
          (roles:Role[]) => {
            patchState({
              finish: true,
              success: true,
              roles: roles,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
      )
      .catch(
        async (error) => {                    
          patchState({
            finish: true,
            success: false,
            roles: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(ResetUser)
  resetMusician(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: ResetUser
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

  @Action(CreateUser)
  createUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: CreateUser
  ) {
    return this.userService.createUser(payload.user)
      .then( 
        async (success:Boolean) => {       
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 201,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al crear el usuario'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(DeleteUser)
  deleteUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: DeleteUser
  ) {
    return this.userService.deleteUser(payload.username)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al eliminar el usuario'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(UpdateUserDetail)
  updateUserDetail(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: UpdateUserDetail
  ) {
    return this.userService.updateUserDetail(payload.user)
      .then( 
        async (success:Boolean) => {       
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar los detalles del usuario'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(UpdateUserRoles)
  updateUserRoles(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: UpdateUserRoles
  ) {
    return this.userService.updateUserRoles(payload.user)
      .then( 
        async (success:Boolean) => {       
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar los roles del usuario'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(UpdateUserPassword)
  updatePassword(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: UpdateUserPassword
  ) {
    return this.userService.updateUserPassword(payload.user)
      .then( 
        async (success:Boolean) => {       
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar el password del usuario'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(GetUser)
  getUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: GetUser
  ) {        
    return this.userService.getUser(payload.username)
      .then(
          (user:UserResponse) => {            
            patchState({
              finish: true,
              success: true,
              user: user,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
      )
      .catch(
        async (error) => {    
          patchState({
            finish: true,
            success: false,
            user: new UserResponse(null,null,null,null),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

}

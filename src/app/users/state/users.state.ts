import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { /*CreateUser, DeleteUser, GetUser,*/ Login, Logout } from './users.actions';
import { UsersService } from '../services/users.service';
import { TokenUser } from '../models/token-user';
import { StorageService } from 'src/app/services/storage/storage.service';
import { User } from '../models/user';

export class UsersStateModel {
  success: boolean;
}

const defaults = {
  success: false
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

  constructor(
    private storage: StorageService, 
    private userService: UsersService){}

  @Action(Login)
  login(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: Login
  ) {
    return this.userService.login(payload.auth).then( async (token:TokenUser) => {
        if(token){                    
          await this.storage.setItem('token',token.token);
          await this.storage.setItem('user',JSON.stringify(new User(token.username,token.roles)));
          patchState({
            success: true
          })
        }
        else{
          patchState({
            success: false
          })
        }
      }
    )
  }

  /*@Action(GetUser)
  getUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: GetUser
  ) {
    return this.userService.getUser(payload.email).then(async (user:User) => {
        if(user){
          await this.storage.setItem('user',JSON.stringify(user));
          patchState({
            success: true
          })
        }
        else{
          patchState({
            success: false
          })
        }
      }
    )
  }

  @Action(CreateUser)
  createUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: CreateUser
  ) {
    return this.userService.createUser(payload.user).then( async (user:User) => {
        if(user){
          patchState({
            success: true
          })
        }
        else{
          patchState({
            success: false
          })
        }
      }
    )
  }*/

  @Action(Logout)
  async logout(
      { setState }: StateContext<UsersStateModel>,      
  ) {
    await this.storage.clear();
    setState({
      success:false
    })
  }

  /*@Action(DeleteUser)
  deleteUser(
      { patchState }: StateContext<UsersStateModel>,
      { payload }: DeleteUser
  ) {
    return this.userService.deleteUser(payload.idUser).then( async (success: boolean) => {
        patchState({
          success
        })     
      }
    )
  }*/

}

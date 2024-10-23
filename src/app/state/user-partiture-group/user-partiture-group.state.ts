import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { PartitureGroup } from 'src/app/models/partiture-group/partiture-group';
import { UserPartitureGroup } from 'src/app/models/user-partiture-group/user-partiture-group';
import { UserPartitureGroupService } from 'src/app/services/user-partiture-group/user-partiture-group.service';
import { CreateUserPartitureGroup, DeleteUserPartitureGroup, GetUserPartitureGroups, ResetUserPartitureGroup } from './user-partiture-group.actions';

export class UserPartitureGroupStateModel {
  public userPartitureGroups: UserPartitureGroup[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  userPartitureGroups: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<UserPartitureGroupStateModel>({
  name: 'userPartitureGroups',
  defaults
})
@Injectable()
export class UserPartitureGroupState { 
  
  constructor(    
    private userPartitureGroupService: UserPartitureGroupService
  ){}

  @Selector()
  static success(state:UserPartitureGroupStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:UserPartitureGroupStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static userPartitureGroups(state:UserPartitureGroupStateModel):UserPartitureGroup[] {
    return state.userPartitureGroups;
  }

  @Selector()
  static errorStatusCode(state:UserPartitureGroupStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:UserPartitureGroupStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateUserPartitureGroup)
  createUserPartitureGroup(
      { patchState }: StateContext<UserPartitureGroupStateModel>,
      { payload }: CreateUserPartitureGroup
  ) {
    return this.userPartitureGroupService.createUserPartitureGroup(payload.userPartitureGroup)
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
              errorMessage: 'Error al asociar el grupo de partituras al usuario'
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
  
  @Action(GetUserPartitureGroups)
  getUserPartitureGroups(
      { patchState }: StateContext<UserPartitureGroupStateModel>,
      { payload }: GetUserPartitureGroups
  ) {
    return this.userPartitureGroupService.getUserPartitureGroups(payload.username)
      .then(          
        async (userPartitureGroups:UserPartitureGroup[]) => {                        
            patchState({
              finish: true,
              success: true,
              userPartitureGroups: userPartitureGroups,
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
            userPartitureGroups: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteUserPartitureGroup)
  deleteUserPartitureGroup(
      { patchState }: StateContext<UserPartitureGroupStateModel>,
      { payload }: DeleteUserPartitureGroup
  ) {
    return this.userPartitureGroupService.deleteUserPartitureGroup(payload.userPartitureGroup)
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
              errorMessage: 'Error al desasociar el grupo de partituras al usuario'
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

  @Action(ResetUserPartitureGroup)
  resetUserPartitureGroup(
      { patchState }: StateContext<UserPartitureGroupStateModel>,
      { payload }: ResetUserPartitureGroup
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      userPartitureGroups: []
    })
  }

}

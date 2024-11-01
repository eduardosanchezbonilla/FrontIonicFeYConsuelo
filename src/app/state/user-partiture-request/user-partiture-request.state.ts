import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { UserRequestPartitureRequest } from 'src/app/models/user-partiture-request/user-request-partiture-request';
import { UserPartitureRequestService } from 'src/app/services/user-partiture-request/user-partiture-request.service';
import { CreateUserPartitureRequest, GetUserRequestPartitureGroupByUser, MarkReadUnreadNotificationMessage, ResetUserPartitureRequest } from './user-partiture-request.actions';
import { UserRequestPartitureGroupByUserResponse } from 'src/app/models/user-partiture-request/user-request-partiture-group-by-user-response';

export class UserPartitureRequestStateModel {
  public userPartitureRequests: UserRequestPartitureRequest[];
  userRequestPartitureGroupByUser: UserRequestPartitureGroupByUserResponse[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  userPartitureRequests: [],
  userRequestPartitureGroupByUser: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<UserPartitureRequestStateModel>({
  name: 'userPartitureRequests',
  defaults
})
@Injectable()
export class UserPartitureRequestState { 
  
  constructor(    
    private userPartitureRequestService: UserPartitureRequestService
  ){}

  @Selector()
  static success(state:UserPartitureRequestStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:UserPartitureRequestStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static userPartitureGroups(state:UserPartitureRequestStateModel):UserRequestPartitureRequest[] {
    return state.userPartitureRequests;
  }

  @Selector()
  static userRequestPartitureGroupByUser(state:UserPartitureRequestStateModel):UserRequestPartitureGroupByUserResponse[] {
    return state.userRequestPartitureGroupByUser;
  }

  @Selector()
  static errorStatusCode(state:UserPartitureRequestStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:UserPartitureRequestStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateUserPartitureRequest)
  createUserPartitureRequest(
      { patchState }: StateContext<UserPartitureRequestStateModel>,
      { payload }: CreateUserPartitureRequest
  ) {
    return this.userPartitureRequestService.createUserPartitureRequest(payload.userPartitureRequest)
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
              errorMessage: 'Error al generar la peticion de partituras'
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

  @Action(GetUserRequestPartitureGroupByUser)
  getUserRequestPartitureGroupByUser(
      { patchState }: StateContext<UserPartitureRequestStateModel>,
      { payload }: GetUserRequestPartitureGroupByUser
  ) {
    return this.userPartitureRequestService.getAllUserRequestPartitureGroupByUser(payload.all)
      .then(          
        async (userRequestPartitureGroupByUser:UserRequestPartitureGroupByUserResponse[]) => {                        
            patchState({
              finish: true,
              success: true,
              userRequestPartitureGroupByUser: userRequestPartitureGroupByUser,
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
            userRequestPartitureGroupByUser: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }
  
  @Action(MarkReadUnreadNotificationMessage)
  deleteUserPartitureGroup(
      { patchState }: StateContext<UserPartitureRequestStateModel>,
      { payload }: MarkReadUnreadNotificationMessage
  ) {
    return this.userPartitureRequestService.markReadUnreadNotificationMessage(payload.userRequestPartitureRequest)
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
              errorMessage: 'Error al marcar/desmarcar como leida la solicitud de partituras'
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

  @Action(ResetUserPartitureRequest)
  resetUserPartitureRequest(
      { patchState }: StateContext<UserPartitureRequestStateModel>,
      { payload }: ResetUserPartitureRequest
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      userPartitureRequests: [],
      userRequestPartitureGroupByUser: []
    })
  }

}

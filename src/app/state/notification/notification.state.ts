import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { NotificationUserTokenResponseDto } from 'src/app/models/notification/NotificationUserTokenResponseDto';
import { NotificationTopicResponseDto } from 'src/app/models/notification/NotificationTopicResponseDto';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { GetNotificationTopics, GetNotificationUserTokens, ResetNotification, SendNotification } from './notification.actions';  

export class NotificatioinStateModel {
  public notificationUserTokenResponseList: NotificationUserTokenResponseDto[];
  public notificationTopicResponseList: NotificationTopicResponseDto[];
  finish: boolean;
  finishToken: boolean;
  finishTopic: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  notificationUserTokenResponseList: [],
  notificationTopicResponseList: [],
  finish: false,
  finishToken: false,
  finishTopic: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<NotificatioinStateModel>({
  name: 'notificationUserTokenResponseList',
  defaults
})
@Injectable()
export class NotificationState { 
  
  constructor(    
    private notificationService: NotificationService    
  ){}

  @Selector()
  static success(state:NotificatioinStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:NotificatioinStateModel):boolean {
    return state.finish;
  }

  @Selector()
  static finishToken(state:NotificatioinStateModel):boolean {
    return state.finishToken;
  }

  @Selector()
  static finishTopic(state:NotificatioinStateModel):boolean {
    return state.finishTopic;
  }
  
  @Selector()
  static notificationUserTokenResponseList(state:NotificatioinStateModel):NotificationUserTokenResponseDto[] {
    return state.notificationUserTokenResponseList;
  }

  @Selector()
  static notificationTopicResponseList(state:NotificatioinStateModel):NotificationTopicResponseDto[] {
    return state.notificationTopicResponseList;
  }

  @Selector()
  static errorStatusCode(state:NotificatioinStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:NotificatioinStateModel):string {
    return state.errorMessage;
  }

  @Action(SendNotification)
  sendNotification(
      { patchState }: StateContext<NotificatioinStateModel>,
      { payload }: SendNotification
  ) {
    return this.notificationService.sendNotification(payload.notificationRequest)
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
              errorMessage: 'Error al enviar la notificacion'
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
 
  @Action(GetNotificationUserTokens)
  getNotificationUserTokens(
      { patchState }: StateContext<NotificatioinStateModel>,
      { payload }: GetNotificationUserTokens
  ) {
    return this.notificationService.getNotificationUserTokens()
      .then(
          (notificationUserTokenResponseList:NotificationUserTokenResponseDto[]) => {
            patchState({
              finishToken: true,
              success: true,
              notificationUserTokenResponseList: notificationUserTokenResponseList,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
      )
      .catch(
        async (error) => {          
          patchState({
            finishToken: true,
            success: false,
            notificationUserTokenResponseList: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetNotificationTopics)
  getNotificationTopics(
      { patchState }: StateContext<NotificatioinStateModel>,
      { payload }: GetNotificationTopics
  ) {
    return this.notificationService.getNotificationTopics()
      .then(
          (notificationTopicResponseList:NotificationTopicResponseDto[]) => {
            patchState({
              finishTopic: true,
              success: true,
              notificationTopicResponseList: notificationTopicResponseList,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
      )
      .catch(
        async (error) => {          
          patchState({
            finishTopic: true,
            success: false,
            notificationTopicResponseList: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(ResetNotification)
  resetNotification(
      { patchState }: StateContext<NotificatioinStateModel>,
      { payload }: ResetNotification
  ) {
    patchState({
      finish: false,
      finishToken: false,
      finishTopic: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}

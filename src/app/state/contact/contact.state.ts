import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ContactResponse } from 'src/app/models/contact/contact-response';
import { ContactService } from 'src/app/services/contact/contact.service';
import { CreateContactRequest, GetContactRequest, MarkReadUnread, ResetContactRequest } from './contact.actions';

export class ContactStateModel {
  contactRequests: ContactResponse[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  contactRequests: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<ContactStateModel>({
  name: 'contact',
  defaults
})
@Injectable()
export class ContactState { 
  
  constructor(    
    private contactService: ContactService
  ){}

  @Selector()
  static success(state:ContactStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:ContactStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static contactRequests(state:ContactStateModel):ContactResponse[] {
    return state.contactRequests;
  }

  @Selector()
  static errorStatusCode(state:ContactStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:ContactStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateContactRequest)
  createContactRequest(
      { patchState }: StateContext<ContactStateModel>,
      { payload }: CreateContactRequest
  ) {
    return this.contactService.createContactRequest(payload.contactRequest)
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
              errorMessage: 'Error al crear la peticion de contacto'
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

  @Action(GetContactRequest)
  getContactRequest(
      { patchState }: StateContext<ContactStateModel>,
      { payload }: GetContactRequest
  ) {
    return this.contactService.getAllContactRequest(payload.all)
      .then(          
        async (contactRequests:ContactResponse[]) => {                        
            patchState({
              finish: true,
              success: true,
              contactRequests: contactRequests,
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
            contactRequests: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }
  
  @Action(MarkReadUnread)
  markReadUnreadContactRequest(
      { patchState }: StateContext<ContactStateModel>,
      { payload }: MarkReadUnread
  ) {
    return this.contactService.markReadUnread(payload.contactRequest)
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
              errorMessage: 'Error al marcar/desmarcar como leida la peticion de ocntacto'
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

  @Action(ResetContactRequest)
  resetContactRequest(
      { patchState }: StateContext<ContactStateModel>,
      { payload }: ResetContactRequest
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,    
      contactRequests: []
    })
  }

}

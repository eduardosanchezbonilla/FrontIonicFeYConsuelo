import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactState } from '../state/contact/contact.state';
import { ContactResponse } from '../models/contact/contact-response';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { CreateContactRequest, GetContactRequest, MarkReadUnread, ResetContactRequest } from '../state/contact/contact.actions';
import { ContactRequest } from '../models/contact/contact-request';
import { DEFAULT_USER_IMAGE } from '../constants/constants';

@Component({
  selector: 'app-menu-contact',
  templateUrl: './menu-contact.page.html',
  styleUrls: ['./menu-contact.page.scss'],
})
export class MenuContactPage implements OnDestroy {

  public profile: string;    

  @Select(ContactState.contactRequests)
  contactRequests$: Observable<ContactResponse[]>;
  contactRequestsSubscription: Subscription;
  public contactRequests: ContactResponse[];
  public initScreen = false;
  public initSearchFinish = false;
  public existsRequest = false;

  private filterAllContactRequest: boolean = false;    

  public textContactRequest: string = '';
  public nameContactRequest: string = '';
  public phoneNumberContactRequest: string = '';
  public emailContactRequest: string = '';
  public invalidTextContactRequest: boolean = false;
  public disabledForm: boolean = true;
  public showConfirmation: boolean = false;
  public defaultUserImage: string = DEFAULT_USER_IMAGE;

  constructor(        
        private store:Store,
        private toast:ToastService,            
        private userService: UsersService,
        private loadingService: LoadingService,             
        private storage: StorageService
    ) {
        
  }

  logout(){
      this.doDestroy();
      this.userService.logout();
  }

  async ionViewWillEnter(){   
    this.profile = await this.storage.getItem('profile');    
    this.contactRequests = [];
    if(this.profile=='SUPER_ADMIN' || this.profile=='ADMIN'){
      this.filterContactRequest();
      this.getContactRequest();   
    }
    else{
      this.initSearchFinish = true;   
      await this.loadingService.dismissLoading();         
    }
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish){
      await this.loadingService.dismissLoading();         
    }
  }

  async ionViewDidEnter(){    
    this.initScreen = true;    
    this.dismissInitialLoading();
  }

  ngOnDestroy() {  
    this.doDestroy();
  }

  async ionViewDidLeave(){
    this.doDestroy();
  }

  private doDestroy(){
    console.log("ngOnDestroy");                      
    if (this.contactRequestsSubscription) {      
      this.contactRequestsSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetContactRequest({})).subscribe({ next: async () => { } })      
  }

  async filterContactRequest(showLoading:boolean=true){    
      if(showLoading){
        await this.loadingService.presentLoading('Loading...');
      }    
      this.store.dispatch(new GetContactRequest({all: this.filterAllContactRequest}));    
  }

  getContactRequest(){
    this.contactRequestsSubscription = this.contactRequests$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(ContactState.finish)        
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(ContactState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(ContactState.errorMessage);   
          if(errorStatusCode==200 || errorStatusCode==204){
            this.contactRequests = this.store.selectSnapshot(ContactState.contactRequests);             
            if(this.contactRequests.length>0){
              this.existsRequest = true;
            }
            else{
              this.existsRequest = false;
            }
            this.initSearchFinish = true;    
            this.dismissInitialLoading();   
          }
          else{
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();                         
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              if(errorMessage!=='' && errorMessage!==null){
                this.toast.presentToast(errorMessage);
              }
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          }
        }
      }
    })
  }

  async refreshContactRequest($event){              
    this.filterContactRequest();    
    $event.target.complete();
  }
  
  trackByContactFn(index, request) {    
    return request.id || index; 
  }

  async onReadedChanged(event: any) {    
    this.filterAllContactRequest = event.detail.value==='all';    
    this.filterContactRequest();    
  }

  async markAsReadUnread(request: ContactRequest) {
    this.markAsRead(request);
  }
  
  async markAsRead(request: ContactRequest) {
    request.readed = !request.readed; 
    let contactRequest: ContactRequest = new ContactRequest(
      request.id,
      request.name,
      request.phoneNumber,
      request.email,
      request.message,
      request.readed
    );   

    // actualizamos en el server    
    await this.loadingService.presentLoading('Loading...');        
    this.store.dispatch(new MarkReadUnread({contactRequest: contactRequest})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(ContactState.success);
        if(success){
          this.toast.presentToast("Peticion de contacto marcada correctamente");
          //this.filterSuggestionBox();         
          await this.loadingService.dismissLoading();      
        }
        else{
          request.readed = !request.readed; 
          const errorStatusCode = this.store.selectSnapshot(ContactState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(ContactState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){                   
            this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
          }
          else{
            if(errorMessage!=='' && errorMessage!==null){
              this.toast.presentToast(errorMessage);
            }
          }    
          await this.loadingService.dismissLoading();      
        }          
      }
    })        
  }

  validTextContactRequest() {
    const validTextContactRequest = this.textContactRequest.trim().length >= 1 && this.textContactRequest.length <= 5000;    
    this.invalidTextContactRequest = !validTextContactRequest;    
    this.disabledForm = !validTextContactRequest;
  }
    
  async createContactRequest(){   
    await this.loadingService.presentLoading('Loading...');       

    let contactRequest: ContactRequest = new ContactRequest(
      null,    
      this.nameContactRequest,
      this.phoneNumberContactRequest,
      this.emailContactRequest,
      this.textContactRequest,
      false
    );  

    this.store.dispatch(new CreateContactRequest({contactRequest: contactRequest}))        
      .subscribe({
        next: async ()=> {          
          const success = this.store.selectSnapshot(ContactState.success);
          if(success){
            this.textContactRequest='';
            this.nameContactRequest='';
            this.phoneNumberContactRequest='';
            this.emailContactRequest='';
            //this.toast.presentToast("Mensaje enviado correctamente");      
            this.showConfirmation = true;
            setTimeout(() => {
              this.showConfirmation = false;
            }, 5000);                                  
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(ContactState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(ContactState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){            
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              if(errorMessage!=='' && errorMessage!==null){
                this.toast.presentToast(errorMessage);
              }
            }                  
          }      
          await this.loadingService.dismissLoading();          
        }
      }
    )
  }

  inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }

  getMailPhoneData(contrarRequest: ContactRequest){
    if(contrarRequest.email!=null && contrarRequest.email.length>0 && contrarRequest.phoneNumber!=null && contrarRequest.phoneNumber.length>0){
      return contrarRequest.email + ' (' + contrarRequest.phoneNumber + ')';
    }

    if(contrarRequest.email!=null && contrarRequest.email.length>0 && (contrarRequest.phoneNumber==null || contrarRequest.phoneNumber.length==0)){
      return contrarRequest.email;
    }

    if(contrarRequest.phoneNumber!=null && contrarRequest.phoneNumber.length>0 && (contrarRequest.email==null || contrarRequest.email.length==0)){
      return contrarRequest.phoneNumber;
    }

    return "Sin datos de mail y telefono";
    
  }
    
}

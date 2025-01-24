import { Component,  OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { UserRequestPartitureGroupByUserResponse } from 'src/app/models/user-partiture-request/user-request-partiture-group-by-user-response';
import { UserRequestPartitureRequest } from 'src/app/models/user-partiture-request/user-request-partiture-request';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GetUserRequestPartitureGroupByUser, MarkReadUnreadNotificationMessage, ResetUserPartitureRequest } from 'src/app/state/user-partiture-request/user-partiture-request.actions';
import { UserPartitureRequestState } from 'src/app/state/user-partiture-request/user-partiture-request.state';
import { DEFAULT_MUSICIAN_IMAGE} from '../../../constants/constants';
import { UserRequestPartitureResponse } from 'src/app/models/user-partiture-request/user-request-partiture-response';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';

@Component({
  selector: 'app-modal-request-partiture',
  templateUrl: './modal-request-partiture.component.html',
  styleUrls: ['./modal-request-partiture.component.scss'],
})
export class ModalRequestPartitureComponent implements OnInit {

  public textRequestPartiture: string = '';
  public invalidTextRequest: boolean = false;
  public disabledForm: boolean = true;
  public profile: string;  
  public defaultMusicianImage: string = DEFAULT_MUSICIAN_IMAGE;  

  @Select(UserPartitureRequestState.userRequestPartitureGroupByUser)
  userRequestPartitureGroupByUser$: Observable<UserRequestPartitureGroupByUserResponse[]>;
  userRequestPartitureGroupByUserSubscription: Subscription;
  public userRequestPartitureGroupByUser: UserRequestPartitureGroupByUserResponse[];
  public initScreen = false;
  public initSearchFinish = false;
  public existsRequest = false;

  private filterAllNotifications: boolean = false;
  
  
  constructor(        
    private modalController: ModalController,
    private loadingService: LoadingService,
    private storage: StorageService,
    private alertController: AlertController,
    private toast:ToastService,    
    private userService: UsersService,
    private store:Store
  ) { }

  async ngOnInit() {  
    this.profile = await this.storage.getItem('profile');    
    this.userRequestPartitureGroupByUser = [];
    if(this.profile=='SUPER_ADMIN'){
      this.filterRequest();
      this.getUserRequestPartitureGroupByUser();   
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
    console.log("ngOnDestroy user request partiture");
    if (this.userRequestPartitureGroupByUserSubscription) {      
      this.userRequestPartitureGroupByUserSubscription.unsubscribe();  
    }     
    this.store.dispatch(new ResetUserPartitureRequest({})).subscribe({ next: async () => { } })   
  }


  async confirmRequestPartiture(){   
    const user = JSON.parse(await this.storage.getItem('user'));         
    let userPartitureRequest = new UserRequestPartitureRequest(
      null, 
      user.username,
      this.textRequestPartiture,
      false
    );        
    this.modalController.dismiss(userPartitureRequest, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  validTextRequestPartiture() {
    const validTextRequest = this.textRequestPartiture.trim().length >= 1 && this.textRequestPartiture.length <= 500;    
    this.invalidTextRequest = !validTextRequest;    
    this.disabledForm = !validTextRequest;
  }

  filterRequest(){
    this.store.dispatch(new GetUserRequestPartitureGroupByUser({all: this.filterAllNotifications}));    
  }

  getUserRequestPartitureGroupByUser(){
    this.userRequestPartitureGroupByUserSubscription = this.userRequestPartitureGroupByUser$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(UserPartitureRequestState.finish)        
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(UserPartitureRequestState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(UserPartitureRequestState.errorMessage);   
          if(errorStatusCode==200){
            this.userRequestPartitureGroupByUser = this.store.selectSnapshot(UserPartitureRequestState.userRequestPartitureGroupByUser);             
            if(this.userRequestPartitureGroupByUser.length>0){
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
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          }
        }
      }
    })
  }

  async refreshRequestPartitureGroupByUser($event){          
    await this.loadingService.presentLoading('Loading...');
    this.filterRequest();    
    $event.target.complete();
  }

  trackByUserRequestFn(index, userRequest) {    
    return userRequest.user.username || index;
  }

  trackByRequestFn(index, request) {    
    return request.id || index; 
  }
  
  async onReadedChanged(event: any) {
    await this.loadingService.presentLoading('Loading...');
    this.filterAllNotifications = event.detail.value==='all';    
    this.filterRequest();    
  }

  async markAsReadUnread(request: UserRequestPartitureResponse) {
    if (request.readed) {
      this.markAsRead(request,'');
    } else {
      const alert = await this.alertController.create({
        header: 'Notificación',
        cssClass: 'notifications-alert-width',
        inputs: [
          {
            name: 'notification',
            type: 'textarea',
            placeholder: 'Escribe un mensaje (opcional)'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Aceptar',
            handler: (data) => {
              const notification = data.notification || ''; 
              this.markAsRead(request, notification); 
            }
          }
        ]
      });  
      await alert.present();
    }
  }
  
  async markAsRead(request: UserRequestPartitureResponse, notification: string) {
    request.readed = !request.readed; 
    let userRequestPartitureRequest: UserRequestPartitureRequest = new UserRequestPartitureRequest(
      request.id,
      request.username,
      request.description,
      request.readed,
      notification
    );   
    
    // actualizamos en el server    
    await this.loadingService.presentLoading('Loading...');        
    this.store.dispatch(new MarkReadUnreadNotificationMessage({userRequestPartitureRequest: userRequestPartitureRequest})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(UserPartitureRequestState.success);
        if(success){
          this.toast.presentToast("Petición actualizada correctamente");
          //this.filterRequest();         
          await this.loadingService.dismissLoading();      
        }
        else{
          request.readed = !request.readed; 
          const errorStatusCode = this.store.selectSnapshot(UserPartitureRequestState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(UserPartitureRequestState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){    
            this.cancel();             
            this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
          }
          else{
            this.toast.presentToast(errorMessage);
          }    
          await this.loadingService.dismissLoading();      
        }          
      }
    })        
  }
  
}

import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { LoadingService } from '../services/loading/loading.service';
import { ToastService } from '../services/toast/toast.service';
import { Select, Store } from '@ngxs/store';
import { NotificationRequestDto } from '../models/notification/NotificationRequestDto';
import { NotificationState } from '../state/notification/notification.state';
import { NotificationUserTokenResponseDto } from '../models/notification/NotificationUserTokenResponseDto';
import { Observable, Subscription } from 'rxjs';
import { NotificationTopicResponseDto } from '../models/notification/NotificationTopicResponseDto';
import { GetNotificationTopics, GetNotificationUserTokens, ResetNotification, SendNotification } from '../state/notification/notification.actions';
import { UsersService } from '../services/user/users.service';

@Component({
  selector: 'app-menu-notification',
  templateUrl: './menu-notification.page.html',
  styleUrls: ['./menu-notification.page.scss'],
})
export class MenuNotificationPage implements OnInit {

  @Select(NotificationState.notificationUserTokenResponseList)
  notificationUserTokenResponseList$: Observable<NotificationUserTokenResponseDto[]>;
  notificationUserTokenResponseListSubscription: Subscription;
  public notificationUserTokenResponseList: NotificationUserTokenResponseDto[];
  public initNotificationUserTokenResponseList = false;

  @Select(NotificationState.notificationTopicResponseList)
  notificationTopicResponseList$: Observable<NotificationTopicResponseDto[]>;
  notificationTopicResponseListSubscription: Subscription;
  public notificationTopicResponseList: NotificationTopicResponseDto[];
  public initNotificationTopicResponseList = false;

  public notificationRequest: NotificationRequestDto = new NotificationRequestDto(null,null,null,null);
  public invalidNotification: boolean = false;
  public disabledForm: boolean = true;
  public initScreen = false;
  
  constructor(        
    private loadingService: LoadingService,
    private alertController: AlertController,
    private toast:ToastService,    
    private store:Store,
    private userService: UsersService
  ) { }

  async ngOnInit() {     
    ;        
  }

  async ionViewWillEnter(){       
    this.initScreen = false;   
    this.initNotificationUserTokenResponseList = false;
    this.initNotificationTopicResponseList = false;    
    await this.loadingService.presentLoading('Loading...'); 
    this.notificationRequest = new NotificationRequestDto(null,null,null,null);

    this.store.dispatch(new GetNotificationUserTokens({}));
    this.getNotificationUserTokenResponseList();        

    this.store.dispatch(new GetNotificationTopics({}));
    this.getNotificationTopicResponseList();        
  }

  async dismissInitialLoading(){    
    if(this.initScreen && this.initNotificationTopicResponseList && this.initNotificationUserTokenResponseList){
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
    console.log("ngOnDestroy notifications");
    if (this.notificationUserTokenResponseListSubscription) {      
      this.notificationUserTokenResponseListSubscription.unsubscribe();  
    }   
    if (this.notificationTopicResponseListSubscription) {      
      this.notificationTopicResponseListSubscription.unsubscribe();  
    }   
    this.store.dispatch(new ResetNotification({})).subscribe({ next: async () => { } })    
  }

  compareWithUserToken(o1: NotificationUserTokenResponseDto, o2: NotificationUserTokenResponseDto){
    return o1 && o2 ? o1.username == o2.username : o1===o2;
  }

  getNotificationUserTokenResponseList(){
    this.notificationUserTokenResponseListSubscription = this.notificationUserTokenResponseList$.subscribe({
      next: async ()=> {        
        const finishToken = this.store.selectSnapshot(NotificationState.finishToken);         
        if(finishToken){
          this.notificationUserTokenResponseList = this.store.selectSnapshot(NotificationState.notificationUserTokenResponseList);            
          this.notificationUserTokenResponseList = this.notificationUserTokenResponseList.filter(token => token.name !== null);
          this.initNotificationUserTokenResponseList = true;    
          this.dismissInitialLoading();      
        }
      }
    })
  }

  compareWithTopic(o1: NotificationTopicResponseDto, o2: NotificationTopicResponseDto){
    return o1 && o2 ? o1.topic == o2.topic : o1===o2;
  }

  getNotificationTopicResponseList(){
    this.notificationTopicResponseListSubscription = this.notificationTopicResponseList$.subscribe({
      next: async ()=> {
        const finishTopic = this.store.selectSnapshot(NotificationState.finishTopic); 
        if(finishTopic){
          this.notificationTopicResponseList = this.store.selectSnapshot(NotificationState.notificationTopicResponseList);            
          this.initNotificationTopicResponseList = true;    
          this.dismissInitialLoading();
        }      
      }
    })
  }

  validNotification() {
    const validNotification = this.notificationRequest.notification.trim().length >= 1 && this.notificationRequest.notification.length <= 500;    
    this.invalidNotification = !validNotification;    
    this.disabledForm = !validNotification;
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async sendNotification(){
    // enviamos la notificacion        
    if (!this.notificationRequest.title || this.notificationRequest.title.trim().length === 0) {
      await this.showAlert('Debe introducir el titulo de la notificación');
      return;
    }
    if (this.notificationRequest.notification.trim().length === 0) {
      await this.showAlert('Debe introducir el mensaje de la notificación');
      return;
    }
    if (this.notificationRequest.topicsObject.length === 0 && this.notificationRequest.tokensObject.length===0) {
      await this.showAlert('Debe seleccionar algún topic o usuario');
      return;
    }

    // copiamos los topicsObject y tokensObject a los arrays topics y tokens
    this.notificationRequest.topics = [];
    this.notificationRequest.tokens = [];
    this.notificationRequest.topicsObject.forEach(topic => {
      this.notificationRequest.topics.push(topic.topic);
    });        
    this.notificationRequest.tokens = Array.from(
      new Set(this.notificationRequest.tokensObject.flatMap(obj => obj.tokens))
    )
    this.notificationRequest.topicsObject = null;
    this.notificationRequest.tokensObject = null;

    // enviamos
    this.doSendNotification();    
  }

  async doSendNotification(){
    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new SendNotification({notificationRequest: this.notificationRequest}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(NotificationState.success);
          if(success){
            this.toast.presentToast("Notificación enviada correctamente");            
            // limpiamos el formulario
            this.notificationRequest = new NotificationRequestDto(null,null,null,null);
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(NotificationState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(NotificationState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){            
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }                   
          }      
          await this.loadingService.dismissLoading();       
        }
      }
    )      
   
  }

}

import { Component } from '@angular/core';
import { StorageService } from './services/storage/storage.service';
import { User } from './models/user/user';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { ToastService } from './services/toast/toast.service';
import { GENERAL_TOPIC } from './constants/firebase-topics';
import { AlertController } from '@ionic/angular';
import { UpdateFirebaseTokenDto } from './models/user/update-firebase-token-dto';
import { Store } from '@ngxs/store';
import { UpdateFirebaseToken } from './state/user/users.actions';
import { UsersState } from './state/user/users.state';
import { UserResponse } from './models/user/user-response';
import { NotificationData } from './models/notification/NotificationData';

// Importa y registra los componentes web de Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public user:User;
  public userRewriteData:UserResponse;
  
  constructor(
    private store: Store,
    private storage: StorageService,
    private toastService: ToastService,
    private alertController: AlertController,    
  ) {
    this.initializeApp();
  }

  async openMenu(){      
      this.user = JSON.parse(await this.storage.getItem('user'));     
      this.userRewriteData = JSON.parse(await this.storage.getItem('userRewriteData'));     

      if(this.userRewriteData && this.userRewriteData.name){
        this.user.userDetail.name = this.userRewriteData.name;
      }
      if(this.userRewriteData && this.userRewriteData.surname){
        this.user.userDetail.surname = this.userRewriteData.surname;
      }
      if(this.userRewriteData && this.userRewriteData.direction){
        this.user.userDetail.direction = this.userRewriteData.direction;
      }
      if(this.userRewriteData && this.userRewriteData.municipality){
        this.user.userDetail.municipality = this.userRewriteData.municipality;
      }
      if(this.userRewriteData && this.userRewriteData.province){
        this.user.userDetail.province = this.userRewriteData.province;
      }
      if(this.userRewriteData && this.userRewriteData.email){
        this.user.userDetail.email = this.userRewriteData.email;
      }
      if(this.userRewriteData && this.userRewriteData.image){
        this.user.userDetail.image = this.userRewriteData.image;
      }
      if(this.userRewriteData && this.userRewriteData.description){
        this.user.userDetail.description = this.userRewriteData.description;
      }
  }

  initializeApp() {
    this.registerPushNotifications();
  }
  
  async registerPushNotifications() {
    if (Capacitor.isNativePlatform()) {
      // Solicitar permisos para notificaciones push
      const permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        // Registrar las notificaciones push       
        await PushNotifications.register();

        // Obtener el token de FCM
        const { token } = await FirebaseMessaging.getToken(); // este token es el que identifica al dispositivo, por si quisieramos enviar mensajes individualizados        
        
        // Suscribir automáticamente al topic general
        await FirebaseMessaging.subscribeToTopic({ topic: GENERAL_TOPIC });        
        
        // anadimos listener para las notificaciones recibidas cuando la aplicacion esta en primer plano
        this.addNotificationReceivedListener();

        // anadimos listener para creacion y cambios de token
        this.addTokenRefreshListener();

        // anadimos listener para cuando pulsen en una notificacion en segundo plano
        this.addPushNotifications();

      } 
      else {
        this.toastService.presentToast("Permisos de notificación no concedidos");        
      }
    }
  }
  
  async addPushNotifications() {
    // Listener para notificaciones clicadas (cuando el usuario pulsa en la notificación)
    await FirebaseMessaging.addListener('notificationActionPerformed', async event => {
      const notification = event.notification;

      // Asegúrate de que `data` tiene el tipo correcto
      const data = notification?.data as NotificationData;

      // Accede al título y cuerpo de la notificación
      const title = notification?.title || data?.title;
      const body = notification?.body || data?.body;
      
      this.showNotificationAlert(title, body);      
    });
  }

  async addNotificationReceivedListener() {
    await FirebaseMessaging.addListener('notificationReceived', async event => {
      this.showNotificationAlert(event.notification?.title, event.notification?.body);
    });
  };

  async addTokenRefreshListener() {
    await FirebaseMessaging.addListener('tokenReceived', async () => {
      const { token } = await FirebaseMessaging.getToken();            
      // Suscribir automáticamente al topic general
      await FirebaseMessaging.subscribeToTopic({ topic: GENERAL_TOPIC });    
      
      if (Capacitor.isNativePlatform()) {      
        const user = JSON.parse(await this.storage.getItem('user'));                        
        if(user!=null && token!=null){               
          let updateFirebaseToken = new UpdateFirebaseTokenDto(user.username, token);
          
          this.store.dispatch(new UpdateFirebaseToken({updateFirebaseToken:updateFirebaseToken})).subscribe({
            next: async () => {
              let success = this.store.selectSnapshot(UsersState.success);
              if(!success){                              
                this.toastService.presentToast("Error al actualizar el token del disposibtivo");                        
              }              
            } 
          })        
        }
      }      
    })
  };

  async showNotificationAlert(title: string, message: string) {
    // solo mostramos notificacion si el mensaje tiene algun caracter
    if(message && message.trim().length === 0){
      return;
    }

    // Reemplazar \n por <br/> para interpretar saltos de línea
    const formattedMessage = message.replaceAll('\n', '<br/>');

    const alert = await this.alertController.create({
      header: title,       // Título de la notificación
      message: formattedMessage,    // Descripción de la notificación
      buttons: ['OK']      // Botón de cierre
    });

    await alert.present();
  }

  
  
}

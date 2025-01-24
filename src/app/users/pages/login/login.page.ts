import { Component } from '@angular/core';
import { AuthDto } from '../../../models/user/auth-dto';
import { Store } from '@ngxs/store';
import { ChangeExpiredPassword, Login, UpdateFirebaseToken, UpdateLassAccessDate, UpdateUserPassword } from '../../../state/user/users.actions';
import { ResetPassword } from '../../../state/musician/musician.actions';
import { UsersState } from '../../../state/user/users.state';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ChangePasswordDto } from '../../../models/user/change-password-dto';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ResetPasswordDto } from '../../../models/user/reset-password-dto';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { ADMIN_TOPIC, GENERAL_TOPIC, MUSICO_TOPIC, SUPER_ADMIN_TOPIC } from 'src/app/constants/firebase-topics';
import { UpdateFirebaseTokenDto } from 'src/app/models/user/update-firebase-token-dto';
import { MusicianState } from 'src/app/state/musician/musician.state';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  public auth: AuthDto;
  public showChangeExpiredPassword: boolean;
  public showForgotPassword: boolean;
  public changePassword: ChangePasswordDto;  
  public resetPassword: ResetPasswordDto;  

  public showPassword = false;
  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showRepeatNewPassword: boolean = false;

  public rememberMe = false;

  constructor(
      private store: Store,
      private toastService: ToastService,
      private navController: NavController,
      private storage: StorageService,          
      private loadingService: LoadingService      
  ) {
    this.auth = new AuthDto(); 
    this.changePassword = new ChangePasswordDto();   
    this.resetPassword = new ResetPasswordDto();   
    this.showChangeExpiredPassword = false;    
    this.showForgotPassword = false;  
  }

  async ionViewWillEnter(){
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showRepeatNewPassword = false;
    this.showPassword = false;

    const user = JSON.parse(await this.storage.getItem('user'));
    if(user){
      setTimeout(() => {      
        this.redirectAfterLogin();      
      }, 200); // 2000 milise   
      
    }
    else{
      this.auth = new AuthDto();  
      
      // recomeramos los datos asociados al remerber
      const rememberStorage = await this.storage.getItem('rememberMe');
      
      if(rememberStorage==='true'){
        this.rememberMe = true;
        this.auth.username = await this.storage.getItem('username');
        this.auth.password = await this.storage.getItem('password');
      }
      else{
        this.rememberMe = false;
      }

    }
  }

  loginInvitado(event: Event) {       
    event.preventDefault(); // Previene el comportamiento predeterminado del enlace <a>
    this.auth.username = "invitado";
    this.auth.password = "invitado";
    this.login();
  }

  async redirectAfterLogin(){
    const user = JSON.parse(await this.storage.getItem('user'));         
    if(user.roles.includes('SUPER_ADMIN')){           
      this.subscribeToRoleTopics('SUPER_ADMIN');
      this.storage.setItem('profile', 'SUPER_ADMIN');
      this.navController.navigateForward('tabs-super-admin/menu-musician');   
    }        
    else if(user.roles.includes('ADMIN')){
      this.subscribeToRoleTopics('ADMIN');
      this.storage.setItem('profile', 'ADMIN');
      this.navController.navigateForward('tabs-admin/menu-musician');   
    }
    else if(user.roles.includes('MUSICO')){
      this.subscribeToRoleTopics('MUSICO');
      this.storage.setItem('profile', 'MUSICO');
      this.navController.navigateForward('tabs-musician/menu-partiture');   
    }
    else{
      this.subscribeToRoleTopics('INVITADO');
      this.storage.setItem('profile', 'INVITADO');
      this.navController.navigateForward('tabs-guest/menu-history');   
    }
  }

  async subscribeToRoleTopics(userRole: string) {    
    if (Capacitor.isNativePlatform()) {
      if (userRole === 'SUPER_ADMIN') {
        // Si el usuario es super administrador, suscribirlo al topic 'superadmin'     
        await FirebaseMessaging.subscribeToTopic({ topic: SUPER_ADMIN_TOPIC });        
      }
      if (userRole === 'ADMIN') {
        // Si el usuario es administrador, suscribirlo al topic 'admin'     
        await FirebaseMessaging.subscribeToTopic({ topic: ADMIN_TOPIC });        
      }     
      if (userRole === 'MUSICO') {
        // Si el usuario es músico, suscribirlo al topic 'musico'     
        await FirebaseMessaging.subscribeToTopic({ topic: MUSICO_TOPIC });        
      } 
      if (userRole === 'INVITADO') {
        // Si el usuario es invitado, suscribirlo al topic 'general'     
        await FirebaseMessaging.subscribeToTopic({ topic: GENERAL_TOPIC });
      }
    }
  }

  async updateFirebaseToken() {    
    try{       
      if (Capacitor.isNativePlatform()) {      
        const user = JSON.parse(await this.storage.getItem('user'));                
        const { token } = await FirebaseMessaging.getToken(); // este token es el que identifica al dispositivo, por si quisieramos enviar mensajes individualizados     
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
    }
    catch(error){
      console.error('Error al actualizar el token de Firebase: ', error);
    }
  }

  async updateLassAccessDate() {  
    try{        
      const user = JSON.parse(await this.storage.getItem('user'));                
      if(user!=null ){                 
        this.store.dispatch(new UpdateLassAccessDate({username:user.username})).subscribe({
          next: async () => {
            let success = this.store.selectSnapshot(UsersState.success);
            if(!success){                              
              this.toastService.presentToast("Error al actualizar la fecha de último acceso");                        
            }              
          } 
        })        
      }   
    }
    catch(error){
      console.error('Error al actualizar la fecha de último acceso: ', error);
    }
  }

  updateRemerberData(){
    if(this.rememberMe){
      this.storage.setItem('rememberMe', 'true');
      this.storage.setItem('username', this.auth.username);
      this.storage.setItem('password', this.auth.password);
    }
    else{
      this.storage.setItem('rememberMe', 'false');
      this.storage.setItem('username', '');
      this.storage.setItem('password', '');
    }
  }

  async login() {     
    
    await this.loadingService.presentLoading('Loading...');
    this.store.dispatch(new Login({auth:this.auth})).subscribe({
      next: async () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){         
          this.updateRemerberData();
          this.updateFirebaseToken();  
          this.updateLassAccessDate();
          this.auth.username=null;
          this.auth.password=null;
          this.redirectAfterLogin();          
        }
        else{
          // aqui dependiendo del tipo de error tendremos que hacer una cosa u otra, 
          // si es un 403, tengo que mostrar un formulario porque la password ha expirado, 
          // sino simplemente muestro el error que nos esta llegando     
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);
          if(errorStatusCode==403){
            this.toastService.presentToast("Debe actualizar el password actual");
            this.changePassword = new ChangePasswordDto();       
            this.showChangeExpiredPassword = true;            
          }
          else{
            this.toastService.presentToast(errorMessage);
          }                    
        }
        await this.loadingService.dismissLoading();
      } 
    })
  }

  volverLogin(event: Event) {       
    event.preventDefault(); // Previene el comportamiento predeterminado del enlace <a>
    this.showChangeExpiredPassword = false;
    this.showForgotPassword = false;
  }

  showForgotPasswordScreen(event: Event) {       
    event.preventDefault(); // Previene el comportamiento predeterminado del enlace <a>
    this.showChangeExpiredPassword = false;
    this.showForgotPassword = true;
  }

  async changeExpiredPassword() {         
    await this.loadingService.presentLoading('Loading...');
    this.changePassword.username = this.auth.username;
    this.store.dispatch(new UpdateUserPassword({user:this.changePassword})).subscribe({
      next: async () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){                              
          this.auth.username=null;
          this.auth.password=null;
          this.toastService.presentToast("Password actualizado correctamente");          
          this.showChangeExpiredPassword = false;
          this.showForgotPassword = false;
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);
          this.toastService.presentToast(errorMessage);                
        }
        await this.loadingService.dismissLoading();
      } 
    })
  }

  async doResetPassword() {         
    await this.loadingService.presentLoading('Loading...');    
    this.resetPassword.username = this.auth.username;
    this.store.dispatch(new ResetPassword({resetPassword:this.resetPassword})).subscribe({
      next: async () => {        
        let success = this.store.selectSnapshot(MusicianState.success);          
        if(success){                              
          this.auth.username=null;
          this.auth.password=null;
          this.toastService.presentToast("Password reseteado correctamente");          
          this.showChangeExpiredPassword = false;
          this.showForgotPassword = false;
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);
          this.toastService.presentToast(errorMessage);                
        }
        await this.loadingService.dismissLoading();
      } 
    })
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleNewRepeatPasswordVisibility() {
    this.showRepeatNewPassword = !this.showRepeatNewPassword;
  }

}

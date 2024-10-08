import { Component } from '@angular/core';
import { AuthDto } from '../../models/auth-dto';
import { Store } from '@ngxs/store';
import { ChangeExpiredPassword, Login, ResetPassword } from '../../state/users.actions';
import { UsersState } from '../../state/users.state';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ChangePasswordDto } from '../../models/change-password-dto';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ResetPasswordDto } from '../../models/reset-password-dto';

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
    const user = JSON.parse(await this.storage.getItem('user'));
    if(user){
      this.redirectAfterLogin();      
    }
    else{
      this.auth = new AuthDto();      
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
            this.storage.setItem('profile', 'SUPER_ADMIN');
            this.navController.navigateForward('tabs-super-admin/menu-musician');   
          }        
          else if(user.roles.includes('ADMIN')){
            this.storage.setItem('profile', 'ADMIN');
            this.navController.navigateForward('tabs-admin/menu-musician');   
          }
          else if(user.roles.includes('MUSICO')){
            this.storage.setItem('profile', 'MUSICO');
            this.navController.navigateForward('tabs-musician/menu-musician');   
          }
          else{
            this.storage.setItem('profile', 'INVITADO');
            this.navController.navigateForward('tabs-guest/tab1');   
          }
  }

  async login() {        
    await this.loadingService.presentLoading('Loading...');
    this.store.dispatch(new Login({auth:this.auth})).subscribe({
      next: async () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){                              
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
    this.store.dispatch(new ChangeExpiredPassword({changePassword:this.changePassword})).subscribe({
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
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){                              
          this.auth.username=null;
          this.auth.password=null;
          this.toastService.presentToast("Password reseteado correctamente");          
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

}

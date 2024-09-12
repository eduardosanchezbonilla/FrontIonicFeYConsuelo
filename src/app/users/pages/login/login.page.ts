import { Component, OnInit } from '@angular/core';
import { AuthDto } from '../../models/auth-dto';
import { InitState, Store } from '@ngxs/store';
import { /*CreateUser, GetUser,*/ Login } from '../../state/users.actions';
import { UsersState } from '../../state/users.state';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NavController } from '@ionic/angular';
import { User } from '../../models/user';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  public auth: AuthDto;
  //public showCreateForm: boolean;
  //public user: User;


  constructor(
      private store: Store,
      private toastService: ToastService,
      private navController: NavController,
      private storage: StorageService
  ) {
    this.auth = new AuthDto();
    //this.user = new User();
    //this.showCreateForm = false;
  }

  async ionViewWillEnter(){
    const user = JSON.parse(await this.storage.getItem('user'));
    if(user){
      this.navController.navigateForward('tabs/tab1');         
    }
    else{
      this.auth = new AuthDto();
      //this.showCreateForm = false;
    }
  }

  loginInvitado(event: Event) {       
    event.preventDefault(); // Previene el comportamiento predeterminado del enlace <a>
    this.auth.username = "invitado";
    this.auth.password = "invitado";
    this.login();
  }

  login() {        
    this.store.dispatch(new Login({auth:this.auth})).subscribe({
      next: async () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){                              
          this.auth.username=null;
          this.auth.password=null;
          this.toastService.presentToast("Logueado correctamente");
          
          // recogemos el usuario y segun el perfil redirigimos a un sitio u otro
          const user = JSON.parse(await this.storage.getItem('user'));                 
          if(user.roles.includes('ADMIN')){
            this.navController.navigateForward('tabs-admin/tab1');   
          }
          else if(user.roles.includes('MUSICO')){
            this.navController.navigateForward('tabs-musician/tab1');   
          }
          else{
            this.navController.navigateForward('tabs-guest/tab1');   
          }
        }
        else{
          this.toastService.presentToast("Usuario incorrecto");
        }
      } 
    })
  }

  /*createAccount() {    
    this.store.dispatch(new CreateUser({user:this.user})).subscribe({
      next: () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){
          this.toastService.presentToast("Usuario creado correctamente");
          this.auth.username = this.user.email;
          this.auth.password = this.user.password;
          this.login();
        }
        else{
          this.toastService.presentToast("Error al crear el usuario");
        }
      } 
    })
  }*/

  /*onShowCreateForm() {
    this.user = new User();
    this.user.genre = 'Hombre';
    this.showCreateForm = ! this.showCreateForm;
  }*/

}

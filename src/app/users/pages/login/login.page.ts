import { Component, OnInit } from '@angular/core';
import { AuthDto } from '../../models/auth-dto';
import { InitState, Store } from '@ngxs/store';
import { CreateUser, GetUser, Login } from '../../state/users.actions';
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
  public showCreateForm: boolean;
  public user: User;


  constructor(
      private store: Store,
      private toastService: ToastService,
      private navController: NavController,
      private storage: StorageService
  ) {
    this.auth = new AuthDto();
    this.user = new User();
    this.showCreateForm = false;
  }

  async ionViewWillEnter(){
    const user = JSON.parse(await this.storage.getItem('user'));
    if(user){
      this.navController.navigateForward('tabs/tab1');         
    }
    else{
      this.auth = new AuthDto();
      this.showCreateForm = false;
    }
  }

  login() {    
    this.store.dispatch(new Login({auth:this.auth})).subscribe({
      next: () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){          
          this.store.dispatch(new GetUser({email:this.auth.email})).subscribe({
            next: () => {
              success = this.store.selectSnapshot(UsersState.success);
              if(success){
                this.auth.email=null;
                this.auth.password=null;
                this.toastService.presentToast("Logueado con exito");
                this.navController.navigateForward('tabs/tab1');                
              }
              else{
                this.toastService.presentToast("Ha habido un error al obtener le usuario");
              }
            }
          })
        }
        else{
          this.toastService.presentToast("Usuario incorrecto");
        }
      } 
    })
  }

  createAccount() {    
    this.store.dispatch(new CreateUser({user:this.user})).subscribe({
      next: () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){
          this.toastService.presentToast("Usuario creado correctamente");
          this.auth.email = this.user.email;
          this.auth.password = this.user.password;
          this.login();
        }
        else{
          this.toastService.presentToast("Error al crear el usuario");
        }
      } 
    })
  }

  onShowCreateForm() {
    this.user = new User();
    this.user.genre = 'Hombre';
    this.showCreateForm = ! this.showCreateForm;
  }

}

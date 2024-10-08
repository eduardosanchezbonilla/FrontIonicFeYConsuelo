import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { AuthDto } from '../models/auth-dto';
import { ChangePasswordDto } from '../models/change-password-dto';
import { Store } from '@ngxs/store';
import { MenuController, NavController } from '@ionic/angular';
import { Logout } from '../state/users.actions';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ResetPasswordDto } from '../models/reset-password-dto';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private store: Store,
    private navController: NavController,
    private menuController: MenuController,
    private toast:ToastService
  ) { }

  logout(message: string = null) {
    if(message!=null){
      this.toast.presentToast(message);
    }
    this.store.dispatch(new Logout());
    this.menuController.close("content");
    this.navController.navigateForward('login');    
  }

  login(auth:AuthDto){
    return Http.post(
      {
        url:environment.host + '/auth/login',
        params:{},
        data:auth,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async response => {
      if(response.status==200){
        const data = await response.data;      
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al logar al usuario'
        });
      }      
    })
    .catch((error) => {      
      return Promise.reject(error);
    });
  }

  changeExpiredPassword(changeExpiredPassword: ChangePasswordDto){    
    return Http.put(
      {
        url:environment.host + '/musician/'+changeExpiredPassword.username + '/change-expired-password',
        params:{},
        data: changeExpiredPassword,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async response => {
      if(response.status==200){
        const data = await response.data;      
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al actualizar el password'
        });
      }      
    })
    .catch((error) => {      
      return Promise.reject(error);
    });
  }

  resetPassword(resetPassword: ResetPasswordDto){    
    return Http.put(
      {
        url:environment.host + '/musician/'+resetPassword.username + '/reset-password',
        params:{},
        data: {},
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async response => {
      if(response.status==200){
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al resetear el password'
        });
      }      
    })
    .catch((error) => {      
      return Promise.reject(error);
    });
  }

}

import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { AuthDto } from '../../models/user/auth-dto';
import { ChangePasswordDto } from '../../models/user/change-password-dto';
import { Store } from '@ngxs/store';
import { MenuController, NavController } from '@ionic/angular';
import { Logout } from '../../state/user/users.actions';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ResetPasswordDto } from '../../models/user/reset-password-dto';
import { UpdateFirebaseTokenDto } from 'src/app/models/user/update-firebase-token-dto';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private store: Store,
    private navController: NavController,
    private menuController: MenuController,
    private toast:ToastService,
    private storage:StorageService
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

  async updateFirebaseToken(updateFirebaseToken: UpdateFirebaseTokenDto){    
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/user/'+updateFirebaseToken.username + '/firebase-token',
        params:{},
        data: updateFirebaseToken,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
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
          message: response.data?.message || 'Error al actualizar el firebase token del usuario'
        });
      }      
    })
    .catch((error) => {      
      return Promise.reject(error);
    });
  }

}
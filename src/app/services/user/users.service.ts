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
import { UserGroupByRole } from 'src/app/models/user/user-group-by-role';
import { Role } from 'src/app/models/role/role';
import { UserRequest } from 'src/app/models/user/user-request';

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

  async resetPasswordUser(resetPassword: ResetPasswordDto){    
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/user/'+resetPassword.username + '/reset',
        params:{},
        data: resetPassword,        
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

  async updateLassAccessDate(username: string){    
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/user/'+username + '/last-date-access',
        params:{},
        data: {},
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
          message: response.data?.message || 'Error al actualizar el la ultima fecha de acceso del usuario'
        });
      }      
    })
    .catch((error) => {      
      return Promise.reject(error);
    });
  }

  async getUsersGroupByRole(filter:string){    
    const token = await this.storage.getItem('token');        
    return Http.get(
      {
        url:environment.host + '/user/group-by-role',
        params:{'filter':filter},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {            
      const newToken = response.headers['Authorization'] || response.headers['authorization'];      
      if(newToken){             
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }    
      if(response.status==200 || response.status==204){
        const data = await response.data as UserGroupByRole[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de usuarios'
        });
      }   
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async getAllRoles(){    
    const token = await this.storage.getItem('token');        
    return Http.get(
      {
        url:environment.host + '/role/all',
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {            
      const newToken = response.headers['Authorization'] || response.headers['authorization'];      
      if(newToken){             
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }    
      if(response.status==200 || response.status==204){
        const data = await response.data as Role[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de roles'
        });
      }   
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async createUser(user:UserRequest){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/user',
        params:{},
        data:user,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      const newToken = response.headers['Authorization'] || response.headers['authorization'];
      if(newToken){            
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }
      if(response.status==201){        
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al crear el musico'
        });
      }      
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async deleteUser(username:string){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/user/'+ username,
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      const newToken = response.headers['Authorization'] || response.headers['authorization'];
      if(newToken){                
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }
      if(response.status==200){
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al eliminar el usuario'
        });
      }    
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async updateUserDetail(user:UserRequest){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/user/' + user.username + '/detail',
        params:{},
        data:user,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      const newToken = response.headers['Authorization'] || response.headers['authorization'];
      if(newToken){            
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }
      if(response.status==200){        
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al modificar los detalles del usuario'
        });
      }      
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async updateUserRoles(user:UserRequest){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/user/' + user.username + '/roles',
        params:{},
        data:user,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      const newToken = response.headers['Authorization'] || response.headers['authorization'];
      if(newToken){            
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }
      if(response.status==200){        
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al modificar los roles del usuario'
        });
      }      
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }


}

import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { AuthDto } from '../models/auth-dto';
import { StorageService } from 'src/app/services/storage/storage.service';
import { User } from '../models/user';

@Injectable()
export class UsersService {

  constructor(private storage:StorageService) { }

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
    ).then(async response => {
      if(response.status==201){
        const data = await response.data;
        return data;
      }
      return null;
    })
  }

  async getUser(email:string){
    const token = await this.storage.getItem('token');
    return Http.get({
      url: environment.host + '/users',
      params: {email},
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }).then(async response => {
      if(response.status==200){
        const data = await response.data;
        return data;
      }
      return null;
    })
  }

  createUser(user:User){
    return Http.post(
      {
        url:environment.host + '/users',
        params:{},
        data:user,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(async response => {
      if(response.status==201){
        const data = await response.data;
        return data;
      }
      return null;
    })
  }

  async deleteUser(idUser:string){
    const token = await this.storage.getItem('token');
    return Http.del({
      url: environment.host + '/users/' + idUser,
      params: {},
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }).then(async response => {
      if(response.status==200){
        const data = await response.data as boolean;
        return data;
      }
      return null;
    })
  }


}

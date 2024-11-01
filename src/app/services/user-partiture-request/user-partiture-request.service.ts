import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { UserRequestPartitureRequest } from 'src/app/models/user-partiture-request/user-request-partiture-request';
import { UserRequestPartitureGroupByUserResponse } from 'src/app/models/user-partiture-request/user-request-partiture-group-by-user-response';

@Injectable()
export class UserPartitureRequestService {

  constructor(private storage:StorageService) { }

  async createUserPartitureRequest(userPartitureRequest:UserRequestPartitureRequest){
    const token = await this.storage.getItem('token');    
    return Http.post(
      {
        url:environment.host + '/user/' + userPartitureRequest.username + '/partiture/request',
        params:{},
        data:userPartitureRequest,
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
          message: response.data?.message || 'Error al generar la peticion de partituras'
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

  async getAllUserRequestPartitureGroupByUser(all: Boolean){    
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/user/partiture/request/all',
        params:{all: all.toString()},
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
        return await response.data as UserRequestPartitureGroupByUserResponse[];        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener las solicitudes de partituras'
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

  async markReadUnreadNotificationMessage(userRequestPartitureRequest:UserRequestPartitureRequest){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/user/' + userRequestPartitureRequest.username + '/partiture/request',
        params:{},
        data:userRequestPartitureRequest,
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
          message: response.data?.message || 'Error al marcar/desmarcar como leida la solicitud de partituras'
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


import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { NotificationUserTokenResponseDto } from 'src/app/models/notification/NotificationUserTokenResponseDto';
import { NotificationRequestDto } from 'src/app/models/notification/NotificationRequestDto';
import { NotificationTopicResponseDto } from 'src/app/models/notification/NotificationTopicResponseDto';

@Injectable()
export class NotificationService {

  constructor(private storage:StorageService) { }

  async sendNotification(notificationRequest:NotificationRequestDto){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/notification',
        params:{},
        data:notificationRequest,
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
          message: response.data?.message || 'Error al enviar la notificacion'
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

  async getNotificationUserTokens(){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/notification/tokens',
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
        const data = await response.data as NotificationUserTokenResponseDto[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener los tokens de firebase asociados a los usuarios'
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

  async getNotificationTopics(){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/notification/topics',
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
        const data = await response.data as NotificationTopicResponseDto[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener los topics de firebase'
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


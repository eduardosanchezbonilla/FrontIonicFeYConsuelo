import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { SuggestionBoxRequest } from 'src/app/models/suggestion-box/suggestion-box-request';
import { SuggestionBoxGroupByUserResponse } from 'src/app/models/suggestion-box/suggestion-box-group-by-user-response';

@Injectable()
export class SuggestionBoxService {

  constructor(private storage:StorageService) { }

  async creatSuggestionBox(suggestionBoxRequest:SuggestionBoxRequest){
    const token = await this.storage.getItem('token');    
    return Http.post(
      {
        url:environment.host + '/suggestion-box',
        params:{},
        data:suggestionBoxRequest,
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
          message: response.data?.message || 'Error al enviar el mensaje al buzon'
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

  async getAllSuggestionBoxGroupByUser(all: Boolean){    
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/suggestion-box/all',
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
      if(response.status==200){        
        return await response.data as SuggestionBoxGroupByUserResponse[];        
      }
      else if(response.status==204){        
        return [];        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener los mensajes del buzón de sugerencias'
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

  async markReadUnread(suggestionBoxRequest:SuggestionBoxRequest){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/suggestion-box',
        params:{},
        data:suggestionBoxRequest,
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
          message: response.data?.message || 'Error al marcar/desmarcar como leido el mensaje del buzón'
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


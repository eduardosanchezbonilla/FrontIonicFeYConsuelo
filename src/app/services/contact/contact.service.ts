import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { ContactRequest } from 'src/app/models/contact/contact-request';
import { ContactResponse } from 'src/app/models/contact/contact-response';

@Injectable()
export class ContactService {

  constructor(private storage:StorageService) { }

  async createContactRequest(contactRequest:ContactRequest){
    const token = await this.storage.getItem('token');    
    return Http.post(
      {
        url:environment.host + '/contact-request',
        params:{},
        data:contactRequest,
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
          message: response.data?.message || 'Error al enviar la peticion de contacto'
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

  async getAllContactRequest(all: Boolean){    
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/contact-request/all',
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
        return await response.data as ContactResponse[];        
      }
      else if(response.status==204){        
        return [];        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener las peticiones de contacto'
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

  async markReadUnread(contactRequest:ContactRequest){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/contact-request',
        params:{},
        data:contactRequest,
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
          message: response.data?.message || 'Error al marcar/desmarcar como leido la peticion de contacto'
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


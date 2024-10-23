import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { UserPartitureGroup } from 'src/app/models/user-partiture-group/user-partiture-group';

@Injectable()
export class UserPartitureGroupService {

  constructor(private storage:StorageService) { }

  async createUserPartitureGroup(userPartitureGroup:UserPartitureGroup){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/user/' + userPartitureGroup.username + '/partiture-group/'+ userPartitureGroup.id,
        params:{},
        data:{},
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
          message: response.data?.message || 'Error al asociar el grupo de partituras al usuario'
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

  async getUserPartitureGroups(username: string){    
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/user/' + username + '/partiture-group',
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
        return await response.data as UserPartitureGroup[];        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de grupos de partituras del usuario'
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

  async deleteUserPartitureGroup(userPartitureGroup:UserPartitureGroup){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/user/' + userPartitureGroup.username + '/partiture-group/'+ userPartitureGroup.id,        
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
          message: response.data?.message || 'Error al desasociar el grupo de partituras al usuario'
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


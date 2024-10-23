import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { UserPartitureGroup } from 'src/app/models/user-partiture-group/user-partiture-group';
import { MusicianInventory } from 'src/app/models/musician-inventory/musician-inventory';
import { Musician } from 'src/app/models/musician/musician';

@Injectable()
export class MusicianInventoryService {

  constructor(private storage:StorageService) { }

  async createMusicianInventory(musicianInventory:MusicianInventory){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/musician/' + musicianInventory.musicianId + '/inventory/'+ musicianInventory.id,
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
          message: response.data?.message || 'Error al asociar el elemento de inventario al musico'
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

  async deleteMusicianInventory(musicianInventory:MusicianInventory){
    const token = await this.storage.getItem('token');
    return Http.del(
      {        
        url:environment.host + '/musician/' + musicianInventory.musicianId + '/inventory/'+ musicianInventory.id,
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
          message: response.data?.message || 'Error al desasociar el elemento de inventario al musico'
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

  async getMusicianInventories(musicianId: number){        
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/musician/' + musicianId + '/inventory',
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
        return await response.data as MusicianInventory[];        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de elementos de inventario asociados al musico'
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

  async getMusiciansWithInventoryAssociated(inventoryId: number){    
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/inventory/' + inventoryId + '/musician',
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
      if(response.status==200 ){        
        return await response.data as Musician[];        
      }
      else if(response.status==204){
        let musician = new Musician("No existen musicos con este elemento de inventario");      
        return await [musician];   
      }      
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de musicos con el elemento de inventario asociado'
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


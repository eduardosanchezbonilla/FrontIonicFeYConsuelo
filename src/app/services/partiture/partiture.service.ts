import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { Partiture } from 'src/app/models/partiture/partiture';

@Injectable()
export class PartitureService {

  constructor(private storage:StorageService) { }

  
  async downloadPartiture(partitureGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {        
        url:environment.host + '/partiture/'+ partitureGoogleId + "/download",
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
        return await response.data as Partiture;        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al descargar la partitura'
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

  async getPartitures(partitureGroupGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/partiture/'+ partitureGroupGoogleId,
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
        const data = await response.data as Partiture[];
        return data;
      }
      else{           
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de partituras'
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


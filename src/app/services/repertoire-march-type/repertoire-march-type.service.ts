import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { RepertoireMarchType } from 'src/app/models/repertoire-march-type/repertoire-march-type';

@Injectable()
export class RepertoireMarchTypeService {

  constructor(private storage:StorageService) { }

  async createRepertoireMarchType(repertoireMarchType:RepertoireMarchType){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/repertoire-march-type',
        params:{},
        data:repertoireMarchType,
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
          message: response.data?.message || 'Error al crear el tipo de marcha de repertorio'
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

  async updateRepertoireMarchType(id:number, repertoireMarchType:RepertoireMarchType){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/repertoire-march-type/'+ id,
        params:{},
        data:repertoireMarchType,
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
          message: response.data?.message || 'Error al modificar el tipo de marcha de repertorio'
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

  async getRepertoireMarchTypes(){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/repertoire-march-type',
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
        const data = await response.data as RepertoireMarchType[];
        return data;
      }
      else if(response.status==204){      
        return [];        
      }      
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de tipos de marchas de repertorio'
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

  async deleteRepertoireMarchType(repertoireMarchTypeId:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/repertoire-march-type/'+ repertoireMarchTypeId,
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
          message: response.data?.message || 'Error al eliminar el tipo de marcha de repertorio'
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


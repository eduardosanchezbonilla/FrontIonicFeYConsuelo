import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { RepertoireMarchGroupByType } from 'src/app/models/repertoire/repertoire-march-group-by-type';

@Injectable()
export class RepertoireMarchService {

  constructor(private storage:StorageService) { }

  async createRepertoireMarch(repertoireMarch:RepertoireMarch){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/repertoire-march',
        params:{},
        data:repertoireMarch,
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
          message: response.data?.message || 'Error al crear la marcha de repertorio'
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

  async updateRepertoireMarch(id:number, repertoireMarch:RepertoireMarch){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/repertoire-march/'+ id,
        params:{},
        data:repertoireMarch,
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
          message: response.data?.message || 'Error al modificar la marcha de repertorio'
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

  async getRepertoireMarchs(){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/repertoire-march',
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
        const data = await response.data as RepertoireMarch[];
        return data;
      }
      else if(response.status==204){      
        return [];        
      }      
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de marchas de repertorio'
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

  async deleteRepertoireMarch(repertoireMarchId:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/repertoire-march/'+ repertoireMarchId,
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
          message: response.data?.message || 'Error al eliminar la marcha de repertorio'
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

  async getCategoryRepertoireMarchsGroupByType(categoryId:number, name:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/repertoire-march/'+ categoryId + '/group-by-type',
        params:{
          name:name
        },
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
        const data = await response.data as RepertoireMarchGroupByType[];
        return data;
      }
      else if(response.status==204){      
        return [];        
      }      
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de marchas de repertorio'
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

  async getRepertoireMarchsGroupByType( name:string, current:boolean){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/repertoire-march/group-by-type',
        params:{
          name:name,
          current:current+""
        },
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
        const data = await response.data as RepertoireMarchGroupByType[];
        return data;
      }
      else if(response.status==204){      
        return [];        
      }      
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de marchas de repertorio'
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


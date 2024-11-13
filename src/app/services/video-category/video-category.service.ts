import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { VideoCategory } from 'src/app/models/video-category/video-category';

@Injectable()
export class VideoCategoryService {

  constructor(private storage:StorageService) { }

  async createVideoCategory(videoCategory:VideoCategory){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/video-category',
        params:{},
        data:videoCategory,
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
        const data = await response.data as VideoCategory;
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al crear la categoria de videos'
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

  async updateVideoCategory(id:number, videoCategory:VideoCategory){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/video-category/'+ id,
        params:{},
        data:videoCategory,
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
          message: response.data?.message || 'Error al modificar la categoria de videos'
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

  async getVideoCategories(){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/video-category',
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
        const data = await response.data as VideoCategory[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de categorias de videos'
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

  async deleteVideoCategory(videoCategoryId:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/video-category/'+ videoCategoryId,
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
          message: response.data?.message || 'Error al eliminar la categoria de videos'
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


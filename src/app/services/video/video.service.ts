import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { Video } from 'src/app/models/video/video';
import { VideoGroupByCategory } from 'src/app/models/video/video-group-by-category';

@Injectable()
export class VideoService {

  constructor(private storage:StorageService) { }

  async createVideo(video:Video){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/video',
        params:{},
        data:video,
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
          message: response.data?.message || 'Error al crear el video'
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

  
  async getVideosGroupByCategory(name:string){    
    const token = await this.storage.getItem('token');        
    return Http.get(
      {
        url:environment.host + '/video/group-by-category',
        params:{'name':name},
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
        const data = await response.data as VideoGroupByCategory[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de videos'
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

  async deleteVideo(videoId:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/video/'+ videoId,
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
          message: response.data?.message || 'Error al eliminar el video'
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

  async updateVideo(id:number, video:Video){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/video/'+ id,
        params:{},
        data:video,
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
          message: response.data?.message || 'Error al modificar el video'
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


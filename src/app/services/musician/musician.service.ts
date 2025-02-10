import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Musician } from '../../models/musician/musician';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { MusicianGroupByVoice } from '../../models/musician/musician-group-by-voice';
import { ResetPasswordDto } from 'src/app/models/user/reset-password-dto';

@Injectable()
export class MusicianService {

  constructor(private storage:StorageService) { }

  async createMusician(musician:Musician){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/musician',
        params:{},
        data:musician,
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
        const data = await response.data as Musician;
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al crear el musico'
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

  async getMusicians(){
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/musician',
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
        const data = await response.data as Musician[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de musicos'
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

  async getMusiciansGroupByVoice(name:string,unregistred:boolean){    
    const token = await this.storage.getItem('token');        
    return Http.get(
      {
        url:environment.host + '/musician/group-by-voice',
        params:{
          'name':name,
          'unregistred':unregistred.valueOf().toString()
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
      if(response.status==200 || response.status==204){
        const data = await response.data as MusicianGroupByVoice[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de musicos'
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

  async deleteMusician(musicianId:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/musician/'+ musicianId,
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
          message: response.data?.message || 'Error al eliminar el musico'
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

  async updateMusician(id:number, musician:Musician){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/musician/'+ id,
        params:{},
        data:musician,
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
        const data = await response.data as Musician;
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al modificar el musico'
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

  resetPassword(resetPassword: ResetPasswordDto){    
    return Http.put(
      {
        url:environment.host + '/musician/'+resetPassword.username + '/reset-password',
        params:{},
        data: {},
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async response => {
      if(response.status==200){
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al resetear el password'
        });
      }      
    })
    .catch((error) => {      
      return Promise.reject(error);
    });
  }

  async getMusicianFromDni(dni:string){
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/musician/dni/'+dni,
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
        const data = await response.data as Musician;
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el musico a partir de su dni'
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


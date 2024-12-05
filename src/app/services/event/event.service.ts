import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { Event } from 'src/app/models/event/event';

@Injectable()
export class EventService {

  constructor(private storage:StorageService) { }

  async createEvent(event:Event){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/event',
        params:{},
        data:event,
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
          message: response.data?.message || 'Error al crear el evento'
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

  async getEvents(startDate:string, endDate:string){
    
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/event',
        params:{
          'startDate':startDate,
          'endDate':endDate
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
        const data = await response.data as Event[];
        return data;
      }
      else if(response.status==204){
        return [];
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de eventos'
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
  
  async deleteEvent(eventType:string,eventId:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/event/'+ eventType + '/'+ eventId,
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
          message: response.data?.message || 'Error al eliminar el evento'
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
  
  async updateEvent(eventType:string,eventId:number, event:Event){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/event/'+ eventType + '/'+ eventId,
        params:{},
        data:event,
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
          message: response.data?.message || 'Error al modificar el evento'
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


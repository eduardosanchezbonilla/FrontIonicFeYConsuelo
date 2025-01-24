import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { Event } from 'src/app/models/event/event';
import { EventMusicianAssistance } from 'src/app/models/event/event-musician-assistance';
import { EventGroupByAnyo } from 'src/app/models/event/event-group-by-anyo';
import { EventRepertoire } from 'src/app/models/event/event-repertoire';
import { EventReportAssistance } from 'src/app/models/event/event-report-assistance';
import { EventListResponse } from 'src/app/models/event/event-list-response';

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
        const data = await response.data as EventListResponse;
        return data;
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

  async getEventMusicianAssistance(eventType:string,eventId:number){
    
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/event/'+ eventType + '/'+ eventId+ '/musicianAssistance',
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
        const data = await response.data as EventMusicianAssistance;
        return data;
      }
      else if(response.status==204){
        return null;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de musicos asociados al evento'
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

  async getEventsGroupByAnyo(eventType:string,startDate:string, endDate:string, name: string){
    
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/event/group-by-anyo',
        params:{
          'eventType':eventType,
          'startDate':startDate,
          'endDate':endDate,
          'name':name
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
        const data = await response.data as EventGroupByAnyo[];
        return data;
      }
      else if(response.status==204){
        return [];
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de eventos agrupados por anyo'
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

  async getEventRepertoire(eventType:string,eventId:number){
    
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/event/'+ eventType + '/'+ eventId+ '/repertoire',
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
        const data = await response.data as EventRepertoire;
        return data;
      }
      else if(response.status==204){
        return null;
      }
      else{                     
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el repertorio asociado al evento'
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

  async getEventReportAssistance(eventType:string,eventId:number){
    
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/event/'+ eventType + '/'+ eventId+ '/report/assistance',
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
        const data = await response.data as EventReportAssistance;
        return data;
      }
      else if(response.status==204){
        return null;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el informe de asistencia al evento'
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

  async getEvent(eventType:string,eventId:number){
    
    const token = await this.storage.getItem('token');
    return Http.get(
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
        const data = await response.data as Event;
        return data;
      }
      else if(response.status==204){
        return null;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el evento'
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


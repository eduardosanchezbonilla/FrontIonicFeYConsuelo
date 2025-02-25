import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import { ToastService } from 'src/app/services/toast/toast.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { RouteEvent } from 'src/app/models/route-event/route-event';
import { LatLng } from 'src/app/models/route-event/latLng';
import { GetEvent, ResetEvent, UpdateEventCurrentPosition, UpdateEventRoute } from 'src/app/state/event/event.actions';
import { Event } from 'src/app/models/event/event';
import { Store } from '@ngxs/store';
import { EventState } from 'src/app/state/event/event.state';
import { UsersService } from 'src/app/services/user/users.service';


@Component({
  selector: 'app-modal-route-event',
  templateUrl: './modal-route-event.component.html',
  styleUrls: ['./modal-route-event.component.scss'],
})
export class ModalRouteEventComponent implements OnInit, AfterViewInit {

  @Input() event: Event;
  @Input() date: string;
  @Input() type: string;

  public profile: string;  
  map: L.Map;
  userMarker: L.Marker;
  zoomLevel = 17;
  mapCenterLat : number = 37.7191055;
  mapCenterLng : number = -3.9737003;
  kilometersRoute = 0;

  serverUrl = 'https://tu-servidor.com/api/recorridos';
  trackingMarker!: L.Marker;
  drawnItems: L.FeatureGroup;
  markerGroup: L.LayerGroup;

  trackingInterval: any;
  timeInterval:number = 5000;
  trackingSending = false;  

  cicleMarkerStyle = { // Configuración para los CircleMarker
    color: '#0000FF', // Color del círculo (rojo)
    weight: 2, // Borde del círculo
    opacity: 1, // Opacidad del borde
    fillColor: '#0000FF', // Color de relleno
    fillOpacity: 0.5, // Opacidad del relleno
    radius: 6, // Radio en píxeles
  };

  routeStyle = {
    color: '#191970', // Color primario de Ionic (puedes cambiarlo)
    weight: 4, // Grosor de la línea
    opacity: 1,
  };

  redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [20, 33],       // Tamaño reducido del icono
    iconAnchor: [10, 33],     // Ajusta el anclaje para que la punta esté en la posición correcta
    popupAnchor: [1, -28],    // Ajusta el anclaje del popup
    shadowSize: [33, 33]
  });

  blueIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [20, 33],       // Tamaño reducido del icono
    iconAnchor: [10, 33],     // Ajusta el anclaje para que la punta esté en la posición correcta
    popupAnchor: [1, -28],    // Ajusta el anclaje del popup
    shadowSize: [33, 33]
  });

  public initScreen = false;
  public initSearchFinish = false;

  detailEvent: Event;

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,    
    private modalController: ModalController,  
    private toast:ToastService,
    private storage: StorageService,
    private store:Store,
    private userService: UsersService,
    private alertController: AlertController
  ) { 
    this.drawnItems = new L.FeatureGroup(); // Inicializa el FeatureGroup

    const DefaultIcon = L.icon({
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  
    // Asignar el icono corregido globalmente
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  async ngOnInit() {       
    this.profile = await this.storage.getItem('profile');            
  }

  ngAfterViewInit() {    
    this.getEvent();    
  }
  
  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish ){
      await this.loadingService.dismissLoading();         
    }
  }

  async ionViewDidEnter(){
    this.initScreen = true;    
    this.dismissInitialLoading();    
  }

  ngOnDestroy() {      
    this.doDestroy();
  }
  
  async ionViewDidLeave(){    
    this.doDestroy();
  }

  private doDestroy(){
    this.stopSendingPosition();
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })                     
  }  

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  async getEvent(){    
    this.store.dispatch(new GetEvent({eventType:this.event.type,eventId: this.event.id}))
      .subscribe({
        next: async ()=> {
          const finish = this.store.selectSnapshot(EventState.finish);          
          const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
          
          if(finish){                        
            if(errorStatusCode==200){                                        
              this.detailEvent = this.store.selectSnapshot(EventState.event);              
              if(this.detailEvent.route){                
                this.zoomLevel = this.detailEvent.route.zoomLevel;
                this.mapCenterLat  = this.detailEvent.route.center.lat;
                this.mapCenterLng  = this.detailEvent.route.center.lng;                
              }
              else{
                this.zoomLevel = 17;
                this.mapCenterLat  = 37.7191055;
                this.mapCenterLng  = -3.9737003;              
              }              
            }
            else{
              this.detailEvent=null;
              // sino encontramos ruta, cogemos valores por defecto
              this.zoomLevel = 17;
              this.mapCenterLat  = 37.7191055;
              this.mapCenterLng  = -3.9737003;              
            }     
            this.loadMap();         
            this.initSearchFinish = true;                                              
            this.dismissInitialLoading();                 
          }      
        }
      }
    )
  }

  async loadMap() {
    try {
      const coords = L.latLng(this.mapCenterLat, this.mapCenterLng);

      // mapOptionas
      let zoomControl = true;
      let polyline:any =  {
                          shapeOptions: this.routeStyle,
                        };
      let edit = {
        featureGroup: this.drawnItems, // Referencia al FeatureGroup   
        remove:true     
      };

      let circlemarker:any= this.cicleMarkerStyle;

      if(this.profile!=='SUPER_ADMIN' && this.profile!=='ADMIN'){
        polyline = false;
        edit = null;  
        circlemarker = false;
      }

      // Inicializar el mapa centrado en Jaén
      this.map = L.map(
          'map', 
          {
            zoomControl: zoomControl
          }
        )
        .setView(coords, this.zoomLevel);

      // Añadir capa de mapa (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      // Añadir marcador en Jaén (opcional)
      //L.marker(coords).addTo(this.map).openPopup();

      // Forzar la actualización del mapa después de un pequeño retraso
      setTimeout(() => {
        this.map.invalidateSize(); // Esto asegura que el mapa se renderice correctamente
      }, 200);

      // Si el usuario es super administrador, habilitar el dibujo de rutas
      //if (this.isAdmin) {
      const drawControl = new (L as any).Control.Draw({
        draw: {
          polygon: false,                  
          circle: false,
          rectangle: false,
          marker: false,
          polyline: polyline,  
          circlemarker: circlemarker
        },
        edit: edit
      });
      this.map.addControl(drawControl);
      this.map.addLayer(this.drawnItems); // Añadir el FeatureGroup al mapa
      this.markerGroup = L.layerGroup().addTo(this.map);

      this.loadRoute();

      this.loadCurrentPosition();

      // Detectar cambios en el zoom
      this.map.on('zoomend', () => {
        this.zoomLevel = this.map.getZoom();        
      });

      // Detectar cambios en el centro del mapa
      this.map.on('moveend', () => {
        const center = this.map.getCenter();
        this.mapCenterLat = center.lat;
        this.mapCenterLng = center.lng;        
      });

      // Escuchar eventos de dibujo
      this.map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        this.drawnItems.addLayer(layer); // Añadir la ruta al FeatureGroup
        this.calculateDistanceRoute();
      });      
    } catch (error) {
      console.error('Error inicializando el mapa:', error);
    }
  }

  loadCurrentPosition() {    
    if (this.detailEvent && this.detailEvent.currentPosition && this.detailEvent.currentPosition.lat && this.detailEvent.currentPosition.lng) {    
      this.drawCurrentPosition(this.detailEvent.currentPosition.lat, this.detailEvent.currentPosition.lng,this.redIcon);      
    }
    
  }

  drawCurrentPosition(lat:number, lng:number, icon: L.Icon, clean:boolean = true) {       
      // limpiamos todos los que haya 
      if(clean){
        this.markerGroup.clearLayers();
      }

      if(lat && lng){
        const coords = L.latLng(lat, lng);
        L.marker(coords, { icon: icon })
          .addTo(this.markerGroup)
          .openPopup();
      }      
  }

  loadRoute(){    
    if (this.detailEvent && this.detailEvent.route.route && this.detailEvent.route.route.length > 0) {
      const latLngs: L.LatLng[] = this.detailEvent.route.route.map((p: any) => L.latLng(p.lat, p.lng));
      
      // Si hay puntos en la ruta, dibujamos una sola línea
      if (latLngs.length > 1) {  
          const polyline = L.polyline(
            latLngs, 
            this.routeStyle
          ).addTo(this.map);
          this.drawnItems.addLayer(polyline);
      }
    }

    if (this.detailEvent && this.detailEvent.route.circles && this.detailEvent.route.circles.length > 0) {
      this.detailEvent.route.circles.forEach((circle: any) => {
        const objcircle = L.circleMarker(
          [circle.lat, circle.lng], 
          this.cicleMarkerStyle
        ).addTo(this.map);
        this.drawnItems.addLayer(objcircle); // Agregar a la capa de dibujo
      });
    }

    this.calculateDistanceRoute();
  }

  // Guardar recorrido en el backend
  async saveRoute() {
    const layers = this.drawnItems.getLayers();
    
    // Obtener coordenadas del recorrido
    const route: any[] = [];
    const circles: any[] = [];
    layers.forEach((layer) => {
      if (layer instanceof L.Polyline) {
        const coords = layer.getLatLngs().map((p: any) => ({
          lat: p.lat,
          lng: p.lng,
        }));
        coords.forEach((c: any) => route.push(c));
        //route.push(coords);
      } else if (layer instanceof L.CircleMarker) {
        const coord = layer.getLatLng();
        circles.push({ lat: coord.lat, lng: coord.lng });
      }
    });

    let routeEvent = new RouteEvent(
      new LatLng(this.mapCenterLat, this.mapCenterLng),
      this.zoomLevel,
      route,
      circles
    );

    await this.loadingService.presentLoading('Loading...');   
    
    this.store.dispatch(new UpdateEventRoute({eventType: this.type, eventId: this.event.id, routeEvent: routeEvent}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Ruta actualizada correctamente");                   
            await this.loadingService.dismissLoading();      
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();      
              this.cancel();         
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              await this.loadingService.dismissLoading();      
              this.toast.presentToast(errorMessage);
            }                
          }          
        }
      }
    )   
  }

  async sendLocation() {
    const position = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = position.coords;

    let latLng = new LatLng(latitude, longitude);

    this.updateCurrentPosition(latLng);   
  }

  async cleanLocation() {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la posición actual?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              let latLng = new LatLng();
              this.updateCurrentPosition(latLng);
            }
          }
        ]
    });
    alert.present();    
  }

  async updateCurrentPosition(latLng: LatLng) {
    
    await this.loadingService.presentLoading('Loading...');   
    
    this.store.dispatch(new UpdateEventCurrentPosition({eventType: this.type, eventId: this.event.id, latLng: latLng}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Posicion actualizada correctamente");   
            this.drawCurrentPosition(latLng.lat, latLng.lng, this.redIcon);                
            await this.loadingService.dismissLoading();      
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();      
              this.cancel();         
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              await this.loadingService.dismissLoading();      
              this.toast.presentToast(errorMessage);
            }                
          }          
        }
      }
    )   
  }

  // Limpiar el recorrido del mapa
  async cleanRoute() {    
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la ruta?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.drawnItems.clearLayers();
            }
          }
        ]
    });
    alert.present();        
  }

  // Método para buscar una ubicación
  searchLocation() {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const query = searchInput.value;

    if (query) {
      this.http
        .get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .subscribe((response: any) => {
          if (response.length > 0) {
            const location = response[0]; // Tomar la primera coincidencia
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);

            // Centrar el mapa en la ubicación encontrada
            this.map.setView([lat, lng], this.zoomLevel);

            // Añadir un marcador en la ubicación encontrada
            this.drawCurrentPosition(lat, lng, this.blueIcon, false);            
          } else {
            alert('Ubicación no encontrada');
          }
        });
    }
  }

  calculateDistanceRoute() {
    const layers = this.drawnItems.getLayers();
    let distance = 0;
  
    layers.forEach((layer) => {
      if (layer instanceof L.Polyline) {
        const latLngs = layer.getLatLngs() as L.LatLng[];
  
        for (let i = 0; i < latLngs.length - 1; i++) {
          distance += latLngs[i].distanceTo(latLngs[i + 1]); // Calcula la distancia entre puntos consecutivos
        }
      }
    });
      
    this.kilometersRoute = parseFloat((distance / 1000).toFixed(2));    
  }

  startSendingPosition() {
    // Inicia un intervalo para enviar la posición cada 5 segundos
    this.trackingSending = true;
    this.trackingInterval = setInterval(() => {
      // Lógica para enviar la posición, por ejemplo:
      console.log("enviamos posicion");
      this.sendLocation();
    }, this.timeInterval);
  }
  
  stopSendingPosition() {
    this.trackingSending = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }
}


import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { User } from '../models/user/user';
import { StorageService } from '../services/storage/storage.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs-guest',
  templateUrl: './tabs-guest.page.html',
  styleUrls: ['./tabs-guest.page.scss'],
})
export class TabsGuestPage  implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  showLeftArrow: boolean = false;
  showRightArrow: boolean = false;

  public user: User;

  constructor(
      private storage: StorageService,
      public platform: Platform,
      private renderer: Renderer2
  ) {}

  isIOS() {
    return this.platform.is('ios');
  }

  async ngOnInit() {
    this.doEnter();
  }

  async ionViewWillEnter() {
    this.doEnter();
  }

  async doEnter(){
    this.user = JSON.parse(await this.storage.getItem('user'));   
    
    setTimeout(() => {
      this.checkOverflow();
    }, 100); // Esperamos a que el DOM esté completamente cargado

    window.addEventListener('resize', () => this.checkOverflow());
  }

  ionViewDidEnter() {    
  }

  ionViewWillLeave() {    
  }

  ionViewDidLeave() {
    this.doDestroy();
  }

  ngOnDestroy() {
    this.doDestroy();
  }

  doDestroy(){
    console.log("ondestoy tabs super admin");    
  }

  checkOverflow() {
    const element = this.scrollContainer.nativeElement;
    const tolerance = 2; // Tolerancia de 2 píxeles
  
    // Comprobar si hay overflow y actualizar las flechas
    this.showLeftArrow = element.scrollLeft > tolerance;
    this.showRightArrow = element.scrollWidth > element.clientWidth &&
                          element.scrollLeft < element.scrollWidth - element.clientWidth - tolerance;
  }
  

  onScroll() {
    const element = this.scrollContainer.nativeElement;
    const tolerance = 2; // Tolerancia de 2 píxeles
  
    this.showLeftArrow = element.scrollLeft > tolerance;
    this.showRightArrow = element.scrollLeft < element.scrollWidth - element.clientWidth - tolerance;
  }

  scrollLeft() {
    const element = this.scrollContainer.nativeElement;
    element.scrollBy({ left: -100, behavior: 'smooth' });
    this.onScroll(); // Actualizar flechas después del scroll
  }

  scrollRight() {
    const element = this.scrollContainer.nativeElement;
    element.scrollBy({ left: 100, behavior: 'smooth' });
    this.onScroll(); // Actualizar flechas después del scroll
  }

  handleTabChange(event: any) {
    document.querySelectorAll('ion-tab-button').forEach(tab => {
      this.renderer.removeClass(tab, 'tab-selected');
    });
  }
}
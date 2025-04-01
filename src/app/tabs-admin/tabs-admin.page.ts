import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TabNavigationService } from '../services/tab-navigation/tab-navigation.service';
import { User } from '../models/user/user';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-tabs-admin',
  templateUrl: './tabs-admin.page.html',
  styleUrls: ['./tabs-admin.page.scss'],
})
export class TabsAdminPage implements OnInit, OnDestroy {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  showLeftArrow: boolean = false;
  showRightArrow: boolean = false;

  public user: User;

  @ViewChild('tabs', { static: true }) tabs: IonTabs;
  private tabChangeSubscription: Subscription;

  constructor(
    private tabNavigationService: TabNavigationService,
    private storage: StorageService
  ) {}

  async ngOnInit() {
    this.doEnter();
  }

  async ionViewWillEnter() {
    this.doEnter();
  }

  async doEnter(){
    this.user = JSON.parse(await this.storage.getItem('user'));  

    this.tabChangeSubscription = this.tabNavigationService.tabChange$.subscribe(tab => {
      this.tabs.select(tab);
    });

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
    if (this.tabChangeSubscription) {
      this.tabChangeSubscription.unsubscribe();
    }
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
}

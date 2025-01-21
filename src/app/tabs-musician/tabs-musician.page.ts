import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TabNavigationService } from '../services/tab-navigation/tab-navigation.service';

@Component({
  selector: 'app-tabs-musician',
  templateUrl: './tabs-musician.page.html',
  styleUrls: ['./tabs-musician.page.scss'],
})
export class TabsMusicianPage  implements  OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  showLeftArrow: boolean = false;
  showRightArrow: boolean = false;

  @ViewChild('tabs', { static: true }) tabs: IonTabs;
  private tabChangeSubscription: Subscription;

  constructor(private tabNavigationService: TabNavigationService) {}

  ngOnInit() {
    this.tabChangeSubscription = this.tabNavigationService.tabChange$.subscribe(tab => {
      this.tabs.select(tab);
    })

    setTimeout(() => {
      this.checkOverflow();
    }, 100); // Esperamos a que el DOM esté completamente cargado

    window.addEventListener('resize', () => this.checkOverflow());
  }

  ngOnDestroy() {
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
import * as L from 'leaflet';

declare module 'leaflet' {
  interface MarkerOptions {
    isPOI?: boolean;
  }
}
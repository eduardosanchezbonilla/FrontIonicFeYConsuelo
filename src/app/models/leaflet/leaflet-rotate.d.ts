import 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    rotate?: boolean; // Habilita o deshabilita la rotación
    rotation?: number; // Ángulo inicial de rotación
    touchRotate?: boolean; // Habilita la rotación con gestos táctiles
    transform3DLimit?: number; // Límite de rotación en grados
  }

  interface Map {
    setRotation(angle: number): void; // Método para rotar el mapa programáticamente
    getBearing(): number; // Método para obtener el ángulo de rotación actual
    setBearing(angle: number): void; // Método para obtener el ángulo de rotación actual
  }
}
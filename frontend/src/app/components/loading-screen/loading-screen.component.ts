import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  template: `
    <div class="cfbc-loader" role="status" aria-live="polite" aria-label="Preparando el reporte semanal">
      <div class="cfbc-loader-bottom-text">
        Actualizando Indicadores...
      </div>
    </div>
  `,
})
export class LoadingScreenComponent {}

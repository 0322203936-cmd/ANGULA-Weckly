import { Component, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { YEAR_COLORS, CurrencyType } from '../../models/types';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow-sm px-2 py-1 d-flex flex-wrap align-items-center gap-2" style="min-height: 48px; border-bottom: 3px solid #800020;">
      
      <!-- Category -->
      <div class="d-flex align-items-center gap-1">
        <span class="text-muted fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px; text-transform: uppercase;" title="Categoría"><i class="fa-solid fa-tags me-1"></i>Cat</span>
        <select class="form-select form-select-sm shadow-sm rounded-pill border-0" 
                style="background-color: #f8f9fa; max-width:180px; font-size: 0.75rem; padding-top: 2px; padding-bottom: 2px;" 
                [style.color]="hasData(state().cat) ? '#262626' : '#dc2626'"
                [style.fontWeight]="hasData(state().cat) ? '600' : '700'"
                [value]="state().cat" (change)="onCatChange($event)">
          <option *ngFor="let c of categories()" [value]="c"
                  [style.color]="hasData(c) ? '#222' : '#dc2626'"
                  [style.fontWeight]="hasData(c) ? '400' : '700'">
            {{ c }}{{ hasData(c) ? '' : ' 🚫' }}
          </option>
        </select>
      </div>

      <div class="vr opacity-25 d-none d-md-block" style="height: 20px; align-self: center;"></div>

      <!-- Ranch -->
      <div class="d-flex align-items-center gap-1 position-relative">
        <span class="text-muted fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px; text-transform: uppercase;" title="Rancho"><i class="fa-solid fa-tractor me-1"></i>Ranch</span>
        <button class="btn btn-sm btn-light shadow-sm rounded-pill border-0 fw-semibold text-start d-flex justify-content-between align-items-center py-1" id="ranchDropdownBtn"
          style="min-width:100px; max-width:150px; font-size: 0.75rem;"
          (click)="toggleRanchDropdown($event)">
          <span class="text-truncate me-1">{{ ranchLabel() }}</span>
          <i class="fa-solid fa-chevron-down text-muted" style="font-size: 0.6rem;"></i>
        </button>
        @if (ranchOpen()) {
          <div id="ranchDropdownPanel" class="shadow-lg rounded-3 border-0 bg-white py-1" [style.top.px]="ranchPos().top" [style.left.px]="ranchPos().left"
            style="display:block; position:fixed; z-index:9999; min-width:140px; max-height:240px; overflow-y:auto;">
            <label *ngFor="let r of allRanches(); track r"
              class="dropdown-item d-flex align-items-center gap-2 px-3 py-1 text-dark fw-medium"
              style="font-size:0.75rem; cursor:pointer;"
              [style.borderTop]="r === ranchOrder()[0] ? '1px solid #f1f5f9; margin-top:2px; padding-top:4px;' : ''">
              <input type="checkbox" class="form-check-input mt-0" style="transform: scale(0.85);" [value]="r" [checked]="isRanchSelected(r)" (change)="toggleRanch(r, $event)">
              {{ r }}
            </label>
          </div>
        }
      </div>

      <div class="vr opacity-25 d-none d-md-block" style="height: 20px; align-self: center;"></div>

      <!-- Currency Toggle -->
      <div class="btn-group shadow-sm rounded-pill" role="group">
        <button type="button" class="btn btn-sm" style="font-size: 0.7rem; font-weight: 600; padding: 2px 10px; border-radius: 50px 0 0 50px;" [ngClass]="state().currency==='usd' ? 'btn-dark' : 'btn-light text-muted border'" (click)="setCurrency('usd')">USD</button>
        <button type="button" class="btn btn-sm" style="font-size: 0.7rem; font-weight: 600; padding: 2px 10px; border-radius: 0 50px 50px 0;" [ngClass]="state().currency==='mxn' ? 'btn-dark' : 'btn-light text-muted border'" (click)="setCurrency('mxn')">MXN</button>
      </div>

      <div class="vr opacity-25 d-none d-md-block" style="height: 20px; align-self: center;"></div>

      <!-- Range Sliders -->
      <div class="d-flex align-items-center gap-1">
        <span class="text-muted fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px; text-transform: uppercase;"><i class="fa-regular fa-calendar me-1"></i>Del</span>
        <span class="badge bg-light text-dark shadow-sm border fw-bold" style="font-size: 0.7rem; padding: 4px 6px;">{{ state().fromWeek | number:'2.0-0' }}</span>
        <input type="range" class="form-range mx-1" style="width: 60px; height: 1.2rem;" [min]="minWeek()" [max]="maxWeek()" [value]="state().fromWeek" (input)="onFromChange($event)">
        
        <span class="text-muted fw-bold ms-1" style="font-size: 0.65rem; letter-spacing: 0.5px; text-transform: uppercase;">Al</span>
        <span class="badge bg-light text-dark shadow-sm border fw-bold" style="font-size: 0.7rem; padding: 4px 6px;">{{ state().toWeek | number:'2.0-0' }}</span>
        <input type="range" class="form-range mx-1" style="width: 60px; height: 1.2rem;" [min]="minWeek()" [max]="maxWeek()" [value]="state().toWeek" (input)="onToChange($event)">
        
        <span class="badge rounded-pill fw-bold shadow-sm" style="background-color: #fee2e2; color: #991b1b; font-size: 0.65rem; padding: 4px 8px;">
          ({{ weekCount() }} sem)
        </span>
      </div>

      <div class="vr opacity-25 d-none d-lg-block" style="height: 20px; align-self: center;"></div>

      <!-- Years -->
      <div class="d-flex align-items-center gap-1">
        <span class="text-muted" style="font-size: 0.85rem;" title="Años"><i class="fa-solid fa-clock-rotate-left"></i></span>
        <div class="d-flex flex-wrap gap-2 px-1">
          @for (y of dataYears(); track y) {
            <button class="btn btn-sm rounded-pill fw-bold" 
              [class.shadow-sm]="isYearActive(y)"
              style="font-size: 0.65rem; padding: 2px 8px; transition: all 0.2s;"
              [style.color]="YEAR_COLORS[y]||'#888'"
              [style.backgroundColor]="isYearActive(y) ? (YEAR_COLORS[y]+'20') : 'transparent'"
              [style.border]="isYearActive(y) ? ('1px solid ' + YEAR_COLORS[y]) : '1px solid transparent'"
              (click)="toggleYear(y)">{{ y }}</button>
          }
        </div>
      </div>

      <div class="ms-auto d-flex align-items-center gap-2">
        @if (!isServiciosCat()) {
          <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-2 fw-semibold" style="font-size: 0.75rem; padding: 4px 8px;" (click)="verProductos.emit()" title="Ver rangos de productos">
            <i class="fa-solid fa-boxes-stacked"></i>
            <span>Rangos de productos</span>
          </button>
        }

        <!-- Reload Button using Bootstrap & FontAwesome -->
        <button class="btn btn-sm d-flex align-items-center gap-2 text-white fw-semibold" style="background-color: #800020; border: none; font-size: 0.75rem; padding: 4px 8px;" (click)="openReloadModal()" title="Recargar datos completos">
          <i class="fa-solid fa-cloud-arrow-down"></i>
          <span>Recargar</span>
        </button>
      </div>
    </div>

    <!-- Password Modal for Reload -->
    @if (showPasswordModal()) {
      <div class="modal-backdrop fade show" style="z-index: 9998; background: rgba(0,0,0,0.5); position: fixed; inset: 0;"></div>
      <div class="modal fade show" style="display: block; z-index: 9999; position: fixed; top: 0; left: 0; width: 100%; height: 100%;" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0 rounded-3">
            <div class="modal-header bg-light border-bottom-0">
              <h5 class="modal-title fw-bold text-dark" style="font-size: 1.1rem;"><i class="fa-solid fa-lock text-danger me-2"></i> Autenticación Requerida</h5>
              <button type="button" class="btn-close" (click)="showPasswordModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <p class="text-muted mb-3" style="font-size: 0.9rem;">La recarga completa de datos desde la base de datos requiere autorización. Ingresa la contraseña maestra.</p>
              <input type="password" class="form-control form-control-lg" placeholder="Contraseña..." [value]="passwordInput()" (input)="onPasswordInput($event)" (keyup.enter)="confirmReload()">
              @if (passwordError()) {
                <div class="text-danger mt-2 small fw-semibold"><i class="fa-solid fa-circle-exclamation"></i> Contraseña incorrecta. Intenta nuevamente.</div>
              }
            </div>
            <div class="modal-footer border-top-0">
              <button type="button" class="btn btn-light" (click)="showPasswordModal.set(false)">Cancelar</button>
              <button type="button" class="btn btn-danger px-4" style="background-color: #800020;" (click)="confirmReload()">
                <i class="fa-solid fa-cloud-arrow-down me-1"></i> Autorizar Recarga
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ToolbarComponent {
  readonly YEAR_COLORS = YEAR_COLORS;
  readonly verProductos = output<void>();
  readonly reload = output<void>();

  protected ranchOpen = signal(false);
  protected ranchPos = signal({ top: 0, left: 0 });

  // Password Modal Signals
  protected showPasswordModal = signal(false);
  protected passwordInput = signal('');
  protected passwordError = signal(false);

  openReloadModal() {
    this.passwordInput.set('');
    this.passwordError.set(false);
    this.showPasswordModal.set(true);
  }

  onPasswordInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.passwordInput.set(val);
  }

  confirmReload() {
    if (this.passwordInput() === 'cfbc2026') {
      this.showPasswordModal.set(false);
      this.reload.emit();
    } else {
      this.passwordError.set(true);
    }
  }

  constructor(protected stateService: StateService) {}

  protected state = this.stateService.state;
  protected data = this.stateService.data;
  protected isServiciosCat = this.stateService.isServiciosCat;

  protected categories = computed(() => this.data()?.categories ?? []);
  protected dataYears = computed(() => this.data()?.years ?? []);
  protected ranchOrder = computed(() => this.data()?.config.ranch_order ?? []);
  protected allRanches = computed(() => ['Todos', ...(this.ranchOrder())]);

  protected minWeek = computed(() => { const w = this.stateService.allWeeks(); return w.length > 0.01 ? w[0] : 1; });
  protected maxWeek = computed(() => { const w = this.stateService.allWeeks(); return w.length > 0.01 ? w[w.length - 1] : 52; });
  protected weekCount = computed(() => {
    const all = this.stateService.allWeeks();
    return all.filter(w => w >= this.state().fromWeek && w <= this.state().toWeek).length;
  });

  protected ranchLabel = computed(() => {
    const s = this.state();
    if (s.activeRanches.includes('Todos')) return 'Todos \u25BE';
    return s.activeRanches.length === 1 ? s.activeRanches[0] + ' \u25BE' : s.activeRanches.length + ' ranchos \u25BE';
  });

  protected isRanchSelected(r: string): boolean { return this.state().activeRanches.includes(r); }
  protected isYearActive(y: number): boolean { return !!this.state().activeYears[y]; }

  protected hasData(cat: string): boolean {
    const data = this.data();
    if (!data || !cat) return false;
    const s = this.state();
    const fromW = s.fromWeek;
    const toW = s.toWeek;
    const activeYrs = Object.keys(s.activeYears).filter(y => s.activeYears[Number(y)]).map(Number);
    if (!activeYrs.length) return false;

    const inScope = (r: any) => activeYrs.includes(r.year) && r.week >= fromW && r.week <= toW;
    const hasAmt = (r: any) => Math.abs(r.mxn_total || 0) > 0.01 || Math.abs(r.usd_total || 0) > 0.01 || Math.abs(r.hc_total || 0) > 0.01;

    let recs: any[] = [];
    if (cat === 'COSTO MANO DE OBRA') {
      recs = data.mano_obra_data || [];
    } else if (cat === 'COSTO SERVICIOS') {
      recs = data.servicios_data || [];
    } else {
      recs = (data.weekly_detail || []).filter(r => r.categoria === cat);
    }
    
    return recs.some(r => inScope(r) && hasAmt(r));
  }

  protected onCatChange(event: Event) { this.stateService.setCategory((event.target as HTMLSelectElement).value); }
  protected setCurrency(cur: CurrencyType) { this.stateService.setCurrency(cur); }
  protected toggleYear(y: number) { this.stateService.toggleYear(y); }

  protected toggleRanchDropdown(event: MouseEvent) {
    this.ranchOpen.update(v => !v);
    if (!this.ranchOpen()) return;
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    this.ranchPos.set({ top: rect.bottom + 2, left: rect.left });
  }

  protected toggleRanch(val: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = [...this.state().activeRanches];
    if (val === 'Todos') {
      this.stateService.setActiveRanches(checked ? ['Todos'] : [...this.ranchOrder()]);
    } else {
      const todosIdx = current.indexOf('Todos');
      if (todosIdx > -1) current.splice(todosIdx, 1);
      if (checked) { if (!current.includes(val)) current.push(val); }
      else {
        const idx = current.indexOf(val);
        if (idx > -1) current.splice(idx, 1);
        if (current.length === 0) current.push('Todos');
      }
      this.stateService.setActiveRanches(current);
    }
  }

  protected onFromChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value);
    const to = this.state().toWeek;
    this.stateService.setFromToWeek(Math.min(val, to), Math.max(val, to));
  }

  protected onToChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value);
    const from = this.state().fromWeek;
    this.stateService.setFromToWeek(Math.min(from, val), Math.max(from, val));
  }
}

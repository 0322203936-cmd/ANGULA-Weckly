const fs = require('fs');
let content = fs.readFileSync('servicios-view.component.ts', 'utf8');

// Add showWeekDif
if (!content.includes('showWeekDif = computed')) {
  content = content.replace(
    'protected nColsPerRanch = computed(() => Math.max(this.weekKeys().length, 0) + 1);',
    `protected showWeekDif = computed(() => this.weekKeys().length > 1);
  protected nColsPerRanch = computed(() => Math.max(this.weekKeys().length, 0) + (this.showWeekDif() ? 1 : 0));`
  );
}

// Wrap all DIF headers in @if (showWeekDif())
content = content.replace(
  /<th([^>]*?)>\s*DIF\s*<\/th>/g,
  '@if (showWeekDif()) {\n                  <th$1>\n                    DIF\n                  </th>\n                }'
);

// Now for the <td>s. The DIF <td>s usually come after the inner loop `@for (key of weekKeys(); track key)`
// Let's match the @let for dif, or just the <td> that has `Dif` in it.
// There are several patterns:
// 1. 
// @let difCost = ...
// <td ... difCost ...>...</td>
// 2. 
// <td ... getRanchDif(...) ...>...</td>

// A simpler way: parse line by line and find the inner loop.
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  // If we see a <td> that has "Dif" or "dif" or "TotDif" or "WkDif" in it, and it's rendering a difference
  // Actually, there are empty <td>s for DIF in the group headers:
  // <td style="padding:3px 6px;border-bottom:1px solid #e5e5e5;border-right:1px solid #e5e5e5;text-align:right;color:#ccc;"></td>
  // How do we know which empty <td> is the DIF one?
  // Usually, it's:
  // @for (key of weekKeys(); track key) { <td ...></td> }
  // <td ...></td>  <-- this is the DIF td
}

fs.writeFileSync('servicios-view.component.ts', content);

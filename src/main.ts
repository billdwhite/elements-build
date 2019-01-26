import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { createCustomElement } from '@angular/elements';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { SelectListComponent } from './app/select-list';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
  // Ensure Angular destroys itself on hot reloads.
  if (window['ngRef']) {
    window['ngRef'].destroy();
  }
  window['ngRef'] = ref;

  // Convert `ButtonComponent` to a custom element.
  const selectList = createCustomElement(SelectListComponent, { injector: ref.injector });
  // Register the custom element with the browser.
  customElements.define('select-list', selectList);

  // Otherwise, log the boot error
}).catch(err => console.error(err));

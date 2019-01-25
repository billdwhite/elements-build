import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { createCustomElement } from '@angular/elements';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ButtonComponent } from "./app/button/button.component";
import { AppComponent } from "./app/app.component";
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
  const elm2 = createCustomElement(ButtonComponent, { injector: ref.injector });
  // Register the custom element with the browser.
  customElements.define('custom-button', elm2);
  // Convert `ButtonComponent` to a custom element.
  const elm3 = createCustomElement(SelectListComponent, { injector: ref.injector });
  // Register the custom element with the browser.
  customElements.define('select-list', elm3);
  // Otherwise, log the boot error
}).catch(err => console.error(err));

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, Injector } from "@angular/core";
import { ButtonComponent } from "./button/button.component";
import { createCustomElement } from '@angular/elements';
import {
  SelectListComponent,
  BreadcrumbViewComponent,
  ListViewComponent,
  ListViewGroupComponent,
  ListViewItemComponent,
  SelectListItemRendererComponent
} from "./select-list";
import {
  RendererHostDirective
} from "./renderers";

@NgModule({
  declarations: [
    ButtonComponent,
    SelectListComponent,
    BreadcrumbViewComponent,
    ListViewComponent,
    ListViewGroupComponent,
    ListViewItemComponent,
    SelectListItemRendererComponent,
    RendererHostDirective
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [],
  entryComponents: [
    ButtonComponent,
    SelectListComponent,
    BreadcrumbViewComponent,
    ListViewComponent,
    ListViewGroupComponent,
    ListViewItemComponent,
    SelectListItemRendererComponent
  ]
})
export class AppModule {
  
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    // Convert `ButtonComponent` to a custom element.
    const selectList = createCustomElement(SelectListComponent, { injector: this.injector });
    // Register the custom element with the browser.
    customElements.define('select-list', selectList);
  }
}

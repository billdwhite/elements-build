import { BrowserModule } from "@angular/platform-browser";
import { NgModule, Injector } from "@angular/core";
import { createCustomElement } from "@angular/elements";
import { AppComponent } from "./app.component";
import { ButtonComponent } from "./button/button.component";
import {
  SelectListComponent,
  BreadcrumbViewComponent,
  ListViewComponent,
  ListViewGroupComponent,
  ListViewItemComponent,
  SelectListItemRendererComponent
} from "./select-list";

@NgModule({
  declarations: [
    ButtonComponent
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [],
  entryComponents: [
    ButtonComponent
  ]
})
export class AppModule {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {}
}

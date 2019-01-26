import { BrowserModule } from "@angular/platform-browser";
import { NgModule, Injector } from "@angular/core";
import { ButtonComponent } from "./button/button.component";
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

  ngDoBootstrap() {}
}

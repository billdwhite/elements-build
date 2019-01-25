import {Directive, ViewContainerRef} from "@angular/core";

@Directive({
    selector: '[renderer-host]'
})

export class RendererHostDirective {

    constructor(public viewContainerRef: ViewContainerRef) {
    }

}
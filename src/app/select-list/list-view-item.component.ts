import {Component, OnInit, Input, OnDestroy, AfterViewInit, ElementRef, EventEmitter, Output, Renderer2, ComponentFactory, ViewChild,
        Type, ComponentFactoryResolver, ViewContainerRef, ComponentRef, OnChanges, ViewEncapsulation} from "@angular/core";
import {ListDataItem} from "../list-data-item";
import {ItemRenderer, RendererHostDirective} from "../renderers/";
import { SelectListItemRendererComponent } from './select-list-item-renderer.component';


@Component({
    selector:     'list-view-item',
    templateUrl:  'list-view-item.component.html',
    styleUrls:   ['list-view-item.component.scss'],
    host:        {'class': 'list-view-item'},
    encapsulation:   ViewEncapsulation.Emulated
})

export class ListViewItemComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    static readonly EVENT_ITEMCLICKED = "eventClickListItem";


    @Input('selected')
        selected: boolean = false;

    @Input('matchText')
        matchText: string = '';

    @Input('data')
        set data(arg: ListDataItem) {
            this._data = arg;
            if (this._data.getChildren() && this._data.getChildren().length > 0) {
                this.renderer.addClass(this.getDomNode(), 'more');
            } else {
                this.renderer.removeClass(this.getDomNode(), 'more');
            }
        }
        get data(): ListDataItem {
            return this._data;
        }
        private _data: ListDataItem;

    @Input('itemRenderer')
        itemRenderer: Type<ItemRenderer> = SelectListItemRendererComponent;


    @Output('onClick')
        onClick: EventEmitter<ListDataItem> = new EventEmitter();

    @ViewChild(RendererHostDirective)
        rendererHost: RendererHostDirective;


    /* used by template */
    public innerHTML: string = '';
    public hidden: boolean = false;
    public tabIndex: number = 0;
    public itemRendererInstance: ItemRenderer;



    constructor(private elementRef: ElementRef,
                private renderer: Renderer2,
                private viewContainerRef: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver) {
    }



    ngOnInit(): void {
    }



    ngAfterViewInit(): void {
        let componentFactory: ComponentFactory<ItemRenderer> = this.componentFactoryResolver.resolveComponentFactory(this.itemRenderer);
        let viewContainerRef: ViewContainerRef = this.viewContainerRef;
        let componentRef: ComponentRef<ItemRenderer> = viewContainerRef.createComponent(componentFactory);
        this.itemRendererInstance = <ItemRenderer>componentRef.instance;
        this.itemRendererInstance.data = this.data;
    }



    ngOnChanges(): void {
        // We implement this to force rendering for sizing reasons.
        // When we want to show a select list control on the screen we need to force the
        // sizing ahead of the normal lifecycle so that we have the size available for other logic.
        this.render();
    }



    public getDomNode(): any {
        return this.elementRef.nativeElement;
    }



    /* used by template */
    public handleClick(event: Event): void {
        if (this.data.isEnabled()) {
            event['fromPopup'] = true; // tag this event as being from a popup so other popups can examine this in determining whether they should close (i.e. see popup.component.ts)
            this.onClick.emit(this._data);
        }
    }



    private matches(searchText: string, testText: string): boolean {
        return searchText === "" || testText.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
    }



    public render(): void {
        let nameText: string = this._data.getName();
        let newHidden: boolean = this.matchText ? !this.matches(this.matchText, nameText) : false;
        console.log("list-view-item.render()" , newHidden);
        if (this.data['__selected']) {
            this.renderer.addClass(this.getDomNode(), 'selected');
        } else {
            this.renderer.removeClass(this.getDomNode(), 'selected');
        }
        if (newHidden !== this.hidden) {
            this.hidden = newHidden;
            this.renderer.addClass(this.getDomNode(), 'animating');
            if (this.hidden) {
                this.renderer.addClass(this.getDomNode(), 'collapsed');
            } else {
                this.renderer.removeClass(this.getDomNode(), 'collapsed');
            }
            setTimeout(() => {
                this.renderer.removeClass(this.getDomNode(), 'animating');
            }, 200);
        }

        if (!this.hidden && this.itemRendererInstance) {
            this.itemRendererInstance.searchText = this.matchText;
        }
    }



    private reset(): void {
        this.matchText = '';
        this.render();
    }



    ngOnDestroy(): void {
    }
}

import {Component, OnInit, AfterViewInit, OnDestroy, ElementRef, EventEmitter, ViewChild, Output, Renderer2, ViewEncapsulation} from "@angular/core";
import {ListDataItem} from "../list-data-item";

@Component({
    selector:    'breadcrumb-view',
    templateUrl: 'breadcrumb-view.component.html',
    styleUrls:  ['breadcrumb-view.component.scss'],
    host:       {'class': 'breadcrumbs'},
    encapsulation:   ViewEncapsulation.Emulated
})

export class BreadcrumbViewComponent implements OnInit, AfterViewInit, OnDestroy {

    static readonly EVENT_BREADCRUMBCLICKED = "eventBreadcrumbClicked";


    @Output('onBreadcrumbClick')
        onBreadcrumbClick: EventEmitter<any> = new EventEmitter();


    @ViewChild('breadcrumbBarRoot')
        private breadcrumbBarRoot: ElementRef;

    @ViewChild('breadcrumbBarLeaf')
        private breadcrumbBarLeaf: ElementRef;


    /* used by template */
    public textLabel: string = '';
    public leafLabel: string = '';
    public breadcrumbsVisible: boolean = false;



    constructor(private elementRef: ElementRef,
                private renderer: Renderer2) {
    }



    ngOnInit(): void {
    }



    ngAfterViewInit(): void {
        let self: any = this;
// @TODO
        //this.breadcrumbBarRootTooltip = Tooltip({
        //    "position": ['after', 'before', 'above', 'below'],
        //    "showDelay": ViewConstants.tooltipDelay,
        //    connectId: [this.breadcrumbBarRoot],
        //    "onShow":  function() {
        //        self.currentTooltip = this;
        //    }
        //});
        //this.breadcrumbBarLeafTooltip = Tooltip({
        //    "position": ['after', 'before', 'above', 'below'],
        //    "showDelay": ViewConstants.tooltipDelay,
        //    connectId: [this.breadcrumbBarLeaf],
        //    "onShow": function() {
        //        self.currentTooltip = this;
        //    }
        //});
    }



    public getDomNode(): any {
        return this.elementRef.nativeElement;
    }



    /* used by template */
    public handleClickBreadcrumb(event: Event): void {
        this.onBreadcrumbClick.emit(event);
    }



    public setLabel(arg: string): void {
        this.textLabel = arg;
        this.updateVisibility();
// @TODO
        //this.breadcrumbBarRootTooltip.label = "<div class='defaultTooltip'><span class='message'>" + labelText + "</span></div>";
    }



    public appendBreadcrumb(d: ListDataItem): void {
        if (d != null) {
            this.renderer.addClass(this.getDomNode(), "drillin");
        } else {
            this.renderer.removeClass(this.getDomNode(), "drillin");
        }
        if (this.breadcrumbBarLeaf) {
            //console.log("this.breadcrumbBarLeaf");
            this.leafLabel = d ? d.getName() : '';
          //  this.renderer.setProperty(this.breadcrumbBarLeaf.nativeElement, 'innerHTML', this.leafLabel);
        }
// @TODO
        //this.breadcrumbBarLeafTooltip.label = "<div class='defaultTooltip'><span class='message'>" + (this.breadcrumbBarLeaf ? d.name: '') + "</span></div>";

        /*
        if (d) {
            domClass.add(this.domNode, "drillin");
            if (this._breadcrumbBarLeaf) {
                html.set(this._breadcrumbBarLeaf, d.name);
                this._breadcrumbBarLeafTooltip.label =  "<div class='defaultTooltip'><span class='message'>" + d.name + "</span></div>";
            }
        } else {
            domClass.remove(this.domNode, "drillin");
            if (this._breadcrumbBarLeaf) {
                html.set(this._breadcrumbBarLeaf, "");
                this._breadcrumbBarLeafTooltip.label = "";
            }
        }
        */
        this.updateVisibility();
    }



    private updateVisibility(): void {
        this.breadcrumbsVisible = ((this.textLabel && this.textLabel.length > 1) || (this.leafLabel && this.leafLabel.length > 1));
    }



    public reset(): void {
        this.appendBreadcrumb(null);
// @TODO
        //if (this.currentTooltip) {
        //    this.currentTooltip.close();
        //}
    }



    ngOnDestroy(): void {
    }
}

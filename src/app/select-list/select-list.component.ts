import {Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, Renderer2, ViewContainerRef,
        ComponentFactoryResolver, ComponentRef, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding, Type, ComponentFactory, 
        ViewEncapsulation, HostListener} from '@angular/core';
import {debounceTime} from 'rxjs/operators';
import {fromEvent as observableFromEvent} from 'rxjs';
import {ListViewComponent} from './list-view.component';
import {ListFilter} from './list-filter';
import {BreadcrumbViewComponent} from './breadcrumb-view.component';
import {UIUtils, UIPosition, Utils} from "../utils";
import {ListDataItem} from "../list-data-item";
import {isUndefined as _isUndefined, defer as _defer, debounce as _debounce} from "lodash";
import {ItemRenderer} from "../renderers/item-renderer.interface";
import {TweenMax, TweenConfig, Power4} from "gsap";
import * as Collections from 'typescript-collections';
import { SelectListItemRendererComponent } from './select-list-item-renderer.component';


@Component({
    selector:        'select-list',
    templateUrl:     'select-list.component.html',
    styleUrls:      ['select-list.component.scss'],
    host:           {'class': 'select-list'},
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation:   ViewEncapsulation.Emulated
})

export class SelectListComponent implements OnInit, AfterViewInit, OnDestroy {

    static readonly EVENT_ITEMCLICKED = "eventSelectListControlItemClicked";
    static readonly EVENT_CLOSED      = "eventSelectListControlClosed";

    @HostListener('document:click', ['$event'])
        handleClickOutside(event: Event): void {
            if (!this.elementRef.nativeElement.contains(event.target)) {
                this.onBlur.emit();
            }
        }

    @HostListener('window:blur', ['$event']) // used to catch clicks on an iframe; otherwise menu will linger
        windowBlur(event: Event): void {
            this.onBlur.emit();
        }


    @HostBinding('class')
        contextCSSName: string = '';


    @Input('data')
        set data(dataItems: any[]) {
            let recurseData: Function = (genericData: any): ListDataItem => {
                let returnListDataItem: ListDataItem = ListDataItem.create(genericData._id, genericData._name, genericData._description, genericData);
                if (genericData._children) {
                    returnListDataItem.setChildren(genericData._children.map(recurseData));
                }
                return returnListDataItem;
            };
            let convertedData: ListDataItem[] = dataItems.map((nextItem) => recurseData(nextItem));
            this.setData(convertedData, []);
        }
        get data() {
            return this._data;
        }
        _data: ListDataItem[] = [];

    @Input('selectedData')
        selectedData: ListDataItem[] = [];

    @Input('itemRenderer')
        itemRenderer: Type<ItemRenderer> = SelectListItemRendererComponent;


    @Output('onClickListItem')
        onClickListItem: EventEmitter<ListDataItem> = new EventEmitter<ListDataItem>();

    @Output('onClose')
        onClose: EventEmitter<any> = new EventEmitter<any>();

    @Output('onCancel')
        onCancel: EventEmitter<void> = new EventEmitter<void>();

    @Output('onBlur')
        onBlur: EventEmitter<void> = new EventEmitter<void>();


    @ViewChild('listContainer',   {read: ViewContainerRef})
        listContainer:   ViewContainerRef;

    @ViewChild('listPlaceHolder', {read: ViewContainerRef})
        listPlaceHolder: ViewContainerRef;

    @ViewChild('breadcrumbView')
        breadcrumbView:  BreadcrumbViewComponent;

    @ViewChild('searchTextBox')
        searchTextBox:   ElementRef;


    private dataChanged: boolean = true;// flag to know when data has changed; used to conceal resizing of list prior to open after data change
    private showSelectedOnly: boolean = false;
    private filterDirty: boolean = false;
    private parentControl: ElementRef;
    private resizeListener: Function;           // handle to remove resizeListener
    private listStack: Collections.Stack<ListViewComponent> = new Collections.Stack<ListViewComponent>();
    private position: UIPosition = new UIPosition();
    private animationDuration: number = 0.5;



    constructor(private elementRef: ElementRef,
                private renderer: Renderer2,
                private componentFactoryResolver: ComponentFactoryResolver,
                private changeDetectorRef: ChangeDetectorRef) {
    }



    ngOnInit(): void {
        observableFromEvent(window, 'resize').pipe(
            debounceTime(100))
            .subscribe((e: Event) => {
                this.handleResize(e);
            });

        //setTimeout(() => { // use setTimeout to avoid running on instantiate (probably a better way to avoid this)
        //    this.searchTextBox.nativeElement
        //        .debounceTime(300)
        //        .distinctUntilChanged()
        //        .subscribe((filterString: string) => {
        //            let existingFilter = this.query.getFilter();
        //            if (filterString.length > 0) {
        //                this.searchFilter.setValues([filterString]);
        //                let baseAndSearchFilter = new QueryFilter();
        //                baseAndSearchFilter.addValue(this.baseFilter);
        //                baseAndSearchFilter.addValue(this.searchFilter);
        //                baseAndSearchFilter.setOperator("AND");
        //                this.query.setFilter(baseAndSearchFilter);
        //                this.query.setStart(0);
        //            } else {
        //                this.query.setFilter(this.baseFilter);
        //            }
        //            this.dataSource.setQuery(this.query);
        //        });
        //}, 100);
        this.updateMetrics = _debounce(this.updateMetrics.bind(this), 10, {leading:false, trailing:true});
    }



    ngAfterViewInit(): void {
        this.updateMetrics();
        this.resizeListener = this.renderer.listen('window', 'resize', (event: any): void => { // recreate resize listener
            this.updateMetrics();
        });
    }



    private getDomNode(): any {
        return this.elementRef.nativeElement;
    }



    private handleResize(event: Event): void {
        this.updateMetrics();
    }



    /* used by template */
    public handleClickListContainer(event: Event): void {
// @TODO
        //if (this.tooltip) {
        //    this.tooltip.close();
        //}
    }



    /* used by template */
    public handleClickListItem(listDataItem: ListDataItem): void {
        if (listDataItem.hasChildren()) {
            this.listDrillIn(listDataItem);
        } else {
            this.onClickListItem.emit(listDataItem);
            this.closeHandler();
        }
    }



    /* used by template */
    public handleKeyDownListContainer(event: Event): void {
        if (event['key'] === 'Escape') {
            this.cancelHandler();
        }
    }



    /* used by template */
    public handleKeyUpSearchTextBox(event: Event): void {
        if (this.showSelectedOnly) {
            this.toggleShowSelected(false);
        }
        if (event['key'] === 'Escape') {
            this.cancelHandler();
        }
        this.scheduleFilterUpdate();
    }



    /* used by template */
    public handleChangeSearchTextBox(event: Event): void {
        this.closeTooltips();
        if (event && event['key'] === 'Escape') {
            this.cancelHandler();
        }
        this.scheduleFilterUpdate();
    }



    public handleClickSearchTextBox(event: Event): void {
        event.stopPropagation(); // stop propagation of clicks into search field; this causes other dialogs to close (i.e. see popup.component.ts)
    }



    /* used by template */
    public handleClickBreadcrumb() {
        this.listDrillOut();
    }



    private toggleShowSelected(arg: any): void {
        let proposedValue: boolean = _isUndefined(arg) ? !this.showSelectedOnly : arg;
        if (this.showSelectedOnly !== proposedValue) {
            this.showSelectedOnly = proposedValue;
            // force filter to update but since changing the value on the search field triggers _searchBoxChangeHandler (except when the value does not
            // change) we only want to call _updateListFilter() when _searchTextBox value does not trigger it automatically
            if (this.showSelectedOnly && this.searchTextBox.nativeElement.value !== "") {
                this.searchTextBox.nativeElement.value(""); // if searchTextBox has is empty
            } else {
                this.scheduleFilterUpdate();
            }
            this.searchTextBox.nativeElement.value.focus(); // always return focus to search field after toggling show selected state
        }
    }



    private scheduleFilterUpdate(): void {
        this.filterDirty = true;
        _defer(this.updateFilterState.bind(this));
    }



    private updateFilterState(): void {
        if (this.filterDirty) {
            this.filterDirty = false;
            this.updateListFilter();
        }
    }



    private updateListFilter(): void {
        let filter: ListFilter = new ListFilter();
        filter.setText(this.searchTextBox.nativeElement.value);
        filter.setSelected(this.showSelectedOnly);
        this.listStack.peek().setFilter(filter);
    }



    private setParentControl(parentControl: ElementRef): void {
        this.parentControl = parentControl;
    }



    public setCSSClass(cssClassArg: string): void {
        this.contextCSSName = "select-list " + cssClassArg;
    }



    private setListCSSClass(cssClassArg: string): void { // used to add CSS class that styles readonly elements according to the specific case (ie filters, properties)
        this.renderer.addClass(this.getDomNode(), cssClassArg);
    }



    public setTitle(textLabel: string): void {
        this.breadcrumbView.setLabel(textLabel);
    }



    public setData(data: Array<ListDataItem>, selectedData?: Array<ListDataItem>): void {
        this._data = data;
        this.selectedData = selectedData;
        if (!this.listStack.peek()) {
            this.listStack.push(this.createListView());
        }

        this.listStack.peek().setData(data, selectedData);

        this.changeDetectorRef.detectChanges();
        this.dataChanged = true;
    }



    private createListView(): ListViewComponent {
        let listViewComponentFactory: ComponentFactory<ListViewComponent> = this.componentFactoryResolver.resolveComponentFactory(ListViewComponent);
        let listViewComponentRef: ComponentRef<ListViewComponent> = this.listPlaceHolder.createComponent<ListViewComponent>(listViewComponentFactory);
        let listViewComponent: ListViewComponent = listViewComponentRef.instance;
        listViewComponent.itemRenderer = this.itemRenderer;
        listViewComponent.onClickListItem.subscribe((listDataItem: ListDataItem) => {
            this.handleClickListItem(listDataItem);
        });
        return listViewComponent;
    }



    public show(position: UIPosition): void {
        this.renderer.setStyle(this.getDomNode(), "opacity", "1");
        this.position = position;
        this.searchTextBox.nativeElement.focus(); // explicitly set focus in search field; otherwise subsequent blur(lost focus) may not close dialog

        this.onOpen();
    }



    private onOpen(): void {
        if (this.dataChanged) { // conceal resizing on open if data has changed
            this.renderer.setStyle(this.getDomNode(), "opacity", "0");
        }
        if (this.resizeListener) { // shouldn't be a resizeListener so check just to be sure to avoid duplicates
            this.resizeListener(); // calling the handle to the resize listener removes it
        }

        // need this so menus will appear above other controls
        //this.renderer.setStyle(this.elementRef.nativeElement, "z-index", 20000);

        this.updateMetrics();

        if (this.dataChanged) { // show after any resizing has occurred
            _defer(function() {
                this.renderer.setStyle(this.getDomNode(), "opacity", "1");
            }.bind(this));
        }
        this.dataChanged = false;
    }



    private closeTooltips(): void {                   // close any currently visible tooltips from list; prevents tips from lingering while list is changing
    }



    private closeHandler(): void {
        this.resizeListener();                        // remove resize listener
        this.onClose.emit({bubbles:true, selectedValues:this.listStack.peek().getSelectedData()});
        this.closeTooltips();                         // prevent lingering tooltips
        this.reset();
    }



    private cancelHandler(): void {
        this.resizeListener();                        // remove resize listener
        this.onCancel.emit();
        this.closeTooltips();                         // prevent lingering tooltips
        this.reset();
    }



    private reset(): void {
        this.searchTextBox.nativeElement.value = '';  // clear search first so overall list height does not get resized too small on subsequent openings
        while (this.listStack.size() > 1) {
            let nextListToRemove: ListViewComponent = this.listStack.pop();
// @TODO - do I need to just destroy or destroy and remove?
            nextListToRemove.getDomNode().parentNode.removeChild(nextListToRemove.getDomNode());
            nextListToRemove.ngOnDestroy();
        }
        let activeList: ListViewComponent = this.listStack.peek();
        this.renderer.setStyle(activeList.getDomNode(), "left", "0");
        //this.listContainer.domNode.scrollTop = 0;  // return list to top scroll position for subsequent openings
        this.renderer.setAttribute(this.listContainer.element.nativeElement, "scrollTop", "0"); // return list to top scroll position for subsequent openings
        this.breadcrumbView.reset();
        this.updateListFilter();
        this.toggleShowSelected(false);
    }



    private updateMetrics(): void {
        this.position = UIUtils.getWindowFitPosition(this.position);
        this.renderer.setStyle(this.getDomNode(), "top", this.position.getTop() + "px");
        this.renderer.setStyle(this.getDomNode(), "left", this.position.getLeft() + "px");
        this.renderer.setStyle(this.getDomNode(), "width", this.position.getWidth() + "px");
        //switch height to max-height to use shrinking list height on search
        this.renderer.setStyle(this.getDomNode(), "height", this.position.getHeight() + "px");
    }



    private listDrillIn(drillInListDataItem: ListDataItem): void {
        this.breadcrumbView.appendBreadcrumb(drillInListDataItem);
        let outgoingList: ListViewComponent = this.listStack.peek();
        let incomingList: ListViewComponent = this.createListView();
        let selectedData: ListDataItem[] = [];
        this.searchTextBox.nativeElement.value = '';

        outgoingList.getDomNode().parentNode.appendChild(incomingList.getDomNode());
        // we use to do this; but now we use selectedData that is unique for the entire list, not just the current level; therefore, this.selectedData is valid everywhere
        //let outgoingSelectedData: Array<ListDataItem> = outgoingList.getSelectedData();
        //outgoingSelectedData.forEach((nextOutgoingSelectedData: ListDataItem) => {
        //    if (nextOutgoingSelectedData.getId() === drillInListDataItem.getId()) {
        //        if (nextOutgoingSelectedData.hasChildren()) {
        //            selectedData = selectedData.concat(nextOutgoingSelectedData.getChildren());
        //        } else {
        //            selectedData.push(nextOutgoingSelectedData);
        //        }
        //    }
        //});
        incomingList.setData(drillInListDataItem.getChildren(), this.selectedData);
        this.listStack.push(incomingList);

        this.renderer.addClass(this.getDomNode(), "animating");
        this.renderer.addClass(this.getDomNode(), "drillin");

        // on drill-in; the _listContainer's height is less than it will be because of the space being returned by the breadcrumb
        // bar; therefore we add 18 to the calculate to offset this space which will be available at the end of the drillOut animation
        if (incomingList.getDomNode().getBoundingClientRect().height > this.listContainer.element.nativeElement.getBoundingClientRect().height) {
            this.renderer.addClass(incomingList.getDomNode(), 'scroll');
        }

        TweenMax.to([outgoingList.getDomNode(), incomingList.getDomNode()], this.animationDuration, <TweenConfig>{
            ease: Power4.easeOut,
            css: {
                left: "-=300px"
            },
            onStartScope: this,
            onStart: function() {
            },
            onUpdateScope: this,
            onUpdate: function() {
            },
            onCompleteScope: this,
            onComplete: function() {
                outgoingList.getDomNode().parentNode.removeChild(outgoingList.getDomNode()); // remove outgoing list from DOM
                this.renderer.addClass(incomingList.getDomNode(), "scroll"); // restore scrolling capability
                this.renderer.removeClass(this.getDomNode(), "animating");
                this.renderer.removeClass(this.getDomNode(), "drillin");
                outgoingList.setSearchText(this.searchTextBox.nativeElement.value);
                this.renderer.setAttribute(this.listContainer.element.nativeElement, "scrollTop", "0"); // return list to top scroll position for subsequent openings
                this.searchTextBox.nativeElement.value = "";
                this.searchTextBox.nativeElement.focus();
            }
        });
    }



    private listDrillOut(): void {
        if (this.listStack.size() > 1) { // only drill out if necessary
            this.breadcrumbView.appendBreadcrumb(null);
            let outgoingList: ListViewComponent = this.listStack.pop();
            let incomingList: ListViewComponent = this.listStack.peek();
            this.renderer.addClass(this.getDomNode(), "animating");
            this.renderer.addClass(this.getDomNode(), "drillout");

            outgoingList.getDomNode().parentNode.insertBefore(incomingList.getDomNode(), outgoingList.getDomNode());
            this.renderer.setAttribute(incomingList.getDomNode(), "TEST", "INCOMING");
            this.renderer.setAttribute(outgoingList.getDomNode(), "TEST", "OUTGOING");

            // on drill-out; the _listContainer's height is less than it will be because of the space being returned by the breadcrumb
            // bar; therefore we add 18 to the calculate to offset this space which will be available at the end of the drillOut animation
            let containerHeight: number = this.listContainer.element.nativeElement.style['height'];
            if (incomingList.getDomNode().getBoundingClientRect().height > this.listContainer.element.nativeElement.getBoundingClientRect().height + 18) { // see above comment about 18
                this.renderer.addClass(incomingList.getDomNode(), 'scroll');
            }

            TweenMax.to([outgoingList.getDomNode(), incomingList.getDomNode()], this.animationDuration, <TweenConfig>{
                ease: Power4.easeOut,
                css: {
                    left: "+=300px"
                },
                onStartScope: this,
                onStart: function() {
                    this.searchTextBox.nativeElement.value = (incomingList.getSearchText() || "");
                    outgoingList.setSearchText(this.searchTextBox.nativeElement.value);
                },
                onUpdateScope: this,
                onUpdate: function() {
                },
                onCompleteScope: this,
                onComplete: function() {
                    this.renderer.removeClass(this.getDomNode(), "animating");
                    this.renderer.removeClass(this.getDomNode(), "drillout");
                    this.renderer.addClass(incomingList.getDomNode(), "scroll"); // restore scrolling capability
                    outgoingList.getDomNode().parentNode.removeChild(outgoingList.getDomNode());
                    outgoingList.setSearchText(this.searchTextBox.nativeElement.value);
                    this.listContainer.element.nativeElement.scrollTop = 0;  // return list to top scroll position for subsequent openings
                    this.searchTextBox.nativeElement.focus();
                }
            });
        } else {
            this.searchTextBox.nativeElement.focus();
        }
    }



    ngOnDestroy(): void {
    }
}
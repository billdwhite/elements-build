import {Component, OnInit, OnDestroy, ElementRef, EventEmitter, Input, Output, Type, ViewEncapsulation, ChangeDetectorRef} from "@angular/core";
import {ListFilter} from "./list-filter";
import {ListDataItem} from "../list-data-item";
import {ItemRenderer} from "../renderers/item-renderer.interface";
import { SelectListItemRendererComponent } from './select-list-item-renderer.component';

@Component({
    selector:        'list-view',
    templateUrl:     'list-view.component.html',
    styleUrls:      ['list-view.component.scss'],
    host:           {'class': 'list-view'},
    encapsulation:   ViewEncapsulation.Emulated
})

export class ListViewComponent implements OnInit, OnDestroy {

    static readonly EVENT_ITEMCLICKED = "eventClickListItem";


    @Input('data')
        data: ListDataItem[] = [];

    @Input('selectedData')
        selectedData: ListDataItem[] = [];

    @Input('itemRenderer')
        itemRenderer: Type<ItemRenderer> = SelectListItemRendererComponent;


    @Output('onClickListItem')
        onClickListItem: EventEmitter<ListDataItem> = new EventEmitter();


    /* used by template */
    public nomatchesText: string = 'No Matches';       // @TODO i18n
    public filter: ListFilter = new ListFilter();

    private searchText: string = '';



    constructor(private elementRef: ElementRef,
                private changeDetectorRef: ChangeDetectorRef) {
    }



    ngOnInit(): void {
    }



    public trackByFunction(index: number, listDataItem: ListDataItem): string {
        return (listDataItem && listDataItem.getId) ? listDataItem.getId() : undefined;
    }



    public getDomNode(): any {
        return this.elementRef.nativeElement;
    }



    public setData(data: ListDataItem[], selectedData: ListDataItem[]): void {
        this.data = data;
        this.selectedData = selectedData;
    }



    public getSelectedData(): Array<ListDataItem> {
        return this.selectedData;
    }



    public setFilter(listFilter: ListFilter): void { // TODO: auto render when set?
        this.filter = listFilter;
        this.changeDetectorRef.detectChanges();
    }



    public getSearchText(): string {
        return this.searchText;
    }

    public setSearchText(arg: string): void {
        this.searchText = arg;
    }



    private matches(searchText: string, testText: string): boolean {
        return searchText === "" || testText.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
    }



    /* used by template */
    public handleClick(listDataItem: ListDataItem): void {
        this.onClickListItem.emit(listDataItem);
    }



    ngOnDestroy(): void {
    }
}
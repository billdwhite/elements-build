import {Component, OnInit, Input, OnDestroy, ElementRef, EventEmitter, Output, ViewChildren, QueryList, ChangeDetectorRef, Renderer2, Type, OnChanges, ViewEncapsulation} from "@angular/core";
import {ListFilter} from "./list-filter";
import {ListDataItem} from "../list-data-item";
import {ListViewItemComponent} from "./list-view-item.component";
import {ItemRenderer} from "../renderers/item-renderer.interface";
import { SelectListItemRendererComponent } from './select-list-item-renderer.component';


@Component({
    selector:     'list-view-group',
    templateUrl:  'list-view-group.component.html',
    styleUrls:   ['list-view-group.component.scss'],
    host:        {'class': 'list-view-group'},
    encapsulation:   ViewEncapsulation.Emulated
})

export class ListViewGroupComponent implements OnInit, OnChanges, OnDestroy {

    static readonly EVENT_ITEMCLICKED = "eventClickListItem";


    @ViewChildren(ListViewItemComponent)
        private listViewItemComponents: QueryList<ListViewItemComponent> = new QueryList<ListViewItemComponent>();


    @Input('data')
        data: ListDataItem;

    @Input('itemRenderer')
        itemRenderer: Type<ItemRenderer> = SelectListItemRendererComponent;

    @Input('selectedData')
        set selectedData(arg: ListDataItem[]) {
            this._selectedData = arg;
            this.mapSelectedData();
        }
        get selectedData(): ListDataItem[] {
            return this._selectedData;
        }
        private _selectedData: ListDataItem[] = [];

    @Input('filter')
        set filter(arg: ListFilter) {
            this._filter = arg;
            this.changeDetectorRef.detectChanges();
        }
        get filter(): ListFilter {
            return this._filter;
        }
        private _filter: ListFilter;


    @Output('onClick')
        onClick: EventEmitter<ListDataItem> = new EventEmitter();


    private dataChanged: boolean = true;
    private tabIndex: number = 0;
    private hidden: boolean = false;
    private selectedDataMap: Map<string, ListDataItem>;
    private selectedDataArray: ListDataItem[];



    constructor(private elementRef: ElementRef,
                private renderer: Renderer2,
                private changeDetectorRef: ChangeDetectorRef) {
    }



    ngOnInit(): void {
        this.tabIndex = 2;
    }



    ngOnChanges(): void {
        this.render();
    }


    private mapSelectedData(): void {
        //this.selectedDataMap = new Map<string, ListDataItem>();
        //this._selectedData.forEach((nextSelectedListDataItem: ListDataItem, index: number): void => {
        //    this.selectedDataMap.set(nextSelectedListDataItem.getId() + (nextSelectedListDataItem.hasChildren() ? "-children-" + index : ""), nextSelectedListDataItem)
        //});
        this.processSelections(this.data);
    }



    private processSelections(listDataItem: ListDataItem): boolean {
        let anyChildSelected: boolean = false;
        // if this listDataItem or any of its children match any items from the selection array, mark as selected
        let selected: boolean = this._selectedData.indexOf(listDataItem) > -1;
        if (!selected && listDataItem.hasChildren()) {
            let childSelected: boolean = false;
            listDataItem.getChildren().forEach((childListDataItem: ListDataItem): void => {
                if (this.processSelections(childListDataItem)) {
                    childSelected = true;
                }
            });
            selected = childSelected;
        }
        if (selected) {
            listDataItem['__selected'] = true;
        } else {
            delete listDataItem['__selected'];
        }
        return selected;
    }

    
/*
    private mapSelectedData() {
        this.processSelections(this.data);
    }



    private recursiveSearch(listDataItem: ListDataItem): boolean {
        let returnValue: boolean = false;
        if (this._selectedData.indexOf(listDataItem) > -1) {
            returnValue = true;
        } else if (listDataItem.hasChildren()) {
            returnValue = listDataItem.getChildren().find((nextListDataItem: ListDataItem): boolean => {
                return this.recursiveSearch(nextListDataItem);
            }) != null;
        }
        return returnValue;
    }



    private processSelections(listDataItem: ListDataItem): boolean {
        let anyChildSelected: boolean = false;
        if (listDataItem.hasChildren()) {
            listDataItem.getChildren().forEach((nextChildListDataItem: ListDataItem): void => {
                let isChildSelected: boolean = _has(this.selectedDataMap, nextChildListDataItem.getId())
                                               ||
                                               _keys(this.selectedDataMap).find((nextKey: string): boolean => {
                                                   return nextKey.indexOf(nextChildListDataItem.getId() + "-children") > -1;
                                               }) != null;
                isChildSelected = this.processSelections.bind(this)(nextChildListDataItem);
                if (isChildSelected) {
                    anyChildSelected = true;
                    nextChildListDataItem['__selected'] = true;
                } else {
                    delete nextChildListDataItem['__selected'];
                }
            });
        }
        let isSelected: boolean = anyChildSelected || _has(this.selectedDataMap, listDataItem.getId());
        if (isSelected) {
            listDataItem['__selected'] = true;
        } else {
            delete listDataItem['__selected'];
        }
        return isSelected;
    }



    private processSelections1(topLevelListDataItem: ListDataItem): void {
        let anyChildSelected: boolean = false;

        topLevelListDataItem.getChildren().forEach((nextListDataItem: ListDataItem): void => {
            let isSelected: boolean = this.recursiveSearch(nextListDataItem, this._selectedData);
            if (isSelected) {
                nextListDataItem['__selected'] = true;
            } else {
                delete nextListDataItem['__selected'];
            }
        });
        //let isSelected: boolean = (this._selectedData.indexOf(listDataItem) > -1);
        //if (!isSelected) {
        //    listDataItem.getChildren()
        //}
        //if (listDataItem.hasChildren()) {
        //    listDataItem.getChildren().forEach((nextChildListDataItem: ListDataItem): void => {
        //        let isChildSelected: boolean = this.selectedDataMap.has(nextChildListDataItem.getId())
        //                                       ||
        //                                       Array.from(this.selectedDataMap.keys()).find((nextKey: string): boolean => {
        //                                           return nextKey.indexOf(nextChildListDataItem.getId() + "-children") > -1;
        //                                       }) != null;
        //        if (isChildSelected) {
        //            isChildSelected = this.processSelections.bind(this)(nextChildListDataItem);
        //            if (isChildSelected) {
        //                anyChildSelected = true;
        //                nextChildListDataItem['__selected'] = true;
        //            } else {
        //                delete nextChildListDataItem['__selected'];
        //            }
        //        }
        //    });
        //}
        //isSelected = anyChildSelected || this.selectedDataMap.has(listDataItem.getId());
//
        //return isSelected;
    }*/



    public getDomNode(): any {
        return this.elementRef.nativeElement;
    }



    /* used by template */
    public handleClick(listDataItem: ListDataItem): void {
        this.onClick.emit(listDataItem);
    }



    public render(): void {
        this.hidden = !this.listViewItemComponents.some((child: ListViewItemComponent): boolean => {
            return !child.hidden;
        });
        if (this.hidden) {
            this.renderer.addClass(this.getDomNode(), 'collapsed');
        } else {
            this.renderer.removeClass(this.getDomNode(), 'collapsed');
        }
    }



    private reset(): void {
        this._filter = null;
        this.render();
    }



    ngOnDestroy(): void {
    }
}

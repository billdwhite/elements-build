import {Component, Input, ViewEncapsulation} from "@angular/core";
import {ListDataItem} from "../list-data-item";
import {ItemRenderer} from "../renderers/item-renderer.interface";

@Component({
    templateUrl: 'select-list-item-renderer.component.html',
    styleUrls:  ['select-list-item-renderer.component.scss'],
    encapsulation:   ViewEncapsulation.Emulated
})

export class SelectListItemRendererComponent implements ItemRenderer {

    @Input('data')
        set data(listDataItemArg: ListDataItem) {
            this._data = listDataItemArg;
            this.labelText = this._data.getName();
            this.render();
        }
        private _data: ListDataItem;


    @Input('searchText')
        set searchText(searchTextArg: string) {
            this._searchText = searchTextArg;
            this.render();
        }
        private _searchText: string = '';



    public labelText: string = '';
    public preText: string = '';
    public matchText: string = '';
    public postText: string = '';



    constructor() {
    }



    private render(): void {
        let matchStart: number = this.labelText.toLowerCase().indexOf(this._searchText.toLowerCase());
        this.preText = this.labelText.substring(0, matchStart);
        this.matchText = this.labelText.substring(matchStart, matchStart + this._searchText.length);
        this.postText = this.labelText.substring(matchStart + this._searchText.length);
    }

}
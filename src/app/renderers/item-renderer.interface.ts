import {ListDataItem} from "../list-data-item";

export interface ItemRenderer{

    //render(listDataItem: ListDataItem, optionalArgs?: any): string;
    data: ListDataItem;
    searchText: string;

}
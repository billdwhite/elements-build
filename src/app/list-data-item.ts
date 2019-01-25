import {Type} from "@angular/core";
import {Observable} from "rxjs";
import {IListDataItemRenderer} from "./list-data-item-renderer";

/**
 * ListDataItem is an adapter used by list-type controls (menus, selectlists, dropdowns, etc) that want a name, description, and value.
 * This allows us to build controls (such as a "select list control") that can be used for multiple purposes,
 * such as a picker for component types, another for property definitions, or even one for customer data.
 *
 * "value" is an "any" because the controls don't care what the underlying type is.
 */
export class ListDataItem {

    /* private variables intentionally not marked private for template data binding usage */
    _id: string;
    _name: string;
    _nameAsync: Observable<string>;
    _description: string;
    _tooltipText: string;
    _value: any;
    _itemRenderer: Type<IListDataItemRenderer>;
    _group: boolean = false;
    _children: ListDataItem[] = [];
    _position: number = -1;
    _enabled: boolean = true;
    _action: Function;
    _parent: ListDataItem = null;

    text: string = '';
    items: ListDataItem[];


    constructor() {
    }



    public getId(): string {
        return this._id;
    }
    public setId(idArg: string): void {
        this._id = idArg;
    }



    public getName(): string {
        return this._name;
    }
    public setName(nameArg: string): void {
        this._name = nameArg;
        this.text = this._name;
    }



    public getNameAsync(): Observable<string> {
        return this._nameAsync;
    }
    public setNameAsync(nameArg: Observable<string>): void {
        this._nameAsync = nameArg;
    }



    public getDescription(): string {
        return this._description;
    }
    public setDescription(descriptionArg: string): void {
        this._description = descriptionArg;
    }



    public getTooltipText(): string {
        return this._tooltipText;
    }
    public setTooltipText(tooltipTextArg: string): void {
        this._tooltipText = tooltipTextArg;
    }



    public getValue(): any {
        return this._value;
    }
    public setValue(value: any): void {
        this._value = value;
    }
    public hasValue(): boolean {
        return this._value != null;
    }



    public getItemRenderer(): Type<IListDataItemRenderer> {
        return this._itemRenderer;
    }
    public setItemRenderer(itemRenderer: Type<IListDataItemRenderer>): void {
        this._itemRenderer = itemRenderer;
    }
    public hasItemRenderer(): boolean {
        return this._itemRenderer != null;
    }



    public getChildren(): ListDataItem[] {
        return this._children;
    }
    public setChildren(arg: ListDataItem[]): void {
        this._children = arg;
        this.items = this._children;
    }
    public addChild(arg: ListDataItem): void {
        if (!this._children) {
            this._children = [];
        }
        this._children.push(arg);
        this.items = this._children;
    }
    public addChildren(arg: ListDataItem[]): void {
        if (!this._children) {
            this._children = arg;
        } else{
            this._children = this._children.concat(arg);
        }
        this.items = this._children;
    }
    public hasChildren(): boolean {
        return this._children && this._children.length > 0;
    }



    public getParent(): ListDataItem {
        return this._parent;
    }
    public setParent(arg: ListDataItem): void {
        this._parent = arg;
    }
    public hasParent(): boolean {
        return this._parent != null;
    }



    public addParentToChildren(): void {
        if (this._children) {
            for (let child of this._children) {
                child.setParent(this.getValue() ? this : this._parent);
            }
        }
    }



    public getPosition(): number {
        return this._position;
    }
    public setPosition(positionArg: number): void {
        this._position = positionArg;
    }



    // A group only item is usually intended for the purposes of grouping. (i.e. divided content in a popup menu)
    public isGroup(): boolean {
        return this._group;
    }
    public setIsGroup(value: boolean): void {
        this._group = value;
    }



    public setEnabled(isEnabled: boolean): void {
        this._enabled = isEnabled;
    }
    public isEnabled(): boolean {
        return this._enabled;
    }



    public setAction(actionFunction: Function): void {
        this._action = actionFunction;
    }
    public getAction(): Function {
        return this._action;
    }
    public hasAction(): boolean {
        return this._action != null;
    }



    static create(id: string,
                 name: string,
                 description: string,
                 value: any,
                 actionArg?: Function,
                 itemRenderer?: Type<IListDataItemRenderer>,
                 nameAsync?: Observable<string>): ListDataItem {
        let listItem: ListDataItem = new ListDataItem();
        listItem.setId(id);
        listItem.setName(name);
        listItem.setNameAsync(nameAsync);
        listItem.setDescription(description);
        listItem.setValue(value);
        listItem.setAction(actionArg);
        listItem.setItemRenderer(itemRenderer);
        return listItem;
    }



    static fromJSON(json: any): ListDataItem {
        let listDataItem: ListDataItem = new ListDataItem();
        listDataItem.setId(json._id);
        listDataItem.setName(json.name);
        listDataItem.setDescription(json.description);
        listDataItem.setTooltipText(json.tooltipText);
        listDataItem.setValue(json.value);
        if (json._children) {
            let children = json._children.map((next: any): ListDataItem => {
                return ListDataItem.fromJSON(next);
            });
            listDataItem.setChildren(children);
        }
        return listDataItem;
    }



    static fromJSONArray(jsonArray: any[]): ListDataItem[] {
        return jsonArray.map((nextJSON: any) => {
            return ListDataItem.fromJSON(nextJSON);
        });
    }
}

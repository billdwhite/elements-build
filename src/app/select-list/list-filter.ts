import {isUndefined as _isUndefined, isNull as _isNull} from "lodash";

export class ListFilter {

    /* private variables intentionally not marked private for template data binding usage */
    _text: string = '';
    _selected: boolean = false;



    constructor() {
    }



    public hasText(): boolean {
        return (!_isUndefined(this._text) && !_isNull(this._text) && this._text.length > 0);
    }
    public getText(): string {
        return this._text;
    }
    public setText(arg: string): void {
        this._text = arg;
    }



    public getSelected(): boolean {
        return !!this._selected;
    }
    public setSelected(arg: boolean): void {
        this._selected = arg;
    }
}
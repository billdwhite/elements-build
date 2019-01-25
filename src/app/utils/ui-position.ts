export class UIPosition {

    _top: number = 0;
    _left: number = 0;
    _height: number = 0;
    _width: number = 0;
    _placement: string = '';



    public getTop(): number {
        return this._top;
    }
    public setTop(topArg: number): void {
        this._top = topArg;
    }



    public getLeft(): number {
        return this._left;
    }
    public setLeft(leftArg: number): void {
        this._left = leftArg;
    }



    public getHeight(): number {
        return this._height;
    }
    public setHeight(heightArg: number): void {
        this._height = heightArg;
    }



    public getWidth(): number {
        return this._width;
    }
    public setWidth(widthArg: number): void {
        this._width = widthArg;
    }



    public getPlacement(): string {
        return this._placement;
    }
    public setPlacement(placementArg: string): void {
        this._placement = placementArg;
    }



    public getRight(): number {
        return this._left + this._width;
    }



    public getBottom(): number {
        return this._top + this._height;
    }



    public static create(leftArg: number, topArg: number, widthArg: number=0, heightArg: number=0, placementArg: string=null): UIPosition {
        let position: UIPosition = new UIPosition();
        position.setTop(topArg);
        position.setLeft(leftArg);
        position.setWidth(widthArg);
        position.setHeight(heightArg);
        position.setPlacement(placementArg);
        return position;
    }



    public static clone(position: UIPosition): UIPosition {
        return UIPosition.create(position.getLeft(), position.getTop(), position.getWidth(), position.getHeight(), position.getPlacement());
    }



    public toString(): string {
        return "ui-position[ " + this._left + " | " + this._top + " | " + this._width + " | " + this._height + " ]";
    }
}
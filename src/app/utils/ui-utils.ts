import {ElementRef} from "@angular/core";
import {UIPosition} from './ui-position';


export class UIUtils {


    /**
     * Get the current coordinates of the element, relative to the offset parent, in the form of a UIPosition instance
     */
    public static position(element: any): UIPosition {
        let nativeEl: any = element.nativeElement ? element.nativeElement : element;
        let elementBoundingClientRect: UIPosition = UIUtils.offset(nativeEl);
        let offsetParentPosition: UIPosition = new UIPosition();
        let offsetParentElement: any = UIUtils.parentOffsetEl(nativeEl);
        if (offsetParentElement !== document) {
            offsetParentPosition = UIUtils.offset(offsetParentElement);
            offsetParentPosition.setTop(offsetParentPosition.getTop() + offsetParentElement.clientTop - offsetParentElement.scrollTop);
            offsetParentPosition.setLeft(offsetParentPosition.getLeft() + offsetParentElement.clientLeft - offsetParentElement.scrollLeft);
        }
        let boundingClientRect: ClientRect = nativeEl.getBoundingClientRect();
        let returnPosition: UIPosition = new UIPosition();
        returnPosition.setWidth(boundingClientRect.width || nativeEl.offsetWidth);
        returnPosition.setHeight(boundingClientRect.height || nativeEl.offsetHeight);
        returnPosition.setTop(elementBoundingClientRect.getTop() - offsetParentPosition.getTop());
        returnPosition.setLeft(elementBoundingClientRect.getLeft() - offsetParentPosition.getLeft());
        return returnPosition;
    }



    /**
     * Get the current coordinates of the element in the form of a UIPosition instance.
     */
    public static offset(element: any): UIPosition {
        let nativeEl: any = element.nativeElement ? element.nativeElement : element;
        let boundingClientRect: ClientRect = nativeEl.getBoundingClientRect();
        let returnPosition: UIPosition = new UIPosition();
        returnPosition.setWidth(boundingClientRect.width || nativeEl.offsetWidth);
        returnPosition.setHeight(boundingClientRect.height || nativeEl.offsetHeight);
        returnPosition.setTop(boundingClientRect.top + (window.pageYOffset || document.documentElement.scrollTop));
        returnPosition.setLeft(boundingClientRect.left + (window.pageXOffset || document.documentElement.scrollLeft));
        return returnPosition;
    }



    /**
     * Provides coordinates for an element in relation to the relativeElement
     */
    public static getRelativeElementPosition(elementRef: ElementRef,
                                             relativeElementRef: ElementRef,
                                             placement: string,
                                             appendToBody: boolean,
                                             padding: number=5): UIPosition {
        let relativeElement: any = relativeElementRef.nativeElement ? relativeElementRef.nativeElement : relativeElementRef;
        let targetElement: any = elementRef.nativeElement ? elementRef.nativeElement : elementRef;
        let windowPosition: UIPosition = UIUtils.position(window.document.documentElement);
        let relativeElementPos: UIPosition = appendToBody ? UIUtils.offset(relativeElement) : UIUtils.position(relativeElement);
        let targetElementWidth: number = targetElement.offsetWidth;
        let targetElementHeight: number = targetElement.offsetHeight;
        if (placement == null) {
            placement = "bottom-center";
        }
        let placementParts: string[] = placement.split('-');
        let pos0: string = placementParts[0];
        let pos1: string = placementParts[1] || 'center';
        let shiftWidth: Object = {
            center: function () {
                return relativeElementPos.getLeft() + relativeElementPos.getWidth() / 2 - targetElementWidth / 2;
            },
            left: function () {
                return relativeElementPos.getLeft();
            },
            leftoffset: function() {
                return relativeElementPos.getLeft() - targetElementWidth;
            },
            right: function () {
                return relativeElementPos.getLeft() + relativeElementPos.getWidth();
            }
        };
        let shiftHeight: Object = {
            center: function (): number {
                return relativeElementPos.getTop() + relativeElementPos.getHeight() / 2 - targetElementHeight / 2;
            },
            top: function (): number {
                return relativeElementPos.getTop();
            },
            bottom: function (): number {
                return relativeElementPos.getTop() + relativeElementPos.getHeight();
            }
        };
        // create position to return
        let targetElementPos: UIPosition = new UIPosition();
        targetElementPos.setWidth(targetElementWidth);
        targetElementPos.setHeight(targetElementHeight);
        /*
        // determine x/y position
        switch (pos0) {
            case 'right':
                targetElementPos.setTop(shiftHeight[pos1]());
                targetElementPos.setLeft(shiftWidth[pos0]());
                break;
            case 'left':
                targetElementPos.setTop(shiftHeight[pos1]());
                targetElementPos.setLeft(relativeElementPos.getLeft() - targetElementWidth);
                break;
            case 'aligntop':
                targetElementPos.setTop(shiftHeight['top']());
                targetElementPos.setLeft(shiftWidth[pos1]());
                break;
            case 'bottom':
                targetElementPos.setTop(shiftHeight[pos0]());
                targetElementPos.setLeft(shiftWidth[pos1]());
                break;
            default:
                targetElementPos.setTop(relativeElementPos.getTop() - targetElementHeight);
                targetElementPos.setLeft(shiftWidth[pos1]());
                break;
        }

        if (targetElementPos.getBottom() > windowPosition.getBottom() ||
            targetElementPos.getRight() > windowPosition.getRight() ||
            targetElementPos.getTop() < windowPosition.getTop() ||
            targetElementPos.getLeft() < windowPosition.getLeft()) {
            targetElementPos = UIUtils.getRelativeElementBestFitPosition(targetElementPos, relativeElementPos, padding, pos0);
        }
        */

        targetElementPos.setWidth(Math.min(targetElementWidth, (windowPosition.getWidth() - relativeElementPos.getLeft() - padding*2)));
        targetElementPos.setHeight(Math.min(targetElementHeight, (windowPosition.getHeight() - relativeElementPos.getTop() - padding*2 - 30)));

        return targetElementPos;
    }



    public static getRelativeElementBestFitPosition(targetElementPos: UIPosition,
                                                    relativeElementPos: UIPosition,
                                                    position: string,
                                                    padding: number=5): UIPosition {
        // create position to return
        let windowPosition: UIPosition = UIUtils.position(window.document.documentElement);
        let targetElementWidth: number = targetElementPos.getWidth();
        let targetElementHeight: number = targetElementPos.getHeight();
        // if the resulting placement results in clipping, adjust the position
        let spaceAbove: number = relativeElementPos.getTop() - (padding);
        let spaceBelow: number = (windowPosition.getHeight() - relativeElementPos.getTop() - relativeElementPos.getHeight() - padding);
        let proposedY: number = targetElementPos.getTop();
        let proposedWidth: number = Math.min(targetElementWidth, windowPosition.getWidth());
        let proposedHeight: number = Math.max(spaceAbove, spaceBelow);
        if (targetElementHeight < spaceBelow) {
            proposedHeight = targetElementHeight;
            proposedY = relativeElementPos.getTop();
        } else if (targetElementHeight < spaceAbove) {
            proposedHeight = targetElementHeight;
            proposedY = relativeElementPos.getTop() - proposedHeight;
        } else if (spaceAbove > spaceBelow) {
            proposedHeight = spaceAbove;
            proposedY = padding;
        } else {
            proposedHeight = spaceBelow;
            //proposedY = relativeElementPos.getBottom();
        }
        let proposedX: number = targetElementPos.getLeft();
        let spaceRight: number = windowPosition.getWidth() - relativeElementPos.getLeft();
        if (!(targetElementWidth < spaceRight)) {
            proposedX = Math.max(relativeElementPos.getRight() - targetElementWidth, 0);
        }
        if (!(targetElementWidth < spaceRight - relativeElementPos.getWidth()) && position == 'right') {
            proposedX = Math.max(relativeElementPos.getLeft() - targetElementWidth, 0);
            targetElementPos.setPlacement("left");
        }
        targetElementPos.setTop(proposedY);
        targetElementPos.setLeft(proposedX);
        targetElementPos.setWidth(proposedWidth);
        targetElementPos.setHeight(proposedHeight);

        return targetElementPos;
    }



    public static getWindowFitPositionForElement(element: any, padding: number=5): UIPosition {
        let nativeEl: any = element.nativeElement ? element.nativeElement : element;
        // create position to return
        let targetElementPos: UIPosition = UIUtils.offset(nativeEl);
        return UIUtils.getWindowFitPosition(targetElementPos, padding);
    }



    public static getWindowFitPosition(originalPosition: UIPosition, padding: number=5): UIPosition {
        // adjust sizing to fit within window
        let targetElementPosition: UIPosition = UIPosition.clone(originalPosition);
        let windowPosition: UIPosition = UIUtils.position(window.document.documentElement);
        targetElementPosition.setLeft(Math.min(Math.max(padding, targetElementPosition.getLeft()), windowPosition.getWidth() - targetElementPosition.getWidth() + padding));
        targetElementPosition.setTop(Math.min(Math.max(padding, targetElementPosition.getTop()), windowPosition.getHeight() - targetElementPosition.getHeight() + padding));
        targetElementPosition.setWidth(Math.min(targetElementPosition.getWidth(), windowPosition.getWidth() - padding*2));
        targetElementPosition.setHeight(Math.min(targetElementPosition.getHeight(), windowPosition.getHeight() - padding*2));
        return targetElementPosition;
    }



    public static setPosition(element: any, position: UIPosition): void {
        let nativeEl: any = element.nativeElement ? element.nativeElement : element;
        nativeEl.style['top'] = position.getTop() + "px";
        nativeEl.style['left'] = position.getLeft() + "px";
        if (nativeEl.offsetWidth > position.getWidth()) {
            nativeEl.style['width'] = position.getWidth() + "px";
        }
        if (nativeEl.offsetHeight > position.getHeight()) {
            nativeEl.style['height'] = position.getHeight() + "px";
        }
    }



    private static debugCheck(element: any) {
        let nativeEl: any = element.nativeElement ? element.nativeElement : element;
        if (nativeEl.offsetWidth == 0 && nativeEl.offsetHeight == 0) {
        }
    }



    public static get window(): any {
        return window;
    }



    public static get document(): any {
        return window.document;
    }



    public static getStyle(nativeEl: any, cssProp: string): any {
        if (window.getComputedStyle) {
            return window.getComputedStyle(nativeEl)[cssProp];
        }
        // finally try and get inline style
        return nativeEl.style[cssProp];
    }



    /**
     * Checks if a given element is statically positioned
     * @param nativeEl - raw DOM element
     */
    public static isStaticPositioned(nativeEl: any): any {
        return (UIUtils.getStyle(nativeEl, 'position') || 'static' ) === 'static';
    }



    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param nativeEl
     */
    public static parentOffsetEl(element: any): any {
        let nativeEl: any = element.nativeElement ? element.nativeElement : element;
        let offsetParent = nativeEl.offsetParent || document;
        while (offsetParent && offsetParent !== document && UIUtils.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || document;
    }



    public static getXYFromTranslate(translateString: string): [number, number] {
        let split: string[] = translateString.split(",");
        let x: number = split[0] ? ~~split[0].split("(")[1] : 0;
        let y: number = split[1] ? ~~split[1].split(")")[0] : 0;
        return [x, y];
    }



    public static getXYFromTranslateOnNode(element: any, scrollElement: any=null): [number, number] {
        let returnArray: [number, number] = UIUtils.getXYFromTranslate(element.getAttribute("transform"));
        if (scrollElement) {
            returnArray[0] = (returnArray[0] - scrollElement.scrollLeft);
            returnArray[1] = (returnArray[1] - scrollElement.scrollTop);
        }
        return returnArray;
    }



    public static round(valueArg: number, precisionArg: number=0): number {
        let f: number = Math.pow(10, precisionArg || 0);
        return Math.round(valueArg * f) / f;
    }
}
import {ListDataItem} from "../list-data-item";
import * as Collections from "typescript-collections";

export class Utils {


    public static createListDataItem(idArg: string, labelArg: string, descriptionArg: string, valueArg: any, actionArg: Function): ListDataItem {
        return ListDataItem.create(idArg, labelArg, descriptionArg, valueArg, actionArg);
    }



    public static createSelectListDataItemArray(sourceArray: any[], prefixWithNone: boolean=true, ungrouped: boolean=false): ListDataItem[] {
        let returnGroupArray: ListDataItem[];

        if (ungrouped || sourceArray.length === 0 || (sourceArray[0] != null && sourceArray[0]['getGroups'] == undefined)) { // getGroupss is needed for grouping (i.e. PropDefs); if missing, use ungrouped
            returnGroupArray = [];
            if (prefixWithNone) {
                returnGroupArray.push(Utils.getNoneData());
            }
            returnGroupArray = returnGroupArray.concat(
                sourceArray.map((nextItem: any): ListDataItem => {
                    return ListDataItem.create(nextItem.getSystemName() || nextItem['_cvUri'],
                                               Utils.getDisplayName(nextItem),
                                               nextItem.getDescription(),
                                               nextItem);
                })
            );
        } else {
            let groupMap: Collections.Dictionary<string, ListDataItem> = new Collections.Dictionary<string, ListDataItem>();

            if (prefixWithNone) {
                let noneData: ListDataItem = Utils.getNoneDataGroup();
                groupMap.setValue('none', noneData);
            }
/*
            sourceArray.forEach((nextItem: any): void => {
                let group: PropertyDefinitionGroup = nextItem.getGroups()[0];
                if (!groupMap.containsKey(group.getName())) {
                    let groupListDataItem: ListDataItem = ListDataItem.create(group.getName(), group.getName(), group.getName(), null);
                    groupListDataItem.setPosition(group.getOrder());
                    groupListDataItem.setIsGroup(true);
                    groupListDataItem.setChildren([]);
                    groupMap.setValue(group.getName(), groupListDataItem);
                }
                let listDataItem: ListDataItem = ListDataItem.create(
                    nextItem.getSystemName() || nextItem['_cvUri'],
                    Utils.getDisplayName(nextItem),
                    nextItem.getDescription(),
                    nextItem
                );
                groupMap.getValue(group.getName()).addChild(listDataItem);
            });
            */

            returnGroupArray = groupMap.values().sort((a: ListDataItem, b: ListDataItem): number => {
                return a.getPosition() - b.getPosition();
            });
        }
        return returnGroupArray;
    }



    // TODO: use of displayName (vs name) across instances  & metamodel objects is confusing and needs to be rationalized
    // for now this method can deal with the various permutations
    protected static getDisplayName(obj: any) {
        let displayName =  obj.getDisplayName ? obj.getDisplayName() : null;
        let name = obj.getName ? obj.getName() : null;
        return displayName || name || obj;
    }



    public static createListDataItems(sourceArray: any[], prefixWithNone: boolean=false): ListDataItem[] {
        let returnArray: ListDataItem[] = sourceArray.map((nextItem: any) => {
            return Utils.createListDataItem(nextItem._id,
                                            nextItem._name,
                                            nextItem._description,
                                            nextItem,
                                            null);
        });
        if (prefixWithNone) {
            returnArray.unshift(Utils.getNoneData()); // using an empty StringPropDef to avoid null calls
        }
        return returnArray;
    }



    public static getNoneDataGroup(): ListDataItem {
        let noneDataGroup: ListDataItem =  ListDataItem.create('none', '', '', null);
        noneDataGroup.setChildren([Utils.getNoneData()]);
        noneDataGroup.setIsGroup(true);
        noneDataGroup.setPosition(0);
        return noneDataGroup;
    }



    public static getNoneData(): ListDataItem {
        let noneData: ListDataItem =  ListDataItem.create('none', '(none)', '', null);
        noneData.setIsGroup(false);
        noneData.setChildren(null);
        noneData.setPosition(0);
        return noneData;
    }



    public static createListDataItemGroup(id: string, title: string, description: string, children: ListDataItem[]): ListDataItem {
        let returnGroupListDataItem: ListDataItem = ListDataItem.create(id, title, description, null);
        returnGroupListDataItem.setIsGroup(true);
        returnGroupListDataItem.setChildren(children);
        return returnGroupListDataItem;
    }



    public static findListDataItem(searchName: string, listDataItems: ListDataItem[]): ListDataItem {
        let foundItem: ListDataItem;
        listDataItems.some((nextListDataItem: ListDataItem) => {
            foundItem = nextListDataItem.isGroup()
                        ? Utils.findListDataItemWithGroup(searchName, nextListDataItem)
                        : ((nextListDataItem.getId() == searchName) ? nextListDataItem : null);
            return foundItem != null;
        });
        return foundItem;
    }



    public static findListDataItemWithGroup(searchName: string, listDataItem: ListDataItem): ListDataItem {
        // declare recursive search function
        let recursiveSearch: Function = (searchName: string, listDataItem: ListDataItem): ListDataItem => {
            let foundItem: ListDataItem = listDataItem.getChildren().find((nextListDataItem: ListDataItem) => {
                if (nextListDataItem.isGroup()) {
                    return recursiveSearch(searchName, nextListDataItem);
                } else if (nextListDataItem.getId() == searchName) {
                    return nextListDataItem
                }
            });
            return foundItem;
        };
        return recursiveSearch(searchName, listDataItem);
    }



    public static UUID(): string {
        if (typeof (window.crypto) !== "undefined" && typeof (window.crypto.getRandomValues) !== "undefined") {
            // If we have a cryptographically secure PRNG, use that
            // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
            let buf: Uint16Array = new Uint16Array(8);
            window.crypto.getRandomValues(buf);
            return (this.pad4(buf[0]) + this.pad4(buf[1]) + "-" + this.pad4(buf[2]) + "-" + this.pad4(buf[3]) + "-" + this.pad4(buf[4]) + "-" + this.pad4(buf[5]) + this.pad4(buf[6]) + this.pad4(buf[7]));
        } else {
            // Otherwise, just use Math.random
            // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
            // https://stackoverflow.com/questions/11605068/why-does-jshint-argue-against-bitwise-operators-how-should-i-express-this-code
            return this.random4() + this.random4() + "-" + this.random4() + "-" + this.random4() + "-" +
                   this.random4() + "-" + this.random4() + this.random4() + this.random4();
        }
    }



    private static pad4(num: number): string {
        let ret: string = num.toString(16);
        while (ret.length < 4) {
            ret = "0" + ret;
        }
        return ret;
    }



    private static random4(): string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }



    public static randomString(): string {
        return Utils.random4();
    }



    public static isString(obj:any): boolean {
        return typeof obj === "string";
    }



    public static isNumber(obj: any): boolean {
        return typeof obj === "number";
    }



    public static isFunction(obj: any) {
        return typeof obj === "function";
    }


    public static isPresent(obj: any) {
        return obj !== undefined && obj !== null;
    }



    public static sanitizeFileName(originalFileName: string): string {
        return originalFileName.replace(/[^0-9A-Z-]/ig, '_');
    }
}
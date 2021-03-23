/* eslint-disable no-unused-vars */
import { v4 as uuidv4 } from 'uuid';
import {ChiliResponseMessage} from "./types/ChiliResponseMessage";
import {ChiliPostMessage} from "./types/ChiliPostMessage";

export default class EditorPostObject {

    private contentWindow: Window;
    private parentWindow : Window;

    constructor(iframe: HTMLFrameElement, parentWindow = null) {

        if (iframe != null) {

            this.parentWindow = parentWindow ?? window;

            if (iframe.tagName.toLowerCase() == "iframe" && (iframe.src != null || iframe.src != "") && iframe.contentWindow != null) {

                this.parentWindow.addEventListener('message', e => {

                    this.handleEvents(e.data);

                }, false);

                this.contentWindow = iframe.contentWindow;

            }
            else {
                throw "No iframe with scr";
            }
        }
        else {
            throw "No iframe";
        }
    }


    // eslint-disable-next-line @typescript-eslint/ban-types
    private eventCallbacks:Record<string, Function> = {};
    // eslint-disable-next-line @typescript-eslint/ban-types
    private chiliEventListenerCallbacks:Record<string, Function> = {};

    private handleEvents(data: ChiliResponseMessage) {

        const { type, event, result, id } = data;

        if (type != null) {

            switch (type) {

                case "ChiliReturnProperty":
                case "ChiliReturnFunction":
                case "ChiliReturnObject": {

                    if (id != null && this.eventCallbacks[id] != null) {
                        this.eventCallbacks[id](result);
                    }

                    break;
                }
                case "ChiliEvent": {


                    // @ts-ignore
                    if (this.parentWindow.OnEditorEvent != null) {
                        // @ts-ignore
                        this.parentWindow.OnEditorEvent(event);
                    }
                    if (event != null && this.chiliEventListenerCallbacks[event] != null) {
                        this.chiliEventListenerCallbacks[event]();
                    }

                    break;
                }
                default:
                    break;
            }

        }

    }

    public async GetObject(chiliPath: string):Promise<ChiliResponseMessage> {

        const uuid = uuidv4();

        const message:ChiliPostMessage = {
            method: "GetObject",
            id: uuid,
            path: chiliPath,
        }

        this.contentWindow.postMessage(message, "*");

        const result = await (new Promise<ChiliResponseMessage>((resolve) => {
            this.eventCallbacks[uuid] = (result:ChiliResponseMessage) => {
                resolve(result);
            }
        }));

        delete this.eventCallbacks[uuid];

        return result;
    }

    public async SetProperty(chiliPath: string, property: string, value: string|number|boolean):Promise<ChiliResponseMessage> {

        const uuid = uuidv4();

        const message:ChiliPostMessage = {
            method: "SetProperty",
            id: uuid,
            path: chiliPath,
            property: property,
            value: value,
        }

        this.contentWindow.postMessage(message, "*");

        const result = await (new Promise<ChiliResponseMessage>((resolve) => {
            this.eventCallbacks[uuid] = (result:ChiliResponseMessage) => {
                resolve(result);
            }
        }));

        delete this.eventCallbacks[uuid];

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public AddListener(eventName: string, callBackFunction : Function):void {

        const message:ChiliPostMessage = {
            method: "AddListener",
            id: "event",
            eventName: eventName,
        }

        this.contentWindow.postMessage(message, "*");

        this.chiliEventListenerCallbacks[eventName] = callBackFunction;
    }

    public async ExecuteFunction(chiliPath: string, func: string, ...parameters: string[]):Promise<ChiliResponseMessage> {

        const uuid = uuidv4();

        const message:ChiliPostMessage = {
            method: "ExecuteFunction",
            id: uuid,
            path: chiliPath,
            function: func,
            parameters: parameters,
        }

        this.contentWindow.postMessage(message, "*");

        const result = await (new Promise<ChiliResponseMessage>((resolve) => {
            this.eventCallbacks[uuid] = (result:ChiliResponseMessage) => {
                resolve(result);
            }
        }));

        delete this.eventCallbacks[uuid];

        return result;
    }

}
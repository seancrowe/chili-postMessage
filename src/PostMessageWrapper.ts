import {ChiliPostMessage} from "./types/ChiliPostMessage";
import {ChiliResponseMessage} from "./types/ChiliResponseMessage";

export default class PostMessageWrapper {

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
    }

    public static setupEventListeners(editorObject:EditorObjectDuck):void {

        window.addEventListener('message', e => {

            const postMessage = e.data as ChiliPostMessage;

            if (postMessage.path != null) {
                if (postMessage.method == "GetObject") {
                    const response = editorObject.GetObject(postMessage.path);

                    const message: ChiliResponseMessage = {
                        type: "ChiliReturnObject",
                        id: postMessage.id,
                        result: response
                    };

                    window.parent.postMessage(message, "*");
                }

                if (postMessage.method == "SetProperty" && postMessage.property != null && postMessage.value != null) {

                    const response = editorObject.SetProperty(postMessage.path, postMessage.property, postMessage.value);

                    const message: ChiliResponseMessage = {
                        type: "ChiliReturnProperty",
                        id: postMessage.id,
                        result: response,
                    };

                    window.parent.postMessage(message, "*");
                }

                if (postMessage.method == "ExecuteFunction" && postMessage.function != null) {


                    const response = (postMessage.parameters != null) ? editorObject.ExecuteFunction(postMessage.path, postMessage.function, ...postMessage.parameters) : editorObject.ExecuteFunction(postMessage.path, postMessage.function);

                    const message:ChiliResponseMessage = {
                        type: "ChiliReturnFunction",
                        id: postMessage.id,
                        result: response,
                    }

                    window.parent.postMessage(message, "*");
                }
            }

            if (postMessage.method == "AddListener" && postMessage.eventName != null) {

                const eventName = postMessage.eventName;

                console.log(postMessage.eventName);

                editorObject.ExecuteFunction("document", "AddEventListener", eventName, (e:any) => {

                    console.log("fired");

                    const message:ChiliResponseMessage = {
                        type: "ChiliEvent",
                        event: eventName,
                        id: "event" // id - their is not way to get the id because e is obfuscated
                    }

                    window.parent.postMessage(message, "*");
                });
            }

        });

    }

}


interface EditorObjectDuck  {
    ExecuteFunction(path:string, functionName:string, ...params:any[]):any;
    SetProperty(path:string, property:string, value:string|number|boolean):any;
    GetObject(path:string):any;
}

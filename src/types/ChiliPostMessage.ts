export type ChiliPostMessage = {
    method: string,
    id: string,
    eventName?: string,
    property?:string,
    value?:string|number|boolean,
    path?: string,
    function?: string,
    parameters?: string[]|null,
}



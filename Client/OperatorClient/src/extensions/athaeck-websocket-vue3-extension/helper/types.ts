export class SendEvent {
    public eventName: string;
    public data: { [key: string]: any };

    constructor(name: string) {
        this.eventName = name;
        this.data = {};
    }

    public get JSONString():string {
        return JSON.stringify(this)
    }

    public addData(key: string, value: any) {
        this.data[key] = value;
    }

}
import WebSocket from 'ws';
import { exec } from 'child_process';
import config from "config"
import { EventEmitter } from "events"

const socket: any = config.get("socket")
const azureKinect: any = config.get("azureKinect")
const url: string = `ws://${socket.host}:${socket.port}`
const ws = new WebSocket(url);


export class ReceivedEvent {
    public eventName: string;
    public data: { [key: string]: any };

    constructor(name: string) {
        this.eventName = name;
        this.data = {};
    }

    public get JSONString(): string {
        return JSON.stringify(this)
    }

    public addData(key: string, value: any) {
        this.data[key] = value;
    }

}


class RecorderHooks extends EventEmitter {



    public DispatchHook(hook: string, body: any) {
        this.emit(hook, body)
    }
    public SubscribeHookListener(hook: string, listener: (data: any) => void) {
        this.on(hook, listener);
    }
    public UnSubscribeListener(hook: string, listener: (data: any) => void) {
        this.off(hook, listener)
    }
}

const recorderHooks: RecorderHooks = new RecorderHooks()

recorderHooks.SubscribeHookListener("ON_PREPARE_RECORD", (body: any) => {
    const fileName: string = body.Proxy.FileName + azureKinect.type + azureKinect.id
    const sdkPath: string = azureKinect.sdkPath
    const folderPath: string = azureKinect.folderPath
    const baseCommand: string = azureKinect.baseCommand

    const command = baseCommand
        .replace("{{fileName}}", fileName)
        .replace("{{sdkPath}}", `"${sdkPath}"`)
        .replace("{{folderPath}}", `"${folderPath}"`)
        .replaceAll("/", "\\");


    executeCommand(command)

    const waitingEvent: ReceivedEvent = new ReceivedEvent("PROCESS_RECORDING")
    waitingEvent.addData("State", "Waiting")
    ws.send(waitingEvent.JSONString)
})




ws.on('open', () => {
    console.log('Connected to the WebSocket server');

    const connect: ReceivedEvent = new ReceivedEvent("INIT_RECORDER")
    connect.addData("Type", azureKinect.type)
    connect.addData("ID", azureKinect.id)

    ws.send(connect.JSONString)
});



ws.on('message', (body) => {
    const jsonBody = JSON.parse(body.toString());
    const event = jsonBody.hasOwnProperty("eventName") ? jsonBody["eventName"] : ""
    const data = jsonBody.hasOwnProperty("data") ? jsonBody["data"] : ""

    console.log(event)
    console.log(data)

    recorderHooks.DispatchHook(event, data)

});



function executeCommand(command: string) {
    console.log(command)
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Error output: ${stderr}`);
            return;
        }
        console.log(`Command output: ${stdout}`);
    });
}


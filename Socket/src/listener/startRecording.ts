import { WebSocket } from "ws";
import { BaseWebSocketListener } from "../../athaeck-websocket-express-base/base";
import { WebSocketHooks } from "../../athaeck-websocket-express-base/base/hooks";
import { RecorderOperator } from "../..";
import { Free3DKeys } from "../types/keys";
import { RecorderHooks } from "../hooks/recorderHooks";
import { TPrepareRecord } from "../types/recorder";
import { OperatorHooks } from "../hooks/operatorHooks";
import { Recorder } from "../data/recorder";
import { ReceivedEvent } from "../../athaeck-websocket-express-base/base/helper";
import { Supervisor } from "../data/supervisor";


class StartRecording extends BaseWebSocketListener {
    listenerKey: string;
    private _operator: RecorderOperator | null = null
    private _isPrepared: boolean = true;
    private _supervisor: Supervisor | null = null

    constructor(webSocketServer: RecorderOperator, webSocket: WebSocket, webSocketHooks: RecorderHooks) {
        super(webSocketServer, webSocket, webSocketHooks)

        this._operator = this.webSocketServer as RecorderOperator

        this.webSocketHooks.SubscribeHookListener(RecorderHooks.CREATE_SUPERVISOR, this.OnCreateSupervisor)
        this.webSocketHooks.SubscribeHookListener(RecorderHooks.REMOVE_SUPERVISOR, this.OnRemoveSupervisor)
    }

    private OnUpdateRecorder = (recorder: Recorder[]) => {
        this._isPrepared = this.ValidateRecorderStates(recorder)
    }
    private ValidateRecorderStates(recorder: Recorder[]): boolean {

        for (const element of recorder) {

            if (element.Type === 'Sub') {
                if (element.State !== 'Waiting') {
                    return false;
                }
            } else if (element.Type === 'Master') {
                if (element.State !== 'Idle') {
                    return false;
                }
            }
        }
        return true;
    }
    private OnCreateSupervisor = (supervisor: Supervisor) => {
        this._supervisor = supervisor
        this._operator?.Hooks.SubscribeHookListener(OperatorHooks.UPDATE_RECORDER, this.OnUpdateRecorder)
    }
    private OnRemoveSupervisor = (supervisor: Supervisor) => {
        this._operator?.Hooks.UnSubscribeListener(OperatorHooks.UPDATE_RECORDER, this.OnUpdateRecorder)
        this._supervisor = null
    }

    protected SetKey(): void {
        this.listenerKey = Free3DKeys.TRIGGER_RECORD
    }
    public OnDisconnection(webSocket: WebSocket, hooks: WebSocketHooks): void {
        this.webSocketHooks.UnSubscribeListener(RecorderHooks.CREATE_RECORDER, this.OnCreateSupervisor)
        this.webSocketHooks.UnSubscribeListener(RecorderHooks.REMOVE_RECORDER, this.OnRemoveSupervisor)
    }
    protected listener(body: TPrepareRecord): void {
        if (this._supervisor === null) {
            console.log("Supervisor muss erst initiiert werden.")
            return;
        }

        const fileName: string = body.FileName

        if (!this._isPrepared) {
            console.log("Recorder wurden bereits gestartet.")

            const errorEvent: ReceivedEvent = new ReceivedEvent("ERROR");
            errorEvent.addData("Message", "Recorder wurden bereits gestartet.")

            this.webSocket.send(errorEvent.JSONString)

            return
        }

        this._operator?.Hooks.DispatchHook(OperatorHooks.RECORD, {
            FileName: fileName
        })
    }
}

module.exports = StartRecording
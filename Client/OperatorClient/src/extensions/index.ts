import type { Pinia } from "pinia";
import { useWebSocketStore } from "./athaeck-websocket-vue3-extension/stores/webSocket";
import {useNotificationStore} from "./notifications/stores/index"

export function ImportExtensions(pinia:Pinia){
    useWebSocketStore(pinia)
    useWebSocketStore().Init()
    useNotificationStore(pinia)
    useNotificationStore().Init()
    return pinia
}
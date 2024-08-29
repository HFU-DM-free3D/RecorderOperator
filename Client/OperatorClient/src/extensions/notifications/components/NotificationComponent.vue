<template>
    <div class="notifications">
        <transition-group name="fade-in-down">
            <div class="notification mt30 border-box cl-white" v-for="(notification, index) in Notifications"
                :key="`${notification.type}_${index}`" :class="notification.type">
                <div @click="ExecAction(notification.action1, index)" class="message p20" data-testid="notificationMessage">
                    {{ notification.message }}
                </div>
                <div class="actions">
                    <div class="py10 px20 pointer weight-400 action-border notification-action uppercase"
                        :class="`border-${notification.type}`" id="notificationAction1" data-testid="notificationAction1"
                        @click="ExecAction(notification.action1, index)" v-if="notification.action1">
                        {{ notification.action1.label }}
                    </div>
                    <div class="py10 px20 pointer weight-400 notification-action uppercase" id="notificationAction2"
                        data-testid="notificationAction2" @click="ExecAction(notification.action2, index)"
                        v-if="notification.action2">
                        {{ notification.action2.label }}
                    </div>
                </div>
            </div>
        </transition-group>
    </div>
</template>
  
<script lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '../stores';
import type { ActionItem } from '../types';

export default {
    setup() {
        const notificationStore = useNotificationStore()
        const Notifications = computed(() => notificationStore.Notifications);

        const ExecAction = (action: ActionItem | undefined, index: number) => {
            if (action?.action) {
                action.action();
            }
            notificationStore.RemoveNotification(index);
        };

        return {
            Notifications,
            ExecAction,
        };
    },
}
</script>
  
<style scoped>

.notifications {
    position: fixed;
    top: 100px;
    right: 5%;
    width: 320px;
    z-index: 55;

    @media (max-width: 64em) {
        width: auto;
        top: auto;
        left: 0;
        right: 0;
        bottom: 0;


    }
}

.fade-in-down-enter,
.fade-in-down-leave-to {
    transform: translateY(100%);
}

.notification {
    box-shadow: 0px 0px 35px -5px rgba(white, .7);

    border-radius: 7px;
    padding: 7%;

}

.notification:first-child {
    margin-top: 0;
}

.notification-action {
    background: rgba(white, .2);
}

.actions {
    display: flex;
    justify-content: space-between;




}

#notificationAction2 {
    width: 100%;
}

.success {
    background: green;
}

.error {
    background: red;
}

.warning {
    background: yellow;
}

.info {
    background: blue;
    color: white;
}

.action-border {
    border-right: 2px solid transparent;
}

.border-success {
    border-right-color: green;
}

.border-error {
    border-color: red;
}

.border-warning {
    border-color: yellow;
}

.border-info {
    border-color: blue;
}
</style>
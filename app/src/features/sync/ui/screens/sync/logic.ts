import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { storageKeys } from '../../../../../../app.json'

import { SyncStatus } from 'src/features/sync/types'
import { NavigationProps, UIServices } from 'src/ui/types'

export interface SyncScreenState {
    status: SyncStatus
    errMsg?: string
    manualInputValue: string
}
export type SyncScreenEvent = UIEvent<{
    setSyncStatus: { value: SyncStatus }
    setManualInputText: { text: string }
    doSync: { initialMessage: string }
    skipSync: {}
    startScanning: {}
    confirmSuccess: {}
}>

export interface SyncScreenDependencies extends NavigationProps {
    services: UIServices<'localStorage' | 'sync'>
    suppressErrorLogging?: boolean
}
export default class SyncScreenLogic extends UILogic<
    SyncScreenState,
    SyncScreenEvent
> {
    constructor(private dependencies: SyncScreenDependencies) {
        super()
    }

    getInitialState(): SyncScreenState {
        return {
            status: 'setup',
            manualInputValue: '',
        }
    }

    async init() {
        const syncKey = await this.dependencies.services.localStorage.get<
            boolean
        >(storageKeys.syncKey)

        if (syncKey) {
            this.dependencies.navigation.navigate('MVPOverview')
            return
        }

        if (typeof globalThis !== 'undefined') {
            ;(globalThis as any).feedQrData = (data: string) =>
                this.processUIEvent('doSync', {
                    event: { initialMessage: data },
                    previousState: {} as any,
                })
        }
    }

    async cleanup() {
        delete (globalThis as any).feedQrData
    }

    async doSync(
        incoming: IncomingUIEvent<SyncScreenState, SyncScreenEvent, 'doSync'>,
    ) {
        this.emitMutation({ status: { $set: 'syncing' } })
        try {
            await this.dependencies.services.sync.initialSync.answerInitialSync(
                {
                    initialMessage: incoming.event.initialMessage,
                },
            )
            await this.dependencies.services.sync.initialSync.waitForInitialSync()
            await this.dependencies.services.localStorage.set(
                storageKeys.syncKey,
                true,
            )
            await this.dependencies.services.sync.continuousSync.setup()
            await this.emitMutation({ status: { $set: 'success' } })
        } catch (e) {
            if (!this.dependencies.suppressErrorLogging) {
                console.error('Error during initial sync')
                console.error(e)
            }
            this.emitMutation({
                status: { $set: 'failure' },
                errMsg: {
                    $set: `MSG: ${e.message}\nNAME: ${e.name} \n STACK: ${e.stack}`,
                },
            })
        }
    }

    setManualInputText(
        incoming: IncomingUIEvent<
            SyncScreenState,
            SyncScreenEvent,
            'setManualInputText'
        >,
    ) {
        return { manualInputValue: { $set: incoming.event.text } }
    }

    async skipSync() {
        this.emitMutation({ status: { $set: 'success' } })

        await this.dependencies.services.localStorage.set(
            storageKeys.syncKey,
            true,
        )
    }

    confirmSuccess() {
        this.dependencies.navigation.navigate('MVPOverview')
    }

    startScanning(
        incoming: IncomingUIEvent<
            SyncScreenState,
            SyncScreenEvent,
            'startScanning'
        >,
    ): UIMutation<SyncScreenState> {
        return { status: { $set: 'scanning' } }
    }
}

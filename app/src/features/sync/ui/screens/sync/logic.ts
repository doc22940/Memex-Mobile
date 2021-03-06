// tslint:disable:no-console
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { appGroup, storageKeys } from '../../../../../../app.json'

import { SyncStatus } from 'src/features/sync/types'
import { NavigationProps, UIServices } from 'src/ui/types'
import { FastSyncProgress } from '@worldbrain/storex-sync/lib/fast-sync/types.js'

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
    confirmSuccess: {}
}>

export interface Props extends NavigationProps {
    services: UIServices<'localStorage' | 'sync' | 'auth' | 'keychain'>
    suppressErrorLogging?: boolean
    syncStallTimeout?: number
}

export default class SyncScreenLogic extends UILogic<
    SyncScreenState,
    SyncScreenEvent
> {
    private static logSyncStats(
        syncStartTime: number,
        syncProgress: FastSyncProgress,
    ) {
        const totalTime = Date.now() - syncStartTime
        console.log(`INIT SYNC - total time taken: ${totalTime}ms`)
        console.log(
            `INIT SYNC - total objects processed: #${syncProgress.totalObjectsProcessed}`,
        )
        console.log(
            `INIT SYNC - collection count: #${syncProgress.collectionCount}`,
        )
        console.log(`INIT SYNC - objects count: #${syncProgress.objectCount}`)
    }

    constructor(private props: Props) {
        super()
    }

    getInitialState(): SyncScreenState {
        return {
            status: 'setup',
            manualInputValue: '',
        }
    }

    async init() {
        const syncKey = await this.props.services.localStorage.get<boolean>(
            storageKeys.syncKey,
        )

        if (syncKey) {
            this.props.navigation.navigate('Pairing')
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

    async saveFirebaseTokenToKeychain() {
        const { token } = await this.props.services.auth.generateLoginToken()

        if (!token || !token.length) {
            throw new Error('Could not get Firebase Auth token')
        }

        await this.props.services.keychain.setLogin({
            username: appGroup,
            password: token,
        })
    }

    private detectStall = () =>
        setTimeout(() => {
            this.emitMutation({
                status: { $set: 'failure' },
                errMsg: {
                    $set:
                        'Sync experienced a timeout. Please try again on a different connection.',
                },
            })
        }, this.props.syncStallTimeout)

    async doSync(
        incoming: IncomingUIEvent<SyncScreenState, SyncScreenEvent, 'doSync'>,
    ) {
        const { sync, localStorage } = this.props.services

        this.emitMutation({ status: { $set: 'syncing' } })
        const timeBefore = Date.now()
        let syncProgress: FastSyncProgress = {} as FastSyncProgress

        let timerId = this.detectStall()

        sync.initialSync.events.addListener('progress', ({ progress }) => {
            syncProgress = progress

            clearTimeout(timerId)
            timerId = this.detectStall()
        })

        try {
            await sync.initialSync.answerInitialSync({
                initialMessage: incoming.event.initialMessage,
            })
            await sync.initialSync.waitForInitialSync()
            await localStorage.set(storageKeys.syncKey, true)
            await sync.continuousSync.setup()

            await this.saveFirebaseTokenToKeychain()
            await this.emitMutation({ status: { $set: 'success' } })
        } catch (e) {
            if (!this.props.suppressErrorLogging) {
                console.error('Error during initial sync')
                console.error(e)
            }
            this.emitMutation({
                status: { $set: 'failure' },
                errMsg: {
                    $set: `MSG: ${e.message}\nNAME: ${e.name} \n STACK: ${e.stack}`,
                },
            })
        } finally {
            SyncScreenLogic.logSyncStats(timeBefore, syncProgress)
            sync.initialSync.events.removeAllListeners('progress')
            clearTimeout(timerId)
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

        await this.props.services.localStorage.set(storageKeys.syncKey, true)
    }

    confirmSuccess() {
        this.props.navigation.navigate('Overview')
    }

    setSyncStatus(
        incoming: IncomingUIEvent<
            SyncScreenState,
            SyncScreenEvent,
            'setSyncStatus'
        >,
    ): UIMutation<SyncScreenState> {
        return { status: { $set: incoming.event.value } }
    }
}

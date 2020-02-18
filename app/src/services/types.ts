import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import SyncService from './sync'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import { BackgroundProcessService } from './background-processing'
import { KeychainService } from './keychain'
import { NavigationService } from './navigation'

export interface Services {
    auth: AuthService
    sync: SyncService
    shareExt: ShareExtService
    keychain: KeychainService
    navigation: NavigationService
    localStorage: LocalStorageService
    backgroundProcess: BackgroundProcessService
}

export type ServiceStarter = (args: { services: Services }) => Promise<void>

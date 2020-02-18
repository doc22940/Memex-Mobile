import { UIElement } from 'ui-logic-react'

import { Storage } from 'src/storage/types'
import { Services } from 'src/services/types'
import { UILogic } from 'ui-logic-core'

export type UITaskState = 'pristine' | 'running' | 'done' | 'error'
export type UIServices<Required extends keyof Services> = Pick<
    Services,
    Required
>
export interface UIStorageModules<Required extends keyof Storage['modules']> {
    modules: Pick<Storage['modules'], Required>
}

export interface UIDependencies {
    storage: Storage
    services: Services
}

export abstract class StatefulUIElement<Props, State, Event> extends UIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props, options: { logic: UILogic<State, Event> }) {
        super(props, { logic: options.logic })
    }
}

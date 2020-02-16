import { NavigationScreenProp, NavigationRoute } from 'react-navigation'

import { Navigator, RouteName, NavigationParams } from './types'

export interface Props {
    navigationAPI: NavigationScreenProp<NavigationRoute, NavigationParams>
}

export class NavigationService implements Navigator {
    constructor(private props: Props) {}

    navigate<T = NavigationParams>(route: RouteName, params?: T) {
        return this.props.navigationAPI.navigate(route, params)
    }

    getParam<T = keyof NavigationParams>(
        name: keyof NavigationParams,
        defaultValue?: T,
    ) {
        return this.props.navigationAPI.getParam<keyof NavigationParams>(
            name,
            defaultValue as any,
        )
    }
}

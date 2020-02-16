export type RouteName =
    | 'Onboarding'
    | 'PageEditor'
    | 'Overview'
    | 'DebugConsole'
    | 'MVPOverview'
    | 'SettingsMenu'
    | 'Sync'
    | 'Pairing'

export interface Navigator {
    navigate<T = NavigationParams>(route: RouteName, params?: T): void
    getParam<T = keyof NavigationParams>(
        name: keyof NavigationParams,
        defaultValue?: T,
    ): any
}

export interface NavigationParams {
    test: number
}

import React from 'react'
import {
    createSwitchNavigator,
    // NOTE: Sadly stack navigators seem to stop the share extension working :S
    // createStackNavigator,
    createAppContainer,
    NavigationContainer,
} from 'react-navigation'

import { UIDependencies } from './types'
import ShareModal from 'src/features/page-share/ui/screens/share-modal'
import Overview from 'src/features/overview/ui/screens/overview'
import DebugConsole from 'src/features/overview/ui/screens/debug-console'
import MVPOverview from 'src/features/overview/ui/screens/mvp-overview'
import Pairing from 'src/features/overview/ui/screens/pairing-screen'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'
import SettingsMenu from 'src/features/settings-menu/ui/screens/settings-menu'

export type NavigationContainerCreator = (
    deps: UIDependencies,
) => NavigationContainer

// const OverviewNavigator = createStackNavigator(
//     {
//         Overview: { screen: Overview },
//         PageEditor: { screen: PageEditor },
//     },
//     { headerMode: 'none' },
// )

const createMainNavigator: NavigationContainerCreator = deps =>
    createSwitchNavigator(
        {
            Onboarding: () => <Onboarding {...deps} />,
            PageEditor: () => <PageEditor {...deps} />,
            Overview: () => <Overview {...deps} />,
            DebugConsole: () => <DebugConsole {...deps} />,
            MVPOverview: () => <MVPOverview {...deps} />,
            SettingsMenu: () => <SettingsMenu {...deps} />,
            Sync: () => <Sync {...deps} />,
            Pairing: () => <Pairing {...deps} />,
        },
        {
            initialRouteName: 'Overview',
        },
    )

const createShareNavigator: NavigationContainerCreator = deps =>
    createSwitchNavigator(
        {
            ShareModal: () => <ShareModal {...deps} />,
        },
        {
            initialRouteName: 'ShareModal',
        },
    )

export const createApp: NavigationContainerCreator = deps =>
    createAppContainer(createMainNavigator(deps))

export const createShareUI: NavigationContainerCreator = deps =>
    createAppContainer(createShareNavigator(deps))

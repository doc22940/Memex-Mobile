import React, { Component } from 'react'
import { AppRegistry, View, Text } from 'react-native'

import { name as appName } from '../../app.json'
import { createApp, createShareUI } from './navigation'
import { UIDependencies } from './types'
import LoadingScreen from './components/loading-screen'

export class UI {
    private setupResolve!: (dependencies: UIDependencies) => void

    constructor() {
        const setupPromise = new Promise<UIDependencies>(resolve => {
            this.setupResolve = resolve
        })

        interface State {
            dependencies: UIDependencies | null
        }

        abstract class AbstractContainer extends Component<{}, State> {
            state: State = {
                dependencies: null,
            }

            async componentDidMount() {
                const dependencies = await setupPromise
                this.setState(() => ({ dependencies }))
            }

            protected renderLoading() {
                return <LoadingScreen />
            }

            abstract render(): JSX.Element
        }

        class AppContainer extends AbstractContainer {
            render() {
                if (!this.state.dependencies) {
                    return this.renderLoading()
                }

                const AppContainer = createApp(this.state.dependencies)
                return <AppContainer />
            }
        }

        class ShareContainer extends AbstractContainer {
            render() {
                if (!this.state.dependencies) {
                    return this.renderLoading()
                }

                const AppContainer = createShareUI(this.state.dependencies)
                return <AppContainer />
            }
        }

        AppRegistry.registerComponent(appName, () => AppContainer)
        AppRegistry.registerComponent('MemexShare', () => ShareContainer)
    }

    initialize(options: { dependencies: UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}

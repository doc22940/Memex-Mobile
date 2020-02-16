import { FakeNavigation, FakeNavigationRequest } from 'src/tests/navigation'
import { RouteName } from './types'
import { NavigationService } from '.'

const testRoutes = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

function setupTest() {
    const navigationAPI = new FakeNavigation()
    const service = new NavigationService({
        navigationAPI: navigationAPI as any,
    })

    return { service, navigationAPI }
}

describe('navigation service tests', () => {
    it('should be able to navigate to different routes', () => {
        const { service, navigationAPI } = setupTest()

        const expectedRequests: FakeNavigationRequest[] = []
        testRoutes.forEach(route => {
            service.navigate(route as RouteName)
            expectedRequests.push({ type: 'navigate', target: route })
        })

        expect(navigationAPI.popRequests()).toEqual(expectedRequests)
    })

    it('should be able to navigate to different routes with params', () => {
        const { service, navigationAPI } = setupTest()

        const expectedRequests: FakeNavigationRequest[] = []
        testRoutes.forEach((route, index) => {
            const params = { route, index }

            service.navigate(route as RouteName, params)
            expectedRequests.push({ type: 'navigate', target: route, params })
        })

        expect(navigationAPI.popRequests()).toEqual(expectedRequests)
    })

    it('should be able to get params from navigation call when requested', () => {
        const { service } = setupTest()

        let lastRoute: string
        let lastIndex: number
        testRoutes.forEach((route, index) => {
            const params = { route, index }

            if (index > 0) {
                expect({
                    route: service.getParam('route', 'DEFAULT'),
                    index: service.getParam('index', -1),
                }).toEqual({
                    route: lastRoute,
                    index: lastIndex,
                })
            }
            lastRoute = route
            lastIndex = index
            service.navigate(route as RouteName, params)
        })
    })

    it('should be able to get default param when no param exists', () => {
        const { service } = setupTest()

        const defaultVal = 1234
        expect(service.getParam('dont-exist', defaultVal)).toBe(defaultVal)
        expect(service.getParam('dont-exist')).toBeUndefined()
    })
})

export interface FakeNavigationRequest {
    type: 'navigate'
    target: string
    params?: any
}
export class FakeNavigation {
    private requests: FakeNavigationRequest[] = []

    navigate(target: string, params?: any): boolean {
        this.requests.push({ type: 'navigate', target, params })

        return true
    }

    popRequests() {
        const requests = this.requests
        this.requests = []
        return requests
    }

    getParam(name: string, defaultValue: any) {
        const lastParams = this.requests[this.requests.length - 1]?.params || {}

        return lastParams[name] ?? defaultValue
    }
}

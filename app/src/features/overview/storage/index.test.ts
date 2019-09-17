import expect from 'expect'

import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import { Page } from '../types'
import deriveUrlParts from 'src/utils/derive-url-parts'

const it = makeStorageTestFactory()

function testPageEquality(
    dbPage: Page,
    testPage: Omit<Page, 'domain' | 'hostname'>,
) {
    expect(dbPage.url).toBe(testPage.url)
    expect(dbPage.text).toBe(testPage.text)
    expect(dbPage.fullUrl).toBe(testPage.fullUrl)
    expect(dbPage.fullTitle).toBe(testPage.fullTitle)

    const urlParts = deriveUrlParts(testPage.url)
    expect(dbPage.domain).toBe(urlParts.domain)
    expect(dbPage.hostname).toBe(urlParts.hostname)
}

describe('overview StorageModule', () => {
    it('should be able to create new pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            const foundPage = await overview.findPage(page)
            expect(foundPage).not.toBeNull()
            testPageEquality(foundPage!, page)
        }
    })

    it('should be able to star pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
            await overview.starPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: true }),
            )
            await overview.unstarPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
        }
    })

    it('should be able to set page star state', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
            await overview.setPageStar({ url: page.url, isStarred: true })
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: true }),
            )
            await overview.setPageStar({ url: page.url, isStarred: false })
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
        }
    })

    it('should be able to visit pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            for (const time of data.visitTimestamps) {
                await overview.visitPage({ url: page.url, time })
            }
            expect(await overview.findPageVisits(page)).toEqual(
                data.visitTimestamps.map(time => ({ time, url: page.url })),
            )
        }
    })

    it('should be able to delete pages + associated data', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            const foundPage = await overview.findPage(page)
            expect(foundPage).not.toBeNull()
            testPageEquality(foundPage!, page)

            await overview.starPage(page)
            for (const time of data.visitTimestamps) {
                await overview.visitPage({ url: page.url, time })
            }
            expect(await overview.findPageVisits(page)).toEqual(
                data.visitTimestamps.map(time => ({ time, url: page.url })),
            )

            await overview.deletePage(page)
            expect(await overview.findPage(page)).toBeNull()
            expect(await overview.findPageVisits(page)).toEqual([])
        }
    })
})

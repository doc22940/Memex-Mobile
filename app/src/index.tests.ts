import { createStorage } from 'src/storage'
import { Storage, StorageModules } from 'src/storage/types'

/*
 * SQLite is used as the TypeORM connection in tests, however it doesn't support a number
 *  of our needed field types. Hence change them here for the testing environment.
 */
const alterModules = (modules: StorageModules): StorageModules => {
    const overviewConf = modules.overview.getConfig()
    const pageEditConf = modules.pageEditor.getConfig()

    modules.overview.getConfig = () => {
        overviewConf.collections['visits'].fields['time'] = { type: 'datetime' }
        overviewConf.collections['bookmarks'].fields['time'] = {
            type: 'datetime',
        }
        return overviewConf
    }

    modules.pageEditor.getConfig = () => {
        pageEditConf.collections['annotations'].fields['selector'] = {
            type: 'string',
        }
        return pageEditConf
    }

    return modules
}

export function makeTestFactory() {
    type TestContext = Storage
    type TestFunction = (context: TestContext) => Promise<void>
    /*
     * Multiple tests throw errors running on the same connection. So give each test a different
     *  connection name.
     * Manually calling `this.connection.close()` in the TypeORM backend after the test is run
     *  does not seem to help.
     */
    let connIterator = 0

    function factory(description: string, test?: TestFunction): void {
        it(
            description,
            test &&
                async function() {
                    const storage = await createStorage({
                        alterModules,
                        typeORMConnectionOpts: {
                            type: 'sqlite',
                            database: 'test-db.sqlite',
                            name: `connection-${connIterator++}`,
                        },
                    })

                    const testContext = this
                    try {
                        await test.call(testContext, storage)
                    } finally {
                    }
                },
        )
    }

    return factory
}

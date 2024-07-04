import {test} from 'vitest'
import {testStorageDriverGeneral} from './StorageDriverGeneralChecks'
import {S3StorageDriver} from '../S3StorageDriver'

// we're using public minio test server for this test
// it can break at any time, so we're setting timeout to 60 seconds
test('S3StorageDriver', {timeout: 60_000}, async () => {
  const basket = 'svt-test-' + Date.now()
  const rootPath = 'svt-root-' + Date.now()

  const driver = new S3StorageDriver({
    endPoint: 'play.min.io',
    port: 9000,
    useSSL: true,
    // its publicly available minio test server, don't worry about the keys
    accessKey: 'Q3AM3UQ867SPQQA43P2F',
    secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    basket: basket,
    rootPath: rootPath,
  })

  await driver.getDriver().makeBucket(basket)

  await testStorageDriverGeneral(driver)

  await driver.getDriver().removeBucket(basket)
})

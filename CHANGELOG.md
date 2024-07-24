# Changelog

## [v2.0.0](https://github.com/ral-facilities/datagateway/tree/v2.0.0) (2024-07-24)

## What's Changed

### Features

* Create Dockerfile by @VKTB in https://github.com/ral-facilities/datagateway/pull/1187
* Set React production variables for plugin build paths in Dockerfile by @VKTB in https://github.com/ral-facilities/datagateway/pull/1241
* Docker build workflow should only run on pushes to K8S branch by @VKTB in https://github.com/ral-facilities/datagateway/pull/1237
* Implement best practices in Docker image  by @VKTB in https://github.com/ral-facilities/datagateway/pull/1284
* Fix security vulnerabilities reverted by MUIv5 branch by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1314
* Configure Renovate by @renovate in https://github.com/ral-facilities/datagateway/pull/1313
* Improve handling of undefined carts by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1283
* Adjust height calculations in various components by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1378
* Migrate dg-download to `react-query` and `@testing-library` by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1352
* Improving download e2e test to account for random ordering of downloads by @sam-glendenning in https://github.com/ral-facilities/datagateway/pull/1383
* Use different settings.json file for running e2e in CI vs locally by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1388
* Create CITATION.cff by @agbeltran in https://github.com/ral-facilities/datagateway/pull/1298
* Use react query provided timestamps for download table last checked time by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1404
* Fix details panel layout issue across mounts by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1384
* Fix 'Date To' Filter in user download table   by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1412
* Add a datafile previewer for previewing datafiles in-situ, implemented for .txt & .log by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1393
* fix timestamps for Requested At columns in download tables by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1414
* Fixing renovate.json #1425 by @sam-glendenning in https://github.com/ral-facilities/datagateway/pull/1426
* Updating yarn.lock to remove unnecessary package by @sam-glendenning in https://github.com/ral-facilities/datagateway/pull/1428
* Fix incorrect study dates shown in ISIS study views with date filters by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1416
* Add progress bar UI to download status tables to show download progress by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1371
* Add label text for include/exclude filters to make them more explicit by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1419
* Authenticate locally with datagateway-api by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1431
* [Hotfix] attempting to fix failing download unit tests by @sam-glendenning in https://github.com/ral-facilities/datagateway/pull/1442
* Migrate lerna to yarn workspaces by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1434
* Seconds added to DateTime Picker by @LunaBarrett in https://github.com/ral-facilities/datagateway/pull/1433
* Misc fixes by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1458
* Ensure that datagateway tests will continue to work with new datagateway-api config by @Reillyhewitson in https://github.com/ral-facilities/datagateway/pull/1466
* Disable checkboxes when parent entity is in cart by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1497
* Fix refresh button in user download table by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1507
* Bump node version in CI from v14 to v16 by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1513
* Refactor docker-build workflow into a job in ci-build workflow by @VKTB in https://github.com/ral-facilities/datagateway/pull/1300
* Bring k8s-deployment branch up to date and fix Docker build by @VKTB in https://github.com/ral-facilities/datagateway/pull/1516
* Test/migrate generation script by @Reillyhewitson in https://github.com/ral-facilities/datagateway/pull/1501
* Migrate every test to use testing-library by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1447
* Docker image improvements by @VKTB in https://github.com/ral-facilities/datagateway/pull/1518
* Update pinned version of DataGateway API on GitHub Actions by @MRichards99 in https://github.com/ral-facilities/datagateway/pull/1520
* Shows loadings status when submitting download card in download confirm dialog by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1525
* Use `investigationFacilityCycles` to determine the facility cycles an Investigation belongs to by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1415
* Feature/use isis data publications #1464 by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1514
* Fix date-time filtering not working correctly in download table by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1534
* Autocomplete Recent Searches by @MRichards99 in https://github.com/ral-facilities/datagateway/pull/1539
* Feature/add exact filter #1540 by @kaperoo in https://github.com/ral-facilities/datagateway/pull/1574
* Feature/download type status cache #1519 by @kaperoo in https://github.com/ral-facilities/datagateway/pull/1576
* Improve e2e tests & fix sorting bug by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1575
* Fix Data Publications e2e Test by @MRichards99 in https://github.com/ral-facilities/datagateway/pull/1580
* Fix double requests on default sort by @kaperoo in https://github.com/ral-facilities/datagateway/pull/1583
* Feature/improve sorting ux #1541 by @kaperoo in https://github.com/ral-facilities/datagateway/pull/1578
* Update node version on CI and use proper yarn cache by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1591
* Improve unit tests & fix text previewer styling by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1594
* Containerize application and configure GitHub Actions to build and push Docker image to Harbor by @VKTB in https://github.com/ral-facilities/datagateway/pull/1535
* Add links to the corresponding entities for download selections by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1413
* Mint custom datapublications #1529 #1531 by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1537
* Update dependency @testing-library/jest-dom to v5.17.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1607
* simpler icat timestamps by @kaperoo in https://github.com/ral-facilities/datagateway/pull/1619
* Migrate file size/count queries to use ICAT v5 properties for investigation/dataset entities by @jounaidr in https://github.com/ral-facilities/datagateway/pull/1499
* Fix doi minting code by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1646
* Changes to docker image by @ajkyffin in https://github.com/ral-facilities/datagateway/pull/1645
* Implement new ISIS data publication hierarchy #1528 by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1648
* Update release workflow by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1660
* Lucene search UI changes by @kennethnym in https://github.com/ral-facilities/datagateway/pull/1401

### Dependencies

* Organise dev and prod dependencies by @VKTB in https://github.com/ral-facilities/datagateway/pull/1171
* Bump jsrsasign from 10.5.8 to 10.5.25 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1301
* React 17 and MUIv5 upgrade #830 #1096 by @joelvdavies in https://github.com/ral-facilities/datagateway/pull/1129
* Pin dependencies by @renovate in https://github.com/ral-facilities/datagateway/pull/1317
* Update dependency cypress to v9.7.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1320
* Update dependency @types/jest to v27.5.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1318
* Update dependency eslint-config-prettier to v8.5.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1323
* Update dependency eslint to v8.19.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1322
* Update dependency axios to v0.27.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1319
* Update dependency date-fns-tz to v1.3.5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1321
* Update dependency eslint-plugin-prettier to v3.4.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1325
* Update dependency express to v4.18.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1326
* Update dependency i18next-http-backend to v1.4.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1329
* Update dependency single-spa-react to v4.6.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1335
* Update emotion monorepo to v11.9.3 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1338
* Update dependency tslib to v2.4.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1336
* Update actions/cache action to v3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1341
* Update actions/checkout action to v3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1342
* Update typescript-eslint monorepo to v5.30.6 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1340
* Update dependency cypress-failed-log to v2.10.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1324
* Update dependency redux to v4.2.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1334
* Update actions/setup-node action to v3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1345
* Update actions/setup-python action to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1346
* Update actions/setup-java action to v3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1344
* Update dependency react-query to v3.39.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1333
* Update dependency eslint to v8.20.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1343
* Update dependency @testing-library/react-hooks to v8 by @renovate in https://github.com/ral-facilities/datagateway/pull/1351
* Update actions/upload-artifact action to v3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1347
* Update codecov/codecov-action action to v3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1348
* Update dependency @date-io/date-fns to v2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1349
* Update dependency @types/jsrsasign to v10 by @renovate in https://github.com/ral-facilities/datagateway/pull/1354
* Update dependency @welldone-software/why-did-you-render to v7 by @renovate in https://github.com/ral-facilities/datagateway/pull/1358
* Update dependency eslint-plugin-prettier to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1360
* Update dependency husky to v8 by @renovate in https://github.com/ral-facilities/datagateway/pull/1366
* Update dependency i18next to v21.8.14 by @renovate in https://github.com/ral-facilities/datagateway/pull/1327
* Update dependency date-fns to v2.29.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1357
* Update dependency lint-staged to v13 by @renovate in https://github.com/ral-facilities/datagateway/pull/1372
* Update dependency react-i18next to v11.18.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1332
* Update dependency lerna to v5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1369
* Update typescript-eslint monorepo to v5.31.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1364
* Update emotion monorepo to v11.10.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1380
* Update typescript-eslint monorepo to v5.32.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1381
* Update dependency serve to v14 by @renovate in https://github.com/ral-facilities/datagateway/pull/1382
* Update dependency @testing-library/user-event to v14.4.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1385
* Update dependency typescript to v4.7.4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1337
* Update material-ui monorepo to v5.8.4 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1339
* Update dependency @date-io/date-fns to v2.15.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1391
* Update dependency eslint to v8.22.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1379
* Update dependency prettier to v2.7.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1330
* Update dependency lerna to v5.4.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1387
* Update dependency i18next to v21.9.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1386
* Update dependency eslint to v8.23.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1405
* Update dependency lerna to v5.5.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1407
* Update dependency @mui/icons-material to v5.10.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1396
* Pin dependencies by @renovate in https://github.com/ral-facilities/datagateway/pull/1417
* Update dependency @types/jest to v29 by @renovate in https://github.com/ral-facilities/datagateway/pull/1406
* Update typescript-eslint monorepo to v5.38.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1389
* Update dependency @date-io/date-fns to v2.16.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1420
* Update dependency eslint to v8.24.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1421
* Update typescript-eslint monorepo to v5.39.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1430
* Update dependency react-redux to v8 by @renovate in https://github.com/ral-facilities/datagateway/pull/1375
* Update dependency i18next to v21.10.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1435
* Update dependency @types/jest to v29.1.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1429
* Update dependency eslint to v8.25.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1437
* Update dependency eslint to v8.26.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1448
* Update typescript-eslint monorepo to v5.41.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1439
* Update dependency react-i18next to v12 by @renovate in https://github.com/ral-facilities/datagateway/pull/1446
* Update dependency i18next-http-backend to v2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1451
* Update dependency i18next-browser-languagedetector to v7 by @renovate in https://github.com/ral-facilities/datagateway/pull/1450
* Update dependency typescript to v4.8.4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1403
* Update dependency i18next to v22 by @renovate in https://github.com/ral-facilities/datagateway/pull/1444
* Update dependency @types/node to v18 by @renovate in https://github.com/ral-facilities/datagateway/pull/1449
* Update typescript-eslint monorepo to v5.42.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1452
* Update dependency @types/jest to v29.2.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1443
* Bump loader-utils from 1.4.0 to 1.4.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1455
* Update dependency eslint to v8.27.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1456
* Update dependency jsrsasign to v10.6.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1454
* Update dependency serve to v14.1.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1460
* Fix security alerts by @louise-davies in https://github.com/ral-facilities/datagateway/pull/1465
* Update Yarn to v3.3.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1469
* Update typescript-eslint monorepo to v5.43.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1467
* Update dependency @craco/craco to v7 by @renovate in https://github.com/ral-facilities/datagateway/pull/1461
* Update dependency eslint to v8.28.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1470
* Update typescript-eslint monorepo to v5.44.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1474
* Update dependency prettier to v2.8.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1475
* Upgrading to Cypress v11 #1427 by @sam-glendenning in https://github.com/ral-facilities/datagateway/pull/1476
* Bump decode-uri-component from 0.2.0 to 0.2.2 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1478
* Update typescript-eslint monorepo to v5.45.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1477
* Update dependency eslint to v8.29.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1479
* Bump qs from 6.5.2 to 6.5.3 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1480
* Bumping @mui/x-date-pickers to v5.0.9 by @sam-glendenning in https://github.com/ral-facilities/datagateway/pull/1481
* Update dependency typescript to v4.9.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1468
* Update dependency lint-staged to v13.1.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1482
* Lock file maintenance by @renovate in https://github.com/ral-facilities/datagateway/pull/1394
* Update dependency start-server-and-test to v1.15.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1483
* Lock file maintenance by @renovate in https://github.com/ral-facilities/datagateway/pull/1487
* Update dependency react-i18next to v12.1.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1484
* Update dependency i18next-http-backend to v2.1.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1488
* Update material-ui monorepo to v5.11.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1489
* Lock file maintenance by @renovate in https://github.com/ral-facilities/datagateway/pull/1490
* Update dependency eslint-config-prettier to v8.6.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1495
* Bump json5 from 1.0.1 to 1.0.2 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1496
* Update dependency eslint to v8.32.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1494
* Update typescript-eslint monorepo to v5.48.2 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1491
* Lock file maintenance by @renovate in https://github.com/ral-facilities/datagateway/pull/1492
* Lock file maintenance by @renovate in https://github.com/ral-facilities/datagateway/pull/1506
* Update dependency @types/jest to v29.4.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1504
* Update dependency serve to v14.2.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1503
* Update typescript-eslint monorepo to v5.49.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1502
* Bump webpack from 5.75.0 to 5.76.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1517
* Pin dependencies by @renovate in https://github.com/ral-facilities/datagateway/pull/1536
* Update dependency eslint to v8.43.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1508
* Update dependency tslib to v2.5.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1505
* Update typescript-eslint monorepo to v5.60.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1510
* Update dependency date-fns-tz to v2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1509
* Update Yarn to v3.6.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1511
* Replace dependency babel-eslint with @babel/eslint-parser 7.11.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1542
* Update dependency @craco/craco to v7.1.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1545
* Update actions/checkout digest to c85c95e by @renovate in https://github.com/ral-facilities/datagateway/pull/1544
* Update dependency @babel/eslint-parser to v7.22.5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1546
* Update dependency @types/jest to v29.5.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1548
* Update dependency date-fns to v2.30.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1549
* Update dependency eslint-config-prettier to v8.8.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1550
* Update dependency eslint-plugin-cypress to v2.13.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1551
* Update dependency i18next-browser-languagedetector to v7.1.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1552
* Update dependency @types/node to v18.16.18 by @renovate in https://github.com/ral-facilities/datagateway/pull/1515
* Update dependency jsrsasign to v10.8.6 by @renovate in https://github.com/ral-facilities/datagateway/pull/1554
* Update dependency react-i18next to v12.3.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1556
* Update dependency i18next-http-backend to v2.2.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1553
* Update dependency lint-staged to v13.2.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1555
* Update emotion monorepo (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1561
* Update dependency tslib to v2.6.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1558
* Update dependency eslint to v8.44.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1559
* Update dependency start-server-and-test to v2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1566
* Update actions/setup-node digest to e33196f by @renovate in https://github.com/ral-facilities/datagateway/pull/1568
* Update typescript-eslint monorepo to v5.61.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1569
* Bump semver from 6.3.0 to 6.3.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1571
* Update dependency url-search-params-polyfill to v8.2.4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1560
* Bump word-wrap from 1.2.3 to 1.2.4 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1573
* Bump @adobe/css-tools from 4.1.0 to 4.3.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1577
* Update dependency @mui/x-date-pickers to v6 by @renovate in https://github.com/ral-facilities/datagateway/pull/1562
* Bump @babel/traverse from 7.20.13 to 7.23.2 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1585
* Update actions/checkout digest to f43a0e5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1579
* Update actions/setup-java digest to 0ab4596 by @renovate in https://github.com/ral-facilities/datagateway/pull/1587
* Update dependency axios to v1 [SECURITY] by @renovate in https://github.com/ral-facilities/datagateway/pull/1593
* Bump axios from 1.6.0 to 1.6.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1595
* Bump @adobe/css-tools from 4.3.1 to 4.3.2 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1598
* Update actions/setup-node digest to 1a4442c by @renovate in https://github.com/ral-facilities/datagateway/pull/1588
* Update actions/setup-python digest to 65d7f2d by @renovate in https://github.com/ral-facilities/datagateway/pull/1589
* Update actions/upload-artifact digest to a8a3f3a by @renovate in https://github.com/ral-facilities/datagateway/pull/1590
* Bump follow-redirects from 1.15.3 to 1.15.5 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1601
* Update actions/checkout digest to f43a0e5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1599
* Update richardsimko/update-tag digest to e173a8e by @renovate in https://github.com/ral-facilities/datagateway/pull/1602
* Update dependency @date-io/date-fns to v2.17.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1606
* Update dependency react-redux to v8.1.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1557
* Update dependency jsrsasign to v11 [SECURITY] by @renovate in https://github.com/ral-facilities/datagateway/pull/1609
* Update dependency @babel/eslint-parser to v7.23.3 by @renovate in https://github.com/ral-facilities/datagateway/pull/1604
* Update dependency @testing-library/user-event to v14.5.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1610
* Update dependency @types/node to v18.19.8 by @renovate in https://github.com/ral-facilities/datagateway/pull/1612
* Update dependency eslint to v8.56.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1613
* Update Yarn to v3.7.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1603
* Update dependency eslint-config-prettier to v8.10.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1614
* Update dependency i18next-browser-languagedetector to v7.2.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1616
* Update dependency lint-staged to v13.3.0 - autoclosed by @renovate in https://github.com/ral-facilities/datagateway/pull/1618
* Update dependency i18next-http-backend to v2.4.2 by @renovate in https://github.com/ral-facilities/datagateway/pull/1617
* Update dependency eslint-plugin-cypress to v2.15.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1615
* Update docker/build-push-action action to v4.2.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1620
* Update docker/login-action action to v2.2.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1621
* Update docker/metadata-action action to v4.6.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1622
* Update typescript-eslint monorepo to v5.62.0 (minor) by @renovate in https://github.com/ral-facilities/datagateway/pull/1623
* Update Node.js to v20.11.0 by @renovate in https://github.com/ral-facilities/datagateway/pull/1624
* Update codecov/codecov-action digest to 4fe8c5f by @renovate in https://github.com/ral-facilities/datagateway/pull/1625
* Update actions/checkout action to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1627
* Update actions/setup-java action to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1628
* Update actions/setup-node action to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1629
* Update actions/setup-python action to v5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1630
* Update actions/upload-artifact action to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1631
* Update dependency @testing-library/jest-dom to v6 by @renovate in https://github.com/ral-facilities/datagateway/pull/1633
* Update dependency loglevel to v1.9.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1634
* Update codecov/codecov-action digest to ab904c4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1636
* Update codecov/codecov-action action to v4 by @renovate in https://github.com/ral-facilities/datagateway/pull/1638
* Update dependency @testing-library/jest-dom to v6.4.1 by @renovate in https://github.com/ral-facilities/datagateway/pull/1637
* Update actions/upload-artifact digest to 5d5d22a by @renovate in https://github.com/ral-facilities/datagateway/pull/1642
* Update dependency typescript to v5 by @renovate in https://github.com/ral-facilities/datagateway/pull/1567
* Update dependency cypress to v13 by @renovate in https://github.com/ral-facilities/datagateway/pull/1639
* Update Node.js to 8765147 by @renovate in https://github.com/ral-facilities/datagateway/pull/1653
* Bump ip from 2.0.0 to 2.0.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1650
* Bump follow-redirects from 1.15.5 to 1.15.6 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1651
* Bump webpack-dev-middleware from 5.3.3 to 5.3.4 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1652
* Bump express from 4.18.1 to 4.19.2 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1654
* Bump tar from 6.1.13 to 6.2.1 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1656
* Bump ws from 7.5.9 to 7.5.10 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1659
* Bump braces from 3.0.2 to 3.0.3 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1658
* Bump ejs from 3.1.8 to 3.1.10 by @dependabot in https://github.com/ral-facilities/datagateway/pull/1657

## New Contributors

* @renovate made their first contribution in https://github.com/ral-facilities/datagateway/pull/1313
* @kennethnym made their first contribution in https://github.com/ral-facilities/datagateway/pull/1378
* @jounaidr made their first contribution in https://github.com/ral-facilities/datagateway/pull/1412
* @Reillyhewitson made their first contribution in https://github.com/ral-facilities/datagateway/pull/1466
* @kaperoo made their first contribution in https://github.com/ral-facilities/datagateway/pull/1574

**Full Changelog**: https://github.com/ral-facilities/datagateway/compare/v1.1.3...v2.0.0

## [v1.1.3](https://github.com/ral-facilities/datagateway/tree/v1.1.3) (2024-02-02)

[Full Changelog](https://github.com/ral-facilities/datagateway/compare/v1.1.2...v1.1.3)

**Fixed bugs:**

- Fix performance of datafile table requests by extracting out investigation ID check to ID check functions [ffbb197](https://github.com/ral-facilities/datagateway/commit/ffbb197e333d93d35687252eaaba32fd475a5ffa) ([louise-davies](https://github.com/louise-davies))

## [v1.1.2](https://github.com/ral-facilities/datagateway/tree/v1.1.2) (2023-09-28)

[Full Changelog](https://github.com/ral-facilities/datagateway/compare/v1.1.1...v1.1.2)

**Fixed bugs:**

- \#1582 - Fix double requests on default sort [\#1583](https://github.com/ral-facilities/datagateway/pull/1583) ([kaperoo](https://github.com/kaperoo))

## [v1.1.1](https://github.com/ral-facilities/datagateway/tree/v1.1.1) (2022-08-24)

[Full Changelog](https://github.com/ral-facilities/datagateway/compare/v1.1.0...v1.1.1)

**Fixed bugs:**

- \#1397 - make fileCountMax / totalSizeMax optional [\#1398](https://github.com/ral-facilities/datagateway/pull/1398) ([louise-davies](https://github.com/louise-davies))

## [v1.1.0](https://github.com/ral-facilities/datagateway/tree/v1.1.0) (2022-06-23)

[Full Changelog](https://github.com/ral-facilities/datagateway/compare/v1.0.0...v1.1.0)

**Implemented enhancements:**

- \#1174 - changed Title icon to Subject icon [\#1259](https://github.com/ral-facilities/datagateway/pull/1259) ([LunaBarrett](https://github.com/LunaBarrett))
- Customising notification message if it concerns session expiry \#1209 [\#1248](https://github.com/ral-facilities/datagateway/pull/1248) ([sam-glendenning](https://github.com/sam-glendenning))
- Adding alert label if file/size limit exceeded in selections table \#1183 [\#1228](https://github.com/ral-facilities/datagateway/pull/1228) ([sam-glendenning](https://github.com/sam-glendenning))
- Download tables sort by requested time descending by default \#1176 [\#1226](https://github.com/ral-facilities/datagateway/pull/1226) ([sam-glendenning](https://github.com/sam-glendenning))
- Adding ability to use DatePicker or DateTimePicker in date filter column \#1175 [\#1216](https://github.com/ral-facilities/datagateway/pull/1216) ([sam-glendenning](https://github.com/sam-glendenning))
- Refactor download cart to improve performance [\#1185](https://github.com/ral-facilities/datagateway/pull/1185) ([louise-davies](https://github.com/louise-davies))

**Fixed bugs:**

- Bugfix/disable download button \#1261 [\#1266](https://github.com/ral-facilities/datagateway/pull/1266) ([louise-davies](https://github.com/louise-davies))
- Bugfix/fix token refresh error \#1257 [\#1262](https://github.com/ral-facilities/datagateway/pull/1262) ([louise-davies](https://github.com/louise-davies))
- \#1196 - Use MUI theme background colour for breadcrumb gaps [\#1253](https://github.com/ral-facilities/datagateway/pull/1253) ([louise-davies](https://github.com/louise-davies))
- Fix breadcrumbs visual glitch [\#1252](https://github.com/ral-facilities/datagateway/pull/1252) ([louise-davies](https://github.com/louise-davies))
- Prevent querying for cart on homepage & fix admin download table queries [\#1250](https://github.com/ral-facilities/datagateway/pull/1250) ([louise-davies](https://github.com/louise-davies))
- Preventing download of empty files \#1195 [\#1232](https://github.com/ral-facilities/datagateway/pull/1232) ([sam-glendenning](https://github.com/sam-glendenning))
- Fix selection errors \#1210 [\#1231](https://github.com/ral-facilities/datagateway/pull/1231) ([louise-davies](https://github.com/louise-davies))

**Security fixes:**

- Bump async from 2.6.3 to 2.6.4 [\#1274](https://github.com/ral-facilities/datagateway/pull/1274) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ejs from 3.1.6 to 3.1.7 [\#1245](https://github.com/ral-facilities/datagateway/pull/1245) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump minimist from 1.2.5 to 1.2.6 [\#1197](https://github.com/ral-facilities/datagateway/pull/1197) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node-forge from 1.2.1 to 1.3.0 [\#1179](https://github.com/ral-facilities/datagateway/pull/1179) ([dependabot[bot]](https://github.com/apps/dependabot))

**Merged pull requests:**

- Release v1.1.0 [\#1296](https://github.com/ral-facilities/datagateway/pull/1296) ([louise-davies](https://github.com/louise-davies))
- Merge main into develop  [\#1288](https://github.com/ral-facilities/datagateway/pull/1288) ([louise-davies](https://github.com/louise-davies))



## [v1.0.0](https://github.com/ral-facilities/datagateway/tree/v1.0.0) (2022-03-31)

Initial release for ISIS


\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*

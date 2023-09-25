import { Datafile, Dataset, FACILITY_NAME, Investigation } from './app.types';
import {
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
  buildUrlToDatafileTableContainingDatafile,
  isLandingPageSupportedForHierarchy,
} from './urlBuilders';

const TEST_INVESTIGATION: Investigation = {
  id: 0,
  name: 'test investigation',
  title: 'test investigation title',
  visitId: '1',
  investigationInstruments: [
    {
      id: 859,
      instrument: {
        name: 'test instrument',
        id: 648,
      },
    },
  ],
  investigationFacilityCycles: [
    {
      id: 351,
      facilityCycle: {
        name: 'cycle 1',
        id: 854,
      },
    },
  ],
};

const TEST_DATASET: Dataset = {
  createTime: '',
  id: 623,
  modTime: '',
  name: 'test dataset',
  investigation: TEST_INVESTIGATION,
};

const TEST_DATAFILE: Datafile = {
  createTime: '',
  id: 787,
  modTime: '',
  name: 'test datafile',
  dataset: TEST_DATASET,
};

describe('URL builders', () => {
  describe('isLandingPageAvailableForHierarchy', () => {
    it('returns true for hierarchies that support landing pages for entities', () => {
      expect(isLandingPageSupportedForHierarchy(FACILITY_NAME.isis)).toEqual(
        true
      );
    });

    it('returns false for hierarchies that does not support landing pages', () => {
      expect(isLandingPageSupportedForHierarchy(FACILITY_NAME.dls)).toEqual(
        false
      );
    });
  });

  describe('buildInvestigationLandingUrl', () => {
    it('returns the relative URL to the landing page of the given investigation', () => {
      expect(buildInvestigationLandingUrl(TEST_INVESTIGATION)).toEqual(
        '/browse/instrument/648/facilityCycle/854/investigation/0'
      );
    });

    it('returns null if the given investigation is missing info required to build the complete URL', () => {
      const testInvestigation: Investigation =
        structuredClone(TEST_INVESTIGATION);
      delete testInvestigation.investigationFacilityCycles;

      expect(buildInvestigationLandingUrl(testInvestigation)).toBeNull();
    });
  });

  describe('buildDatasetTableUrlForInvestigation', () => {
    it('returns the ISIS URL to the dataset table of the given investigation', () => {
      expect(
        buildDatasetTableUrlForInvestigation({
          investigation: TEST_INVESTIGATION,
          facilityName: FACILITY_NAME.isis,
        })
      ).toEqual(
        '/browse/instrument/648/facilityCycle/854/investigation/0/dataset'
      );
    });

    it('returns null if the given investigation is missing info required to build the complete URL', () => {
      const testInvestigation: Investigation =
        structuredClone(TEST_INVESTIGATION);
      testInvestigation.investigationInstruments = [];
      expect(
        buildDatasetTableUrlForInvestigation({
          investigation: testInvestigation,
          facilityName: FACILITY_NAME.isis,
        })
      ).toBeNull();
    });

    it('returns the DLS URL to the dataset table of the given investigation', () => {
      expect(
        buildDatasetTableUrlForInvestigation({
          investigation: TEST_INVESTIGATION,
          facilityName: FACILITY_NAME.dls,
        })
      ).toEqual('/browse/proposal/test investigation/investigation/0/dataset');
    });

    it('returns the generic URL to the dataset table of the given investigation', () => {
      expect(
        buildDatasetTableUrlForInvestigation({
          investigation: TEST_INVESTIGATION,
          facilityName: 'data',
        })
      ).toEqual('/browse/investigation/0/dataset');
    });
  });

  describe('buildDatasetLandingUrl', () => {
    it('returns the URL to the landing page of the given dataset', () => {
      expect(buildDatasetLandingUrl(TEST_DATASET)).toEqual(
        '/browse/instrument/648/facilityCycle/854/investigation/0/dataset/623'
      );
    });

    it('returns null if the given dataset does not have an associated investigation', () => {
      const testDataset = structuredClone(TEST_DATASET);
      delete testDataset.investigation;

      expect(buildDatasetLandingUrl(testDataset)).toBeNull();
    });

    it('returns null if the associated investigation of the given dataset contains missing info required to build the complete URL', () => {
      const testDataset = structuredClone(TEST_DATASET);
      delete testDataset.investigation.investigationFacilityCycles;

      expect(buildDatasetLandingUrl(testDataset)).toBeNull();
    });
  });

  describe('buildDatafileUrlForDataset', () => {
    it('returns the ISIS URL to the datafile table of the given dataset', () => {
      expect(
        buildDatafileTableUrlForDataset({
          dataset: TEST_DATASET,
          facilityName: FACILITY_NAME.isis,
        })
      ).toEqual(
        '/browse/instrument/648/facilityCycle/854/investigation/0/dataset/623/datafile'
      );
    });

    it('returns null if the given dataset does not have an associated investigation', () => {
      const testDataset = structuredClone(TEST_DATASET);
      delete testDataset.investigation;

      expect(
        buildDatafileTableUrlForDataset({
          dataset: testDataset,
          facilityName: FACILITY_NAME.isis,
        })
      ).toBeNull();
    });

    it('returns null if the given dataset is missing info required to build the complete URL', () => {
      const testDataset = structuredClone(TEST_DATASET);
      testDataset.investigation.investigationFacilityCycles = [];

      expect(
        buildDatafileTableUrlForDataset({
          dataset: testDataset,
          facilityName: FACILITY_NAME.isis,
        })
      ).toBeNull();
    });

    it('returns the DLS URL to the datafile table of the given dataset', () => {
      expect(
        buildDatafileTableUrlForDataset({
          dataset: TEST_DATASET,
          facilityName: FACILITY_NAME.dls,
        })
      ).toEqual(
        '/browse/proposal/test investigation/investigation/0/dataset/623/datafile'
      );
    });

    it('returns the generic URL to the datafile table of the given dataset', () => {
      expect(
        buildDatafileTableUrlForDataset({
          dataset: TEST_DATASET,
          facilityName: 'data',
        })
      ).toEqual('/browse/investigation/0/dataset/623/datafile');
    });
  });

  describe('buildUrlToDatafileTableContainingDatafile', () => {
    it('returns the ISIS URL to the datafile table that contains the given datafile', () => {
      expect(
        buildUrlToDatafileTableContainingDatafile({
          datafile: TEST_DATAFILE,
          facilityName: FACILITY_NAME.isis,
        })
      ).toEqual(
        '/browse/instrument/648/facilityCycle/854/investigation/0/dataset/623/datafile'
      );
    });

    it('returns the DLS URL to the datafile table that contains the given datafile', () => {
      expect(
        buildUrlToDatafileTableContainingDatafile({
          datafile: TEST_DATAFILE,
          facilityName: FACILITY_NAME.dls,
        })
      ).toEqual(
        '/browse/proposal/test investigation/investigation/0/dataset/623/datafile'
      );
    });

    it('returns the generic URL to the datafile table that contains the given datafile', () => {
      expect(
        buildUrlToDatafileTableContainingDatafile({
          datafile: TEST_DATAFILE,
          facilityName: 'asdasd',
        })
      ).toEqual('/browse/investigation/0/dataset/623/datafile');
    });

    it('returns null if the datafile does not have an associated dataset', () => {
      const testDatafile: Datafile = structuredClone(TEST_DATAFILE);
      delete testDatafile.dataset;

      expect(
        buildUrlToDatafileTableContainingDatafile({
          datafile: testDatafile,
          facilityName: 'asdasd',
        })
      ).toBeNull();
    });
  });
});

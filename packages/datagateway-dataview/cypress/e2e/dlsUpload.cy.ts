const datasets: number[] = [];
const datafiles: number[] = [];

describe.skip('DLS Upload functionality', () => {
  beforeEach(() => {
    cy.intercept('**/upload/').as('upload');
    cy.intercept('**/commit').as('commit');
    cy.intercept('**/datasets/?*').as('deleteDataset');
    cy.intercept('**/datafiles/?*').as('deleteDatafile');
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });
  });

  it('should correctly render all upload buttons', () => {
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/');

    cy.get('[aria-label="Upload Dataset to Visit"]').should('be.visible');

    cy.get('[aria-label="page view Display as cards"]').click();
    cy.get('[aria-label="Upload Dataset to Visit"]')
      .contains('Upload Dataset')
      .should('be.visible');

    cy.get('[aria-label="card-title"]').first().click();
    cy.get('[aria-label="Upload Datafiles to Dataset"]')
      .contains('Upload Datafile')
      .should('be.visible');

    cy.get('[aria-label="page view Display as table"]').click();
    cy.get('[aria-label="Upload Datafiles to Dataset"]').should('be.visible');

    cy.get('[data-testid="dls-datasets-table-title"]').first().click();
    cy.get('[aria-label="Upload Datafiles to Dataset"]')
      .contains('Upload Datafiles to Dataset')
      .should('be.visible');
  });

  describe('Datasets', () => {
    beforeEach(() => {
      cy.visit('/browse/proposal/INVESTIGATION%201/investigation/');
    });

    afterEach(() => {
      cy.removeDownloads(datasets, datafiles).then(() => {
        datasets.length = 0;
        datafiles.length = 0;
      });
    });

    it('should render dataset upload dialog', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[role="dialog"]').should('be.visible');

      cy.contains('Upload Dataset to Visit').should('be.visible');
      cy.get('[aria-label="upload"]').should('be.disabled');
      cy.get('[aria-label="close"]').should('be.visible');
      cy.get('[aria-label="cancel"]').should('be.visible');
      cy.get('[aria-label="Uppy Dashboard"]').should('be.visible');
      cy.get('input[id="upload-name"]').should('be.visible');
      cy.get('textarea[id="upload-description"]').should('be.visible');

      cy.get('[aria-label="close"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should be able to upload a dataset with a single file', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').should('be.enabled');

      cy.get('[aria-label="upload"]').click();
      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        datasets.push(commit.response?.body.datasetId);
      });

      cy.get('[aria-label="upload"]').should('be.disabled');

      cy.get('button').contains('Done').click();
      cy.get('[data-testid="dls-visits-table-visitId"]').first().click();

      cy.get('[aria-label="Test dataset"]').should('be.visible').click();
      cy.get('[aria-label="datafile.txt"]').should('be.visible');
    });

    it('should be able to upload a dataset with multiple files', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      // add a file via drag-drop
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      // TODO: add a file via file explorer
      cy.get('[aria-label="Add more files"]').click();
      cy.get('button').contains('browse files').should('be.visible');
      cy.get('button').contains('browse folders').should('be.visible');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.json',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').should('be.enabled');

      cy.get('[aria-label="upload"]').click();
      cy.wait(['@upload', '@upload']);
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        datasets.push(commit.response?.body.datasetId);
      });

      cy.get('[aria-label="upload"]').should('be.disabled');
      cy.get('input[id="upload-name"]').should('be.disabled');
      cy.get('textarea[id="upload-description"]').should('be.disabled');

      // should not allow any more files to be added
      cy.get('[aria-label="Add more files"]').should('not.exist');
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.json',
        { action: 'drag-drop' }
      );
      cy.contains('Cannot add more files');

      cy.get('button').contains('Done').click();
      cy.get('[data-testid="dls-visits-table-visitId"]').first().click();

      cy.get('[aria-label="Test dataset"]').should('be.visible').click();
      cy.get('[aria-label="datafile.txt"]').should('be.visible');
      cy.get('[aria-label="datafile.json"]').should('be.visible');
    });

    it('should not allow to upload .xml files', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'datafile.xml',
          mimeType: 'application/xml',
        },
        { action: 'drag-drop' }
      );

      cy.contains('.xml files are not allowed');
    });

    it('should not be able to upload a dataset without a name', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').click();
      cy.contains('Dataset name cannot be empty');
    });

    it('should not be able to upload a dataset with a name that already exists', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Dataset 1');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').click();
      cy.contains('Dataset "Dataset 1" already exists in this investigation');
    });

    it('should not allow to add a file with the same name', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.contains('File named "datafile.txt" is already in the upload queue');
    });

    it('should reset the form when the cancel button is clicked', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="cancel"]').click();
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.get('[id="upload-name"]').should('have.value', '');
      cy.get('[id="upload-description"]').should('have.value', '');
    });

    it('should not reset the form when the close button is clicked', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="close"]').click();
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.get('[id="upload-name"]').should('have.value', 'Test dataset');
      cy.get('[id="upload-description"]').should(
        'have.value',
        'Test description'
      );
      cy.contains('datafile.txt');
    });

    it('should allow to retry a failed upload', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'fail',
          mimeType: '',
        },
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').click();

      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        datasets.push(commit.response?.body.datasetId);
      });

      cy.contains('Failed to upload notfail');

      cy.contains('Retry').click();

      cy.contains('datafile.txt').should('be.visible');
      cy.contains('notfail').should('be.visible');

      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
      });
    });

    it('should recover files after a browser crash', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      cy.get('[id="upload-name"]').type('Test dataset');
      cy.get('[id="upload-description"]').type('Test description');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);

      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.contains('datafile.txt').should('be.visible');
      cy.get('[id="uppy_uppy-bigfile/txt-1e-text/plain-20971520-0"]').should(
        'be.visible'
      );
      cy.get('[id="uppy_uppy-bigfile/txt-1e-text/plain-20971520-0"]').should(
        'have.class',
        'is-ghost'
      );
      cy.contains('Session restored').should('be.visible');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );

      cy.get('[id="uppy_uppy-bigfile/txt-1e-text/plain-20971520-0"]').should(
        'not.have.class',
        'is-ghost'
      );
      cy.get('input[id="upload-name"]').type('Test dataset');
      cy.get('[aria-label="upload"]').click();
      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        datasets.push(commit.response?.body.datasetId);
      });
    });

    it('disables the upload button correctly', () => {
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();

      // Upload button should be disabled when no files are selected
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be disabled if invalid file is selected
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'datafile.xml',
          mimeType: 'application/xml',
        },
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be enabled if valid file is selected
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.enabled');

      // should be disabled if all files are removed
      cy.get('[aria-label="Remove file"]').click();
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be enabled when files are restored (without ghost files)
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.json',
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.enabled');
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.get('[aria-label="upload"]').should('be.enabled');

      // should be disabled when files are restored (with ghost files)
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be enabled when ghost files are removed
      cy.get('[aria-label="Remove file"]').first().click({ force: true });
      cy.get('[aria-label="upload"]').should('be.enabled');

      // should be enabled when ghost file is reselcted
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.get('[aria-label="Upload Dataset to Visit"]').first().click();
      cy.get('[aria-label="upload"]').should('be.disabled');
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.enabled');
    });
  });

  describe('Datafiles', () => {
    beforeEach(() => {
      cy.visit(
        '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/13/datafile'
      );
    });

    afterEach(() => {
      cy.removeDownloads(datasets, datafiles).then(() => {
        datasets.length = 0;
        datafiles.length = 0;
      });
    });

    it('should render datafile upload dialog', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[role="dialog"]').should('be.visible');

      cy.contains('Upload Datafiles to Dataset').should('be.visible');
      cy.get('[aria-label="upload"]').should('be.disabled');
      cy.get('[aria-label="close"]').should('be.visible');
      cy.get('[aria-label="cancel"]').should('be.visible');
      cy.get('[aria-label="Uppy Dashboard"]').should('be.visible');
      cy.get('input[id="upload-name"]').should('not.exist');
      cy.get('textarea[id="upload-description"]').should('not.exist');

      cy.get('[aria-label="close"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should be able to upload a single datafile', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').should('be.enabled');

      cy.get('[aria-label="upload"]').click();
      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        commit.response?.body.datafiles.forEach((datafile: number) => {
          datafiles.push(datafile);
        });
      });

      cy.get('[aria-label="upload"]').should('be.disabled');

      cy.get('button').contains('Done').click();
      cy.get('[aria-label="datafile.txt"]').should('be.visible');
    });

    it('should be able to upload multiple datafiles', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.json',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').should('be.enabled');

      cy.get('[aria-label="upload"]').click();
      cy.wait(['@upload', '@upload']);
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        commit.response?.body.datafiles.forEach((datafile: number) => {
          datafiles.push(datafile);
        });
      });

      cy.get('[aria-label="upload"]').should('be.disabled');

      cy.get('button').contains('Done').click();
      cy.get('[aria-label="datafile.txt"]').should('be.visible');
      cy.get('[aria-label="datafile.json"]').should('be.visible');
    });

    it('should not allow to upload .xml files', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'datafile.xml',
          mimeType: 'application/xml',
        },
        { action: 'drag-drop' }
      );

      cy.contains('.xml files are not allowed');
    });

    it('should not allow to add a file with the same name', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.contains('File named "datafile.txt" is already in the upload queue');
    });

    it('should reset the form when the cancel button is clicked', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="cancel"]').click();
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();
      cy.contains('datafile.txt').should('not.exist');
    });

    it('should not reset the form when the close button is clicked', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="close"]').click();
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();
      cy.contains('datafile.txt').should('be.visible');
    });

    it('should allow to retry a failed upload', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'fail',
          mimeType: '',
        },
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="upload"]').click();

      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        commit.response?.body.datafiles.forEach((datafile: number) => {
          datafiles.push(datafile);
        });
      });

      cy.contains('Failed to upload notfail');

      // upload button should be disabled
      cy.get('[aria-label="upload"]').should('be.disabled');

      cy.contains('Retry').click();

      cy.contains('datafile.txt').should('be.visible');
      cy.contains('notfail').should('be.visible');

      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        commit.response?.body.datafiles.forEach((datafile: number) => {
          datafiles.push(datafile);
        });
      });
    });

    it('should recover files after a browser crash', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);

      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();
      cy.contains('datafile.txt').should('be.visible');
      cy.get('[id="uppy_uppy-bigfile/txt-1e-text/plain-20971520-0"]').should(
        'be.visible'
      );
      cy.get('[id="uppy_uppy-bigfile/txt-1e-text/plain-20971520-0"]').should(
        'have.class',
        'is-ghost'
      );
      cy.contains('Session restored').should('be.visible');

      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );

      cy.get('[id="uppy_uppy-bigfile/txt-1e-text/plain-20971520-0"]').should(
        'not.have.class',
        'is-ghost'
      );

      cy.get('[aria-label="upload"]').click();
      cy.wait('@upload');
      cy.wait('@commit').then((commit) => {
        expect(commit.response?.statusCode).to.equal(201);
        commit.response?.body.datafiles.forEach((datafile: number) => {
          datafiles.push(datafile);
        });
      });

      cy.get('[aria-label="close"]').click();
      cy.get('[aria-label="datafile.txt"]').should('be.visible');
      cy.get('[aria-label="bigfile.txt"]').should('be.visible');
    });

    it('disables the upload button correctly', () => {
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();

      // Upload button should be disabled when no files are selected
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be disabled if invalid file is selected
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'datafile.xml',
          mimeType: 'application/xml',
        },
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be enabled if valid file is selected
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.txt',
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.enabled');

      // should be disabled if all files are removed
      cy.get('[aria-label="Remove file"]').click();
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be enabled when files are restored (without ghost files)
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        'cypress/fixtures/datafile.json',
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.enabled');
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();
      cy.get('[aria-label="upload"]').should('be.enabled');

      // should be disabled when files are restored (with ghost files)
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();
      cy.get('[aria-label="upload"]').should('be.disabled');

      // should be enabled when ghost files are removed
      cy.get('[aria-label="Remove file"]').first().click({ force: true });
      cy.get('[aria-label="upload"]').should('be.enabled');

      // should be enabled when ghost file is reselcted
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.reload(true);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.get('[aria-label="Upload Datafiles to Dataset"]').first().click();
      cy.get('[aria-label="upload"]').should('be.disabled');
      cy.get('[aria-label="Uppy Dashboard"]').selectFile(
        {
          contents: Cypress.Buffer.alloc(20 * 1024 * 1024),
          fileName: 'bigfile.txt',
          mimeType: '',
          lastModified: 0,
        },
        { action: 'drag-drop' }
      );
      cy.get('[aria-label="upload"]').should('be.enabled');
    });
  });
});

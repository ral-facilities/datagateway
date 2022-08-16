import { Datafile } from 'datagateway-common';
import * as React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import DatafilePreviewerContext from './datafilePreviewerContext';
import DetailsPane from './detailsPane.component';
import { mockDatafile } from './testData';

function renderComponent({ datafile }: { datafile: Datafile }): RenderResult {
  return render(
    <DatafilePreviewerContext.Provider value={{ datafile }}>
      <DetailsPane />
    </DatafilePreviewerContext.Provider>
  );
}

describe('DetailsPane', () => {
  it('should display the name of the datafile being previewed', async () => {
    renderComponent({ datafile: mockDatafile });

    expect(
      await screen.findByText('datafiles.details.name')
    ).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.name)).toBeInTheDocument();
  });

  describe('should display the description of the datafile being previewed', () => {
    it('if it has a description', async () => {
      renderComponent({ datafile: mockDatafile });

      expect(
        await screen.findByText('datafiles.details.description')
      ).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.description)).toBeInTheDocument();
    });

    it('with an unknown message if it does not have a description', async () => {
      const { description, ...datafileWithNoDescription } = mockDatafile;

      renderComponent({ datafile: datafileWithNoDescription });

      expect(
        await screen.findByText('datafiles.details.description')
      ).toBeInTheDocument();
      expect(screen.getByText('datafiles.details.unknown')).toBeInTheDocument();
    });
  });

  describe('should display the size of the datafile being previewed', () => {
    it('if the size is available', async () => {
      renderComponent({ datafile: mockDatafile });

      expect(
        await screen.findByText('datafiles.details.size')
      ).toBeInTheDocument();
      expect(screen.getByText('100 B')).toBeInTheDocument();
    });

    it('with an unknown message if the size is unavailable', async () => {
      const { fileSize, ...datafileWithNoSize } = mockDatafile;

      renderComponent({ datafile: datafileWithNoSize });

      expect(
        await screen.findByText('datafiles.details.size')
      ).toBeInTheDocument();
      expect(screen.getByText('datafiles.details.unknown')).toBeInTheDocument();
    });
  });

  describe('should display the location of the datafile being previewed', () => {
    it('if it has a location', async () => {
      renderComponent({ datafile: mockDatafile });

      expect(
        await screen.findByText('datafiles.details.location')
      ).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.location)).toBeInTheDocument();
    });

    it('with an unknown message if it does not have a location', async () => {
      const { location, ...datafileWithNoLocation } = mockDatafile;

      renderComponent({ datafile: datafileWithNoLocation });

      expect(
        await screen.findByText('datafiles.details.location')
      ).toBeInTheDocument();
      expect(screen.getByText('datafiles.details.unknown')).toBeInTheDocument();
    });
  });

  describe('should display the last modified time of the datafile being previewed', () => {
    it('if the last modified time is known', async () => {
      renderComponent({ datafile: mockDatafile });

      expect(
        await screen.findByText('datafiles.details.mod_time')
      ).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.modTime)).toBeInTheDocument();
    });

    it('with an unknown message if the last modified time is unknown', async () => {
      renderComponent({
        datafile: {
          ...mockDatafile,
          modTime: '',
        },
      });

      expect(
        await screen.findByText('datafiles.details.mod_time')
      ).toBeInTheDocument();
      expect(screen.getByText('datafiles.details.unknown')).toBeInTheDocument();
    });
  });

  describe('should display the creation time of the datafile being previewed', () => {
    it('if the creation date is known', async () => {
      renderComponent({ datafile: mockDatafile });

      expect(
        await screen.findByText('datafiles.details.create_time')
      ).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.createTime)).toBeInTheDocument();
    });

    it('with an unknown message if the creation date is unknown', async () => {
      renderComponent({
        datafile: {
          ...mockDatafile,
          createTime: '',
        },
      });

      expect(
        await screen.findByText('datafiles.details.create_time')
      ).toBeInTheDocument();
      expect(screen.getByText('datafiles.details.unknown')).toBeInTheDocument();
    });
  });

  describe('should show nothing if the datafile previewer context is not given', () => {
    const { container } = render(<DetailsPane />);
    expect(container.children).toHaveLength(0);
  });
});

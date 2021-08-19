import React from 'react';
import Button from '@material-ui/core/Button';
import {
  withTranslation,
  WithTranslation,
  useTranslation,
} from 'react-i18next';

interface SearchButtonProps {
  initiateSearch: () => void;
}

type SearchButtonCombinedProps = WithTranslation & SearchButtonProps;

const SearchButton = (props: SearchButtonCombinedProps): React.ReactElement => {
  const { initiateSearch } = props;

  const [t] = useTranslation();

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={initiateSearch}
        aria-label={t('searchBox.search_button_arialabel')}
        size="large"
        fullWidth={true}
      >
        {t('searchBox.search_button')}
      </Button>
    </div>
  );
};

const TranslatedSearchButton = withTranslation()(SearchButton);
TranslatedSearchButton.displayName = 'TranslatedSearchButton';
export default TranslatedSearchButton;

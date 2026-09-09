import { styled } from '@mui/material';

const StyledDOILink = styled('a')({
  display: 'inline-flex',
  backgroundColor: '#000',
  color: '#fff',
  textDecoration: 'none',
  paddingLeft: '5px',
  borderRadius: '5px',
  overflow: 'hidden',
});

const StyledDOISpan = styled('span')({
  backgroundColor: '#09c',
  padding: '0 5px',
  marginLeft: '5px',
  '&:hover': {
    backgroundColor: '#006a8d',
  },
});

const StyledDOI: React.FC<{
  doi: string;
  doiHandleUrl: string;
  testId?: string;
}> = ({ doi, doiHandleUrl, testId }) => (
  <StyledDOILink href={`${doiHandleUrl}/${doi}`} data-testid={testId}>
    DOI <StyledDOISpan>{doi}</StyledDOISpan>
  </StyledDOILink>
);

export default StyledDOI;

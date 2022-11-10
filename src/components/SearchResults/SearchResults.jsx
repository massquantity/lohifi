import { ClearRefinements, connectStateResults, InfiniteHits } from "react-instantsearch-dom";
import Hit from "../Hit";
import styles from "./SearchResults.module.scss";


const SearchResults = ({ searchState, searchResults, error }) => {
  const query = searchState.query;
  const numHits = searchResults?.nbHits || 0;

  if (!searchResults) {
    return (
      <>
        Failed to get search results
        {error ? ` due to ${error.message}.` : '.'}
      </>
    )
  }

  return (
    <>
      {query !== '' && (
        <>
          {numHits > 0 ? (
            <div>
              <InfiniteHits
                hitComponent={Hit}
                translations={{loadMore: 'Show more results'}}
              />
            </div>
          ) : (
            <div className={styles.empty}>
              No results found for <span className={styles.span}>{query}</span>.
              <ClearRefinements />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default connectStateResults(SearchResults);

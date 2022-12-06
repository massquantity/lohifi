import { connectStats } from "instantsearch.js/es/connectors";
import {
  ClearRefinements,
  InfiniteHits,
  SortBy, useConnector,
  useInstantSearch,
} from "react-instantsearch-hooks-web";
import Hit from "../Hit";
import styles from "./SearchResults.module.scss";

const Stats = () => {
  const { nbHits, processingTimeMS } = useConnector(connectStats);
  return (
    <div className={styles.stats}>
      {nbHits} results found in {processingTimeMS}ms.
    </div>
  )
};

const SearchResults = () => {
  const { uiState, results, error } = useInstantSearch();
  const query = uiState.releases.query;
  const numHits = results?.nbHits || 0;

  if (!results) {
    return (
      <>
        Failed to get search results
        {error ? ` due to ${error.message}.` : '.'}
      </>
    )
  }

  return (
    <>
      { query && (
        <>
          {numHits > 0 ? (
            <div>
              <div className={styles.meta}>
                <SortBy
                  items={[
                    { label: 'Relevancy', value: 'releases' },
                    { label: 'Recent first', value: 'releases:release_date:desc' },
                    { label: 'Old first', value: 'releases:release_date:asc' },
                  ]}
                />
                <Stats />
              </div>
              <InfiniteHits
                hitComponent={Hit}
                showPrevious={false}
                translations={{showMoreButtonText: 'Show more results'}}
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

export default SearchResults;

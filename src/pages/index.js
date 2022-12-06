import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { Configure, InstantSearch } from 'react-instantsearch-hooks-web';
import NavBar from "../components/NavBar";
import Filters from "../components/Filters";
import SearchResults from "../components/SearchResults";
import styles from '../styles/home.module.scss';

const INDEX_NAME = 'releases';
const searchClient = instantMeiliSearch(
  process.env.NEXT_PUBLIC_MEILI_HOST,
  process.env.NEXT_PUBLIC_API_KEY,
  {
    placeholderSearch : false,
    primaryKey : 'id',
    keepZeroFacets : false,
    matchingStrategy: 'all',
  }
);


export default function Home() {
  return (
    <div>
      <h1 className={styles.header}>Instant Music Search</h1>
      <InstantSearch indexName={INDEX_NAME} searchClient={searchClient} routing={true}>
        <div className={styles.searchbar}>
          <NavBar placeholder="Search release or artist here..." />
        </div>
        <div className={styles.container}>
          <div className={styles.filters}>
            <Filters />
          </div>
          <div className={styles.results}>
            <SearchResults />
          </div>
        </div>
        <Configure hitsPerPage={15} />
      </InstantSearch>
    </div>
  );
};

import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { renderToString } from "react-dom/server";
import { getServerState } from "react-instantsearch-hooks-server";
import { history } from 'instantsearch.js/es/lib/routers/index.js';
import {
  Configure,
  InstantSearch,
  InstantSearchSSRProvider,
} from 'react-instantsearch-hooks-web';
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

export default function Home({ serverState, url }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <h1 className={styles.header}>Instant Music Search</h1>
      <InstantSearch
        indexName={INDEX_NAME}
        searchClient={searchClient}
        routing={{
          router: history({
            getLocation: () =>
              typeof window === 'undefined' ? new URL(url) : window.location,
          }),
        }}
      >
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
    </InstantSearchSSRProvider>
  );
};

export const getServerSideProps = async ({ req, res }) => {
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${60 * 60}, stale-while-revalidate=${24 * 60 * 60}`
  );

  const protocol = req.headers.referer?.split('://')[0] || 'https';
  const url = `${protocol}://${req.headers.host}${req.url}`;
  const serverState = await getServerState(<Home url={url} />, { renderToString });
  // console.log(serverState['initialResults']['releases']['state']);
  // console.log(url);
  return {
    props: {
      serverState,
      url,
    },
  };
};

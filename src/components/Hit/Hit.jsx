import { Highlight } from "react-instantsearch-hooks-web";
import styles from './Hit.module.scss';
import Image from "next/image";

const getIcon = urlType => {
  if (urlType === 'amazon') {
    return '/images/amazon_icon.svg';
  } else if (urlType === 'apple') {
    return '/images/apple_music_icon.svg';
  } else if (urlType === 'bandcamp') {
    return '/images/bandcamp_icon.svg';
  } else if (urlType === 'discogs') {
    return '/images/discogs_icon.svg';
  } else if (urlType === 'metal archives') {
    return '/images/metal_archives_icon.jpg';
  } else if (urlType === 'rate your music') {
    return '/images/rate_your_music_icon.png';
  } else if (urlType === 'spotify') {
    return '/images/spotify_icon.svg';
  }
};

const parseDate = (date) => {
  const parsedDate = new Date(date * 1000);
  const year = parsedDate.getUTCFullYear();
  const month = ('0' + (parsedDate.getUTCMonth() + 1)).slice(-2);
  const day = ('0' + parsedDate.getUTCDate()).slice(-2);
  return `${year}/${month}/${day}`
};

const Hit = ({ hit }) => {
  return (
    <div>
      <div className={styles.title}>
        <h6>
          <Highlight attribute="title" hit={hit} highlightedTagName="mark" />
        </h6>
      </div>
      <div className={styles.content}>
        <div className={styles.artist}>
          <span className={styles.property}>Artist:</span>{' '}
          <Highlight attribute="artist" hit={hit} highlightedTagName="mark" />
        </div>
        <div className={styles.date}>
          <span className={styles.property}>Release Date:</span>{' '}
          {parseDate(hit.release_date)}
        </div>
      </div>

      <div className={styles.urls}>
        {hit.urls.map((item, index) => (
            <div key={index}>
              <a href={item['url']} >
                <Image
                  src={getIcon(item['type'])}
                  alt={item['type']}
                  height="45"
                  width="45"
                />
              </a>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Hit;

import { CurrentRefinements, Menu, RefinementList } from 'react-instantsearch-hooks-web';
import styles from './Filters.module.scss'

const transformCurrentRefinements = items => {
  const uniqueItems = [];
  const labels = new Set();
  for (let item of items) {
    if (!labels.has(item.label)) {
      labels.add(item.label)
      if (item.attribute === 'release_decade') {
        item['items'] = [{label: item.currentRefinement, value: item.value}]
      }
      uniqueItems.push({...item, label: ''})
    }
  }
  return uniqueItems;
}

const RefinementComponent = attribute => {
  return (
    <RefinementList
      attribute={attribute}
      operator="or"
      showMore={true}
      translations={{
        showMoreButtonText({ isShowingMore }) {
          return isShowingMore ? 'Show less options' : 'Show more options';
        },
      }}
    />
  );
};

const Filters = () => {
  return (
    <div className={styles.container}>
      <CurrentRefinements transformItems={transformCurrentRefinements} />
      <h4>Release Decade</h4>
      <Menu
        attribute="release_decade"
        transformItems={items => items.sort((a, b) => a.label > b.label ? 1 : -1)}
      />
      <h4>Artists</h4>
      {RefinementComponent('artist')}
      <h4>Genres</h4>
      {RefinementComponent('genres')}
      <h4>Release Type</h4>
      {RefinementComponent('release_type')}
      <h4>Format</h4>
      {RefinementComponent('format')}
    </div>
  );
};

export default Filters;

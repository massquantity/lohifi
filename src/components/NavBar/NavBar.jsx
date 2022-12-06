import { useSearchBox } from 'react-instantsearch-hooks-web';
import styles from './NavBar.module.scss';

const exampleTerm = (text, refine) => (
  <a
    role="button"
    onClick={e => refine(e.currentTarget.text)}
    className={styles.term}
  >
    {text}
  </a>
);

const NavBar = ({ placeholder }) => {
  const { query, refine, clear } = useSearchBox();

  return (
    <form noValidate action="" role="search" className={styles.searchbox}>
      <input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={e => refine(e.currentTarget.value)}
        className={styles.input}
      />
      <span className={styles.span}>Examples:</span>
      {exampleTerm('The Beatles', refine)}
      {exampleTerm('Bach: Goldberg Variations', refine)}
      {exampleTerm('The Wall', refine)}
      {exampleTerm('King Crimson', refine)}
      {exampleTerm('Kendrick Lamar', refine)}
      {exampleTerm('Symphony No. 9', refine)}
      {exampleTerm('周杰伦', refine)}
      {exampleTerm('久石譲', refine)}
      {exampleTerm('機動戦士ガンダム', refine)}
    </form>
  );
};

export default NavBar;

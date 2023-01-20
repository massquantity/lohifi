import { useCallback } from "react";
import { useSearchBox } from 'react-instantsearch-hooks-web';
import styles from './NavBar.module.scss';

const exampleTerm = (text, refine, handleQueryChange) => (
  <a
    role="button"
    onClick={e => {
      handleQueryChange(e.currentTarget.text)
      refine(e.currentTarget.text)
    }}
    className={styles.term}
  >
    {text}
  </a>
);

const NavBar = ({ onQueryChange }) => {
  const { query, refine, clear } = useSearchBox();
  const handleQueryChange = useCallback(q => {
    onQueryChange(q)
  }, [onQueryChange])

  return (
    <form noValidate action="" role="search" className={styles.searchbox}>
      <input
        type="search"
        placeholder="Search release or artist here..."
        value={query}
        onChange={e => {
          handleQueryChange(e.currentTarget.value)
          refine(e.currentTarget.value)
        }}
        className={styles.input}
      />
      <span className={styles.span}>Examples:</span>
      {exampleTerm('The Beatles', refine, handleQueryChange)}
      {exampleTerm('Bach: Goldberg Variations', refine, handleQueryChange)}
      {exampleTerm('The Wall', refine, handleQueryChange)}
      {exampleTerm('King Crimson', refine, handleQueryChange)}
      {exampleTerm('Kendrick Lamar', refine, handleQueryChange)}
      {exampleTerm('Symphony No. 9', refine, handleQueryChange)}
      {exampleTerm('周杰伦', refine, handleQueryChange)}
      {exampleTerm('久石譲', refine, handleQueryChange)}
      {exampleTerm('機動戦士ガンダム', refine, handleQueryChange)}
    </form>
  );
};

export default NavBar;

const fs = require('fs');
const readline = require('readline');
const { MeiliSearch } = require('meilisearch');
const logIndexProgress = require('./utils');

const BATCH_SIZE = process.env.BATCH_SIZE || 1000;
const LOG_SIZE = process.env.LOG_SIZE || 20000;
const CHUNK_SIZE = process.env.CHUNK_SIZE || 4;
const MAX_LINES = process.env.MAX_LINES || Infinity;
const DATA_FOLDER = process.env.DATA_FOLDER || 'assets/';
const HOST = process.env.HOST || 'http://0.0.0.0:7700';
const API_KEY = process.env.API_KEY || '';
const INDEX_NAME = 'releases';

const extractReleaseDate = record => {
  return Math.round(
    Date.parse(
      record['release-date']
    ) / 1000
  ) || 0;
};

// e.g. 1969 => 1960s
const extractReleaseDecade = releaseDate => {
  const releaseDecade = Math.round(
    new Date(releaseDate * 1000).getUTCFullYear() / 10
  ) * 10
  return `${releaseDecade}s`;
};

const extractGenres = record => {
  return record['genres'].map(([firstChar, ...rest]) =>
    firstChar.toUpperCase() + rest.join('').toLowerCase()
  );
};

const extractFields = (record, id) => {
  const releaseDate = extractReleaseDate(record);
  const releaseDecade = extractReleaseDecade(releaseDate);
  const genres = extractGenres(record);
  return {
    id: id,
    title: record['release-title'],
    artist: record['artist'],
    genres: genres,
    format: record['format'],
    release_date: releaseDate,
    release_decade: releaseDecade,
    release_type: record['release-type'],
    urls: record['urls'],
  };
};

const chunkData = (data, chunkSize) => {
  const chunks = [];
  let index = 0;
  while (index < data.length) {
    chunks.push(data.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunks;
};

async function addDocuments(client, indexName, releases) {
  try {
    const chunks = chunkData(releases, CHUNK_SIZE);
    await Promise.all(
      chunks.map(async chunk => {
        await client.index(indexName).addDocuments(chunk)
      })
    )
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  const client = new MeiliSearch({ host: HOST, apiKey: API_KEY });
  await client.createIndex(INDEX_NAME, { primaryKey: 'id' });

  await client.index(INDEX_NAME).updateFilterableAttributes([
    'artist',
    'genres',
    'format',
    'release_decade',
    'release_type',
  ]);
  await client.index(INDEX_NAME).updateSortableAttributes(['release_date']);

  const files = fs.readdirSync(DATA_FOLDER, { withFileTypes: true })
    .filter(f => !f.isDirectory() && f.name.startsWith('release'))
    .map(f => DATA_FOLDER.concat(f.name));
  // console.log(files)

  let i = 0, releases = [];
  for (let file of files) {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      i++;
      try {
        const record = JSON.parse(line);
        releases.push(extractFields(record, i));
      } catch (e) {
        console.error(e);
        // console.error(line);
        throw e;
      }

      if (i % BATCH_SIZE === 0) {
        await addDocuments(client, INDEX_NAME, releases);
        // console.log(`${i} records added...`);
        releases = [];
      }

      if (i % LOG_SIZE === 0) {
        console.log(`${i} releases added...`);
        await logIndexProgress(client, INDEX_NAME);
      }

      if (i >= MAX_LINES) {
        break;
      }
    }

    if (releases.length > 0) {
      await addDocuments(client, INDEX_NAME, releases);
      // console.log(`added the rest of ${releases.length} releases...`);
    }
  }
})();

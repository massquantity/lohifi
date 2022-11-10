const fs = require('fs');
const readline = require('readline');
const { MeiliSearch } = require('meilisearch');
const logIndexProgress = require('./utils');

const BATCH_SIZE = 100;
const LOG_SIZE = 500;
const CHUNK_SIZE = 4;
const MAX_LINES = Infinity;
const DATA_FILE = 'assets/1K-records.json';
const INDEX_NAME = 'songs';

const extractReleaseDate = record => {
  return Math.round(
    Date.parse(
      record['release-group']['first-release-date']
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
  return [
    ...record['genres'].map(g => g.name),
    ...record['release-group']['genres'].map(g => g.name),
  ].map(([firstChar, ...rest]) =>
    firstChar.toUpperCase() + rest.join('').toLowerCase()
  );
};

const extractGroupTypes = record => {
  return [
    record['release-group']['primary-type'] || 'Unknown',
    record['release-group']['secondary-types'] || null,
  ].flat().filter(e => e);
};

const extractUrls = record => {
  const validTypes = [
    'amazon asin',
    'streaming',
    'free streaming',
    'download for free',
    'purchase for download',
  ];
  return record['relations']
    .filter(r => validTypes.includes(r['type']))
    .map(r => (
      { type: r['type'], url: r['url']['resource'] }
    ));
};

const extractFields = record => {
  const releaseDate = extractReleaseDate(record);
  const releaseDecade = extractReleaseDecade(releaseDate);
  const genres = extractGenres(record);
  const groupTypes = extractGroupTypes(record);
  const urls = extractUrls(record);
  const artist = record['artist-credit'][0]['artist']['name']

  return record['media']
    .flatMap(media => media['tracks'])
    .filter(track => track)  // filter nulls
    .map(track => {
      return {
        track_id: track['id'],
        title: track['title'],
        album_name: record['title'],
        artist_name: artist,
        genres: genres,
        country: record['country'] || 'Unknown',
        release_date: releaseDate,
        release_decade: releaseDecade,
        release_types: groupTypes,
        urls: urls,
      }
    });
};

const chunkData = (data, chunkSize) => {
  const chunks = [];
  let index = 0;
  while (index < data.length) {
    chunks.push(data.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunks;
}

async function addDocuments(client, indexName, songs) {
  try {
    const chunks = chunkData(songs, CHUNK_SIZE);
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
  const client = new MeiliSearch({
    host: 'http://0.0.0.0:7700',
  })
  await client.createIndex(INDEX_NAME)

  await client.index(INDEX_NAME).updateFilterableAttributes([
    'artist_name',
    'genres',
    'country',
    'release_decade',
    'release_types',
  ])
  await client.index(INDEX_NAME).updateSortableAttributes(['release_date'])

  const fileStream = fs.createReadStream(DATA_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let songs = [];
  let currentLine = 0;
  for await (const line of rl) {
    currentLine++;
    try {
      const record = JSON.parse(line);
      const tracks = extractFields(record);
      songs.push(...tracks);
    } catch (e) {
      console.error(e);
      // console.error(line);
      throw e;
    }

    if (currentLine % BATCH_SIZE === 0) {
      await addDocuments(client, INDEX_NAME, songs);
      console.log(`${currentLine} records added...`);
      songs = [];
    }

    if (currentLine % LOG_SIZE === 0) {
      await logIndexProgress(client, INDEX_NAME);
    }

    if (currentLine >= MAX_LINES) {
      break;
    }
  }

  if (songs.length > 0) {
    await addDocuments(client, INDEX_NAME, songs);
    console.log(`added the rest of ${songs.length} songs...`);
  }
})();

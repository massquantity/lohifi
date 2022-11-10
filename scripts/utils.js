async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

const logIndexProgress = async (client, indexName) => {
  const interval = 1000;
  let finished = false;
  console.log('-------------')
  while (!finished) {
    try {
      const updates = await client.index(indexName).getTasks();
      const processed = updates.results.filter(update => update.status === 'succeeded');
      const processing = updates.results.filter(update => update.status === 'processing');
      const enqueued = updates.results.filter(update => update.status === 'enqueued');
      console.log(`${indexName}:`)
      console.log(`${processed.length} / ${updates.results.length} have been processed`);
      console.log(`${processing.length} / ${updates.results.length} are being processed`);
      console.log(`${enqueued.length} / ${updates.results.length} still enqueued`);
      console.log('-------------')
      if (enqueued.length === 0) finished = true;
      await sleep(interval);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = logIndexProgress;

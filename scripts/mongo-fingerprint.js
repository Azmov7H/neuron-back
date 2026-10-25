/**
 * Captures a read-only fingerprint of the current MongoDB schema surface.
 *
 * Run with mongosh:
 *   mongosh "mongodb://localhost:27017/neuron" --quiet --file scripts/mongo-fingerprint.js \
 *     > docs/mongo-fingerprint.json
 *
 * The fingerprint records collection names, options, indexes, and document
 * counts. It deliberately never reads document contents. T04 must reproduce
 * this file (minus capturedAt/counts) before any domain controller is ported.
 */

const database = db.getSiblingDB(db.getName());

const collections = database
  .getCollectionNames()
  .sort()
  .map((name) => {
    const collection = database.getCollection(name);
    const info = database.getCollectionInfos({ name })[0] ?? {};
    const indexes = collection.getIndexes().map((index) => ({
      name: index.name,
      key: index.key,
      ...(index.unique ? { unique: true } : {}),
      ...(index.sparse ? { sparse: true } : {}),
      ...(index.expireAfterSeconds !== undefined
        ? { expireAfterSeconds: index.expireAfterSeconds }
        : {}),
      ...(index.partialFilterExpression ? { partialFilterExpression: index.partialFilterExpression } : {}),
    }));

    let count = null;
    try {
      count = collection.estimatedDocumentCount();
    } catch {
      count = null;
    }

    return {
      name,
      type: info.type ?? 'collection',
      options: info.options ?? {},
      count,
      indexes,
    };
  });

print(
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      serverVersion: database.version(),
      database: database.getName(),
      collectionCount: collections.length,
      collections,
    },
    null,
    2,
  ),
);

export default async function handler(req, res) {
  let framer;

  try {
    const { connect } = await import("framer-api");

    framer = await connect(
      process.env.FRAMER_PROJECT_URL,
      process.env.FRAMER_API_KEY
    );

    const collections = await framer.getCollections();

    return res.status(200).json({
      ok: true,
      collections: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  } finally {
    if (framer) await framer.disconnect();
  }
}
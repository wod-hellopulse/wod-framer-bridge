import { connect } from "framer-api";

export default async function handler(req, res) {
  let framer;

  try {
    framer = await connect(
      process.env.FRAMER_PROJECT_URL,
      process.env.FRAMER_API_KEY
    );

    const projectInfo = await framer.getProjectInfo();
    const collections = await framer.getCollections();

    const collectionsWithFields = [];

    for (const collection of collections) {
      const fields = await collection.getFields();

      collectionsWithFields.push({
        id: collection.id,
        name: collection.name,
        fields: fields.map((field) => ({
          id: field.id,
          name: field.name,
          type: field.type,
        })),
      });
    }

    return res.status(200).json({
      ok: true,
      project: projectInfo.name,
      collections: collectionsWithFields,
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
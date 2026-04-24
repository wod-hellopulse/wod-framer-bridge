export default async function handler(req, res) {
  let framer;

  try {
    const { connect } = await import("framer-api");

    framer = await connect(
      process.env.FRAMER_PROJECT_URL,
      process.env.FRAMER_API_KEY
    );

    const collections = await framer.getCollections();
    const collection = collections.find((c) => c.id === "qej5xgzg3");

    if (!collection) {
      throw new Error("Newsletter collection not found");
    }

    const fields = await collection.getFields();

    const fieldByName = Object.fromEntries(
      fields.map((field) => [field.name, field])
    );

    await collection.addItems([
      {
        slug: "test-desde-vercel",
        fieldData: {
          [fieldByName.title.id]: {
            type: "string",
            value: "Test desde Vercel 🚀",
          },
          [fieldByName.excerpt.id]: {
            type: "string",
            value: "Este es un post de prueba",
          },
          [fieldByName.content_html.id]: {
            type: "string",
            value: "<p>Hello from API</p>",
          },
        },
      },
    ]);

    return res.status(200).json({
      ok: true,
      message: "Item created in Framer CMS",
      fields: fields.map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  } finally {
    if (framer) await framer.disconnect();
  }
}
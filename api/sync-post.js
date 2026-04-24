export default async function handler(req, res) {
  let framer;

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { connect } = await import("framer-api");

    framer = await connect(
      process.env.FRAMER_PROJECT_URL,
      process.env.FRAMER_API_KEY
    );

    const post = req.body;

    const collections = await framer.getCollections();
    const collection = collections.find((c) => c.id === "qej5xgzg3");

    if (!collection) throw new Error("Newsletter collection not found");

    const fields = await collection.getFields();
    const fieldByName = Object.fromEntries(
      fields.map((field) => [field.name, field])
    );

    await collection.addItems([
  {
    slug: post.slug,
    fieldData: {
      [fieldByName.title.id]: {
        type: "string",
        value: post.title || "",
      },
      [fieldByName.excerpt.id]: {
        type: "string",
        value: post.excerpt || "",
      },
      [fieldByName.beehiiv_post_id.id]: {
        type: "string",
        value: post.beehiiv_post_id || "",
      },
      [fieldByName.beehiiv_url.id]: {
        type: "link",
        value: post.beehiiv_url || "",
      },
      [fieldByName.web_audience.id]: {
        type: "string",
        value: post.web_audience || "",
      },
    },
  },
]);

    return res.status(200).json({
      ok: true,
      message: "Minimal post synced to Framer",
      slug: post.slug,
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
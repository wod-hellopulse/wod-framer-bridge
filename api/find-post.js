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

    const { beehiiv_post_id } = req.body;

    const collections = await framer.getCollections();
    const collection = collections.find((c) => c.id === "qej5xgzg3");

    if (!collection) throw new Error("Newsletter collection not found");

    const fields = await collection.getFields();
    const fieldByName = Object.fromEntries(fields.map((field) => [field.name, field]));

    const items = await collection.getItems();

    const existing = items.find((item) => {
      const value = item.fieldData?.[fieldByName.beehiiv_post_id.id]?.value;
      return value === beehiiv_post_id;
    });

    return res.status(200).json({
      ok: true,
      exists: Boolean(existing),
      framer_item_id: existing?.id || null,
      beehiiv_post_id,
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
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
    const fieldByName = Object.fromEntries(fields.map((field) => [field.name, field]));

    const publishedDate = post.published_at
      ? new Date(Number(post.published_at) * 1000).toISOString()
      : null;

    await collection.addItems([
      {
        id: post.beehiiv_post_id,
        slug: post.slug,
        fieldData: {
          [fieldByName.beehiiv_post_id.id]: { type: "string", value: post.beehiiv_post_id },
          [fieldByName.title.id]: { type: "string", value: post.title },
          [fieldByName.excerpt.id]: { type: "string", value: post.excerpt || "" },
          [fieldByName.beehiiv_url.id]: { type: "link", value: post.beehiiv_url || "" },
          [fieldByName.published_at.id]: { type: "date", value: publishedDate },
          [fieldByName.web_audience.id]: { type: "string", value: post.web_audience || "" },
          [fieldByName.content_html.id]: { type: "string", value: post.content_html || "" },
          [fieldByName.thumbnail_url.id]: { type: "link", value: post.thumbnail_url || "" },
          [fieldByName.last_synced_at.id]: { type: "date", value: new Date().toISOString() },
        },
      },
    ]);

    return res.status(200).json({
      ok: true,
      message: "Post synced to Framer",
      beehiiv_post_id: post.beehiiv_post_id,
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
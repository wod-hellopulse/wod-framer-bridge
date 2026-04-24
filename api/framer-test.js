export default async function handler(req, res) {
  let framer;

  try {
    const { connect } = await import("framer-api");

    framer = await connect(
      process.env.FRAMER_PROJECT_URL,
      process.env.FRAMER_API_KEY
    );

    const collectionId = "qej5xgzg3"; // Newsletter

    const item = await framer.createItem(collectionId, {
      title: "Test desde Vercel 🚀",
      excerpt: "Este es un post de prueba",
      content_html: "<p>Hello from API</p>",
    });

    return res.status(200).json({
      ok: true,
      item,
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
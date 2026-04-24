import { Client } from "framer-api";

export default async function handler(req, res) {
  try {
    const framer = new Client({
      apiKey: process.env.FRAMER_API_KEY,
    });

    const data = req.body;

    console.log("Incoming data:", data);

    const item = await framer.collections.items.create({
      collectionId: "qej5xgzg3", // 👈 tu collection Newsletter
      fields: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content_html: data.content_html,
        beehiiv_url: data.beehiiv_url,
        web_audience: data.web_audience,
        beehiiv_post_id: data.beehiiv_post_id,
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Item created",
      item,
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
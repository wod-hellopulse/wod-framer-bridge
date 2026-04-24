function cleanHtml(html) {
  if (!html) return "";

  let cleaned = html
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .trim();

  // Start at first editorial section when possible
  const markers = [
    "Top Story of the Week",
    "News",
    "Deals",
    "Interesting Reads",
    "Podcasts",
    "In Case You Missed It",
    "World of DaaS Job Board"
  ];

  const markerIndex = markers
    .map((m) => cleaned.search(new RegExp(m, "i")))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];

  if (markerIndex !== undefined) {
    cleaned = cleaned.slice(markerIndex);
  }

  // Remove leftover Beehiiv social/share elements
  cleaned = cleaned
    .replace(/<div[^>]*class=['"][^'"]*bh__byline_wrapper[^'"]*['"][\s\S]*?<\/div>/gi, "")
    .replace(/<div[^>]*class=['"][^'"]*bh__byline_social_wrapper[^'"]*['"][\s\S]*?<\/div>/gi, "")
    .replace(/<a[^>]*facebook\.com\/sharer[\s\S]*?<\/a>/gi, "")
    .replace(/<a[^>]*twitter\.com\/intent[\s\S]*?<\/a>/gi, "")
    .replace(/<a[^>]*linkedin\.com\/share[\s\S]*?<\/a>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");

  return cleaned.trim();
}

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

    const items = await collection.getItems();

    const existing = items.find((item) => {
      const value = item.fieldData?.[fieldByName.beehiiv_post_id.id]?.value;
      return value === post.beehiiv_post_id;
    });

    const framerItem = {
  ...(existing?.id ? { id: existing.id } : {}),
  slug: post.slug,

  fieldData: {
    ...(fieldByName.beehiiv_post_id && {
      [fieldByName.beehiiv_post_id.id]: {
        type: "string",
        value: post.beehiiv_post_id || "",
      },
    }),

    ...(fieldByName.title && {
      [fieldByName.title.id]: {
        type: "string",
        value: post.title || "",
      },
    }),

    ...(fieldByName.excerpt && {
      [fieldByName.excerpt.id]: {
        type: "string",
        value: post.excerpt || "",
      },
    }),

    ...(fieldByName.beehiiv_url && {
      [fieldByName.beehiiv_url.id]: {
        type: "link",
        value: post.beehiiv_url || "",
      },
    }),

    ...(fieldByName.web_audience && {
      [fieldByName.web_audience.id]: {
        type: "string",
        value: post.web_audience || "",
      },
    }),

    ...(fieldByName.published_at && {
      [fieldByName.published_at.id]: {
        type: "date",
        value: post.published_at
          ? new Date(Number(post.published_at) * 1000).toISOString()
          : null,
      },
    }),

    ...(fieldByName.thumbnail_url && {
      [fieldByName.thumbnail_url.id]: {
        type: "link",
        value: post.thumbnail_url || "",
      },
    }),

    ...(fieldByName.content_html && {
      [fieldByName.content_html.id]: {
        type: "string",
        value: post.content_html ? cleanHtml(post.content_html) : "NO CONTENT RECEIVED",
      },
    }),
  },
};

    await collection.addItems([framerItem]);

    return res.status(200).json({
      ok: true,
      action: existing ? "updated" : "created",
      framer_item_id: existing?.id || null,
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
export default async function handler(req, res) {
  try {
    const { connect } = await import("framer-api");

    const client = await connect({
      projectUrl: process.env.FRAMER_PROJECT_URL,
      apiKey: process.env.FRAMER_API_KEY,
    });

    return res.status(200).json({
      ok: true,
      message: "Framer connected",
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
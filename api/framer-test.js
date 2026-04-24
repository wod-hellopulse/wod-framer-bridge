export default async function handler(req, res) {
  let framer;

  try {
    const { connect } = await import("framer-api");

    framer = await connect(
      process.env.FRAMER_PROJECT_URL,
      process.env.FRAMER_API_KEY
    );

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
  } finally {
    if (framer) await framer.disconnect();
  }
}
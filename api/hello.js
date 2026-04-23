export default async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;

    console.log("Incoming data:", data);

    return res.status(200).json({
      ok: true,
      received: data,
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Bridge is alive",
  });
}
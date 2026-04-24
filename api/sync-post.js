export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    message: "endpoint reached",
    method: req.method,
    body: req.body,
  });
}
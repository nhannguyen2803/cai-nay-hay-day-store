export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).end();

  try {
    const tokenRes = await fetch(
      'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          app_id: process.env.LARK_APP_ID,
          app_secret: process.env.LARK_APP_SECRET,
        }),
      }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.tenant_access_token;

    const imgRes = await fetch(
      `https://open.larksuite.com/open-apis/drive/v1/medias/${token}/download`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!imgRes.ok) return res.status(404).end();

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

    const buffer = await imgRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).end();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { base64, filename, mimeType } = req.body;
  if (!base64) return res.status(400).json({ error: 'No file data' });

  const { LARK_APP_ID, LARK_APP_SECRET, LARK_BASE_TOKEN } = process.env;

  try {
    const tokenRes = await fetch(
      'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
      }
    );
    const { tenant_access_token: token } = await tokenRes.json();

    const buffer = Buffer.from(base64, 'base64');
    const fname = filename || 'screenshot.jpg';
    const mime = mimeType || 'image/jpeg';
    const boundary = `Boundary${Date.now()}`;

    const textBuf = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file_name"\r\n\r\n${fname}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="parent_type"\r\n\r\nbitable_image\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="parent_node"\r\n\r\n${LARK_BASE_TOKEN}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\n${buffer.length}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fname}"\r\nContent-Type: ${mime}\r\n\r\n`
    );
    const endBuf = Buffer.from(`\r\n--${boundary}--`);
    const body = Buffer.concat([textBuf, buffer, endBuf]);

    const uploadRes = await fetch(
      'https://open.larksuite.com/open-apis/drive/v1/medias/upload_all',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body,
      }
    );
    const uploadData = await uploadRes.json();

    if (!uploadData.data?.file_token) {
      return res.status(500).json({ error: 'Upload thất bại', details: uploadData });
    }

    res.json({ fileToken: uploadData.data.file_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

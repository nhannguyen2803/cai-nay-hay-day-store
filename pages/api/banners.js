export default async function handler(req, res) {
  const { LARK_APP_ID, LARK_APP_SECRET, LARK_BASE_TOKEN, LARK_BANNER_TABLE_ID } = process.env;

  try {
    const tokenRes = await fetch(
      'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
      }
    );
    const { tenant_access_token: token } = await tokenRes.json();

    const recordsRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_TOKEN}/tables/${LARK_BANNER_TABLE_ID}/records?page_size=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const recordsData = await recordsRes.json();

    if (!recordsData.data) return res.status(500).json({ error: 'Lỗi lấy banners', details: recordsData });

    const banners = recordsData.data.items
      .filter((item) => item.fields['Phân loại'] === 'Banner trên slider')
      .map((item) => {
        const images = item.fields['Hình ảnh'];
        const imageUrl =
          images && images.length > 0
            ? images[0].tmp_url || `/api/image?token=${images[0].file_token}`
            : null;
        return { id: item.record_id, name: item.fields['Tên'] || '', imageUrl };
      })
      .filter((b) => b.imageUrl);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.json({ banners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

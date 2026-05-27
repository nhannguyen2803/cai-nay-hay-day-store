export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { LARK_APP_ID, LARK_APP_SECRET, LARK_BASE_TOKEN, LARK_TABLE_ID } = process.env;

  try {
    // 1. Lấy access token
    const tokenRes = await fetch(
      'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
      }
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.tenant_access_token) {
      return res.status(500).json({ error: 'Không lấy được access token', details: tokenData });
    }
    const accessToken = tokenData.tenant_access_token;

    // 2. Lấy tất cả records (có phân trang)
    let allItems = [];
    let pageToken = null;

    do {
      const url =
        `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_TOKEN}/tables/${LARK_TABLE_ID}/records?page_size=100` +
        (pageToken ? `&page_token=${pageToken}` : '');

      const recordsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const recordsData = await recordsRes.json();

      if (!recordsData.data) {
        return res.status(500).json({ error: 'Không lấy được dữ liệu', details: recordsData });
      }

      allItems = [...allItems, ...recordsData.data.items];
      pageToken = recordsData.data.has_more ? recordsData.data.page_token : null;
    } while (pageToken);

    // 3. Chuyển đổi dữ liệu
    const getText = (val) => {
      if (!val) return '';
      if (Array.isArray(val)) return val.map((t) => t.text || '').join('');
      return String(val);
    };

    const products = allItems.map((item) => {
      const f = item.fields;
      const images = f['Hình ảnh'];
      let imageUrl = null;

      if (images && images.length > 0) {
        const img = images[0];
        // tmp_url là URL tạm thời có thể dùng trực tiếp, nếu không có thì proxy qua /api/image
        imageUrl = img.tmp_url || `/api/image?token=${img.file_token}`;
      }

      return {
        id: item.record_id,
        code: getText(f['Mã SP']),
        name: getText(f['Tên SP']),
        price: Number(f['Giá']) || 0,
        description: getText(f['Mô tả sản phẩm']),
        imageUrl,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

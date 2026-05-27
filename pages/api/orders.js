export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, address, note, items, total, fileToken } = req.body;
  const { LARK_APP_ID, LARK_APP_SECRET, LARK_BASE_TOKEN, LARK_ORDERS_TABLE_ID } = process.env;

  try {
    // 1. Lấy access token
    const tokenRes = await fetch(
      'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
      }
    );
    const { tenant_access_token: token } = await tokenRes.json();

    // 2. Tạo ngày và đếm đơn hôm nay để sinh mã đơn
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = yy + mm + dd;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    const existingRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_TOKEN}/tables/${LARK_ORDERS_TABLE_ID}/records?page_size=500`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const existingData = await existingRes.json();

    let todayCount = 0;
    if (existingData.data?.items) {
      todayCount = existingData.data.items.filter((item) => {
        const t = item.fields['Ngày tạo đơn'];
        if (!t) return false;
        const ms = typeof t === 'number' ? t : new Date(t).getTime();
        return ms >= todayStart && ms < todayEnd;
      }).length;
    }

    const sequence = String(todayCount + 1).padStart(3, '0');
    const orderCode = `CNHD${dateStr}${sequence}`;

    // 3. Chuẩn bị dữ liệu đơn hàng
    const productsText = items
      .map((i) => {
        let line = `${i.name} x${i.qty}`;
        if (i.customName) line += ` (Tên: ${i.customName})`;
        return line;
      })
      .join('; ');

    const fields = {
      'Mã đơn': orderCode,
      'Ngày tạo đơn': now.getTime(),
      'Tên': name,
      'Số điện thoại': phone,
      'Địa chỉ': address,
      'Sản phẩm': productsText,
      'Tổng tiền': total,
      'Ghi chú': note || '',
      'Trạng thái': 'Chờ xác nhận',
    };

    if (fileToken) {
      fields['Ảnh thanh toán'] = [{ file_token: fileToken }];
    }

    // 4. Tạo bản ghi
    const createRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_TOKEN}/tables/${LARK_ORDERS_TABLE_ID}/records`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );
    const createData = await createRes.json();

    if (!createData.data) {
      return res.status(500).json({ error: 'Không tạo được đơn hàng', details: createData });
    }

    res.json({ orderCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

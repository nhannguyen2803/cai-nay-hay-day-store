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

    // 2. Sinh mã đơn
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

    // 3. Tóm tắt sản phẩm cho bản ghi cha
    const productSummary = items
      .map((i) => `${i.name} x${i.qty}`)
      .join(' | ');

    const totalQty = items.reduce((s, i) => s + i.qty, 0);

    // 4. Tạo bản ghi CHA
    const parentFields = {
      'Mã đơn': orderCode,
      'Ngày tạo đơn': now.getTime(),
      'Tên': name,
      'Số điện thoại': phone,
      'Địa chỉ': address,
      'Sản phẩm': productSummary,
      'Số lượng': String(totalQty),
      'Tổng tiền': total,
      'Ghi chú': note || '',
      'Trạng thái': 'Chờ xác nhận',
    };

    if (fileToken) {
      parentFields['Ảnh thanh toán'] = [{ file_token: fileToken }];
    }

    const parentRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_TOKEN}/tables/${LARK_ORDERS_TABLE_ID}/records`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: parentFields }),
      }
    );
    const parentData = await parentRes.json();

    if (!parentData.data) {
      return res.status(500).json({ error: 'Không tạo được đơn hàng', details: parentData });
    }

    // 5. Tạo bản ghi CON — mỗi sản phẩm 1 dòng
    const childPromises = items.map((item) => {
      const childFields = {
        'Mã đơn': orderCode,
        'Sản phẩm': item.name,
        'Mã SP': item.code || '',
        'Số lượng': String(item.qty),
        'Tên in theo yêu cầu': item.customName || '',
        'Đơn giá': item.unitPrice,
        'Thành tiền': item.unitPrice * item.qty,
      };

      return fetch(
        `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_TOKEN}/tables/${LARK_ORDERS_TABLE_ID}/records`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: childFields }),
        }
      );
    });

    await Promise.all(childPromises);

    res.json({ orderCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

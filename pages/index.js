import { useState, useEffect } from 'react';
import Head from 'next/head';

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(44,26,14,0.07)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(44,26,14,0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(44,26,14,0.07)';
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: '1', background: '#F5EEE6', overflow: 'hidden', position: 'relative' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
            }}
          >
            🔑
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#B8A090', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {product.code}
        </p>
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
          {product.name}
        </h3>
        {product.description && (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9E8878', lineHeight: 1.6 }}>
            {product.description}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#8B4A2B' }}>{fmt(product.price)}</span>
          <button
            onClick={handleAdd}
            style={{
              background: added ? '#5A8A5A' : '#2C1A0E',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'background 0.25s',
              whiteSpace: 'nowrap',
            }}
          >
            {added ? '✓ Đã thêm' : '+ Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartModal({ cart, onClose, onRemove, onChangeQty }) {
  const [step, setStep] = useState('cart'); // cart | form | done
  const [info, setInfo] = useState({ name: '', phone: '', address: '', note: '' });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const valid = info.name && info.phone && info.address;

  const handleOrder = () => {
    const lines = cart.map((i) => `• ${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`).join('\n');
    const msg = `ĐƠN HÀNG MỚI\n\nKhách: ${info.name}\nSĐT: ${info.phone}\nĐịa chỉ: ${info.address}\n\nSản phẩm:\n${lines}\n\nTổng: ${fmt(total)}\n${info.note ? '\nGhi chú: ' + info.note : ''}`;
    navigator.clipboard.writeText(msg).catch(() => {});
    setStep('done');
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,10,5,0.55)',
        zIndex: 300,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '22px 22px 0 0',
          padding: '24px 20px 32px',
          width: '100%',
          maxWidth: 520,
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        {step === 'done' ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, margin: '0 0 10px' }}>
              Đặt hàng thành công!
            </h2>
            <p style={{ color: '#9E8878', lineHeight: 1.7, marginBottom: 28 }}>
              Thông tin đơn hàng đã được sao chép vào clipboard.<br />
              Vui lòng gửi cho shop qua Zalo hoặc nhắn tin để xác nhận.
            </p>
            <button
              onClick={onClose}
              style={{
                background: '#8B4A2B', color: '#fff', border: 'none',
                padding: '13px 40px', borderRadius: 10, cursor: 'pointer',
                fontSize: 15, fontWeight: 600,
              }}
            >
              Đóng
            </button>
          </div>
        ) : step === 'form' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: '#9E8878', cursor: 'pointer', fontSize: 14, padding: 0 }}>
                  ← Quay lại
                </button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, margin: '4px 0 0' }}>
                  Thông tin đặt hàng
                </h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ marginBottom: 20, background: '#FBF8F3', borderRadius: 10, padding: '12px 14px' }}>
              {cart.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#4A3020' }}>
                  <span>{i.name} × {i.qty}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #EAE0D5', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>Tổng</span>
                <span style={{ color: '#8B4A2B' }}>{fmt(total)}</span>
              </div>
            </div>

            {[
              { key: 'name', label: 'Họ tên', placeholder: 'Nguyễn Văn A', type: 'text' },
              { key: 'phone', label: 'Số điện thoại', placeholder: '0901 234 567', type: 'tel' },
              { key: 'address', label: 'Địa chỉ giao hàng', placeholder: '123 Đường ABC, Quận 1, TP.HCM', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E5040', marginBottom: 5, letterSpacing: 0.5 }}>
                  {label} *
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={info[key]}
                  onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 13px',
                    border: '1.5px solid #E8DDD3', borderRadius: 9,
                    fontSize: 14, boxSizing: 'border-box',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E5040', marginBottom: 5, letterSpacing: 0.5 }}>
                Ghi chú
              </label>
              <textarea
                placeholder="Yêu cầu đặc biệt, màu sắc, tên khắc..."
                value={info.note}
                onChange={(e) => setInfo({ ...info, note: e.target.value })}
                style={{
                  width: '100%', padding: '11px 13px',
                  border: '1.5px solid #E8DDD3', borderRadius: 9,
                  fontSize: 14, boxSizing: 'border-box', resize: 'none',
                  height: 80, fontFamily: 'inherit', outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
                onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
              />
            </div>

            <button
              disabled={!valid}
              onClick={handleOrder}
              style={{
                width: '100%', background: valid ? '#8B4A2B' : '#D4B8A8',
                color: '#fff', border: 'none', padding: '15px',
                borderRadius: 11, cursor: valid ? 'pointer' : 'default',
                fontSize: 16, fontWeight: 700, letterSpacing: 0.3,
                transition: 'background 0.2s',
              }}
            >
              Xác nhận đặt hàng → {fmt(total)}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, margin: 0 }}>Giỏ hàng</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#B8A090' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                <p style={{ fontSize: 15 }}>Giỏ hàng trống</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 0', borderBottom: '1px solid #F0E8E0',
                    }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F5EEE6', overflow: 'hidden', flexShrink: 0 }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔑</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</p>
                      <p style={{ margin: '2px 0 0', color: '#8B4A2B', fontSize: 13, fontWeight: 600 }}>{fmt(item.price)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => onChangeQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E8DDD3', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A3020' }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => onChangeQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E8DDD3', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A3020' }}>+</button>
                    </div>
                    <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#CCC', cursor: 'pointer', fontSize: 20, padding: '0 4px', flexShrink: 0 }}>×</button>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, padding: '16px 0 0', marginTop: 4 }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: '#8B4A2B' }}>{fmt(total)}</span>
                </div>

                <button
                  onClick={() => setStep('form')}
                  style={{
                    marginTop: 18, width: '100%',
                    background: '#8B4A2B', color: '#fff',
                    border: 'none', padding: '15px',
                    borderRadius: 11, cursor: 'pointer',
                    fontSize: 16, fontWeight: 700,
                  }}
                >
                  Đặt hàng →
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProducts(data.products || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      if (ex) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const changeQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Shop Khánh — Móc Khóa & Nam Châm</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Móc khóa và nam châm thủ công Khánh" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #FBF8F3; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #D4B8A8; border-radius: 3px; }
          input::placeholder, textarea::placeholder { color: #C4AFA0; }
        `}</style>
      </Head>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FBF8F3', minHeight: '100vh', color: '#2C1A0E' }}>
        {/* Header */}
        <header
          style={{
            padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #EAE0D5',
            position: 'sticky', top: 0,
            background: 'rgba(251,248,243,0.95)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
          }}
        >
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1 }}>
              KHÁNH
            </h1>
            <p style={{ fontSize: 10, color: '#B8A090', letterSpacing: 2.5, marginTop: 2 }}>
              MÓC KHÓA · NAM CHÂM
            </p>
          </div>

          <button
            onClick={() => setShowCart(true)}
            style={{
              background: '#2C1A0E', color: '#fff', border: 'none',
              borderRadius: 50, padding: '10px 18px',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
              position: 'relative',
            }}
          >
            <span>🛒</span>
            <span>{totalItems > 0 ? `${totalItems} món` : 'Giỏ hàng'}</span>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: '#C4621C', color: '#fff',
                width: 20, height: 20, borderRadius: '50%',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </header>

        {/* Search */}
        <div style={{ padding: '20px 20px 0', maxWidth: 900, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px',
              border: '1.5px solid #E8DDD3', borderRadius: 12,
              fontSize: 14, outline: 'none',
              background: '#fff', fontFamily: 'inherit',
              color: '#2C1A0E',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
            onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
          />
        </div>

        {/* Products */}
        <main style={{ padding: '24px 20px 48px', maxWidth: 900, margin: '0 auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 80, color: '#B8A090' }}>
              <div style={{ fontSize: 40, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>⏳</div>
              <p style={{ fontSize: 15 }}>Đang tải sản phẩm...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: 60, color: '#C44A2B' }}>
              <p style={{ fontSize: 15 }}>⚠️ {error}</p>
              <p style={{ fontSize: 13, color: '#9E8878', marginTop: 8 }}>Vui lòng thử lại sau</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <p style={{ fontSize: 13, color: '#B8A090', marginBottom: 20 }}>
                {filtered.length} sản phẩm
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 20,
                }}
              >
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#B8A090' }}>
                  <p style={{ fontSize: 15 }}>Không tìm thấy sản phẩm nào</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => { setShowCart(false); setCart(cart.length > 0 ? cart : []); }}
          onRemove={removeFromCart}
          onChangeQty={changeQty}
        />
      )}
    </>
  );
}

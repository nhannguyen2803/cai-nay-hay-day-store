import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const NAME_SURCHARGE = 60000;

// ─── Banner Slider ──────────────────────────────────────────────
function BannerSlider({ banners }) {
  const [cur, setCur] = useState(0);
  const timer = useRef(null);

  const go = useCallback((i) => {
    setCur((i + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    timer.current = setInterval(() => setCur((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(timer.current);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/6', overflow: 'hidden', background: '#F5EEE6' }}>
      {banners.map((b, i) => (
        <div key={b.id} style={{
          position: 'absolute', inset: 0,
          opacity: i === cur ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: i === cur ? 'auto' : 'none',
        }}>
          <img src={b.imageUrl} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={() => go(cur - 1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => go(cur + 1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 20 : 7, height: 7, borderRadius: 4, background: i === cur ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────
function ProductCard({ product, onClick }) {
  return (
    <div
      onClick={() => onClick(product)}
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(44,26,14,0.13)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(44,26,14,0.07)'; }}
    >
      <div style={{ aspectRatio: '1', background: '#F5EEE6', overflow: 'hidden' }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🔑</div>
        }
      </div>
      <div style={{ padding: '12px 14px 16px' }}>
        <p style={{ margin: '0 0 2px', fontSize: 10, color: '#B8A090', letterSpacing: 1.5 }}>{product.code}</p>
        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{product.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#8B4A2B' }}>{fmt(product.price)}</span>
          <span style={{ fontSize: 11, color: '#B8A090' }}>Xem thêm →</span>
        </div>
      </div>
    </div>
  );
}

// ─── Product Modal ──────────────────────────────────────────────
function ProductModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [hasName, setHasName] = useState(false);
  const [customName, setCustomName] = useState('');

  const unitPrice = product.price + (hasName ? NAME_SURCHARGE : 0);
  const totalPrice = unitPrice * qty;

  const handleAdd = () => {
    onAdd({ ...product, qty, customName: hasName ? customName : '', unitPrice });
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.65)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', background: '#F5EEE6', flexShrink: 0 }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🔑</div>
          }
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
        </div>

        {/* Info */}
        <div style={{ padding: '20px 20px 36px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 11, color: '#B8A090', letterSpacing: 1.5 }}>{product.code}</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.3 }}>{product.name}</h2>

          {product.description && (
            <div style={{ background: '#FBF8F3', borderRadius: 10, padding: '14px', marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#6E5040', lineHeight: 1.8 }}>{product.description}</p>
            </div>
          )}

          {/* Quantity + Name */}
          <div style={{ border: '1.5px solid #F0E8E0', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
            {/* Qty */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Số lượng</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #E8DDD3', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #E8DDD3', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            {/* Add name */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={hasName} onChange={(e) => setHasName(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#8B4A2B', cursor: 'pointer', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                Thêm tên khắc{' '}
                <span style={{ color: '#8B4A2B', fontWeight: 700 }}>+{fmt(NAME_SURCHARGE)}</span>
              </span>
            </label>

            {hasName && (
              <input
                autoFocus
                placeholder="Nhập tên cần khắc..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{ marginTop: 12, width: '100%', padding: '11px 13px', border: '1.5px solid #E8DDD3', borderRadius: 9, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
                onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
              />
            )}
          </div>

          {/* Price + CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#B8A090' }}>Tổng tiền</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#8B4A2B' }}>{fmt(totalPrice)}</p>
            </div>
            <button
              onClick={handleAdd}
              style={{ background: '#2C1A0E', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
            >
              Thêm vào giỏ 🛒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Modal ──────────────────────────────────────────────
function CartModal({ cart, onClose, onRemove, onChangeQty, onClearCart }) {
  const [step, setStep] = useState('cart');
  const [info, setInfo] = useState({ name: '', phone: '', address: '', note: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [orderCode, setOrderCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const formValid = info.name && info.phone && info.address;

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      let fileToken = null;

      // Upload screenshot nếu có
      if (screenshot) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (ev) => resolve(ev.target.result.split(',')[1]);
          reader.readAsDataURL(screenshot);
        });
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, filename: screenshot.name, mimeType: screenshot.type }),
        });
        const uploadData = await uploadRes.json();
        fileToken = uploadData.fileToken || null;
      }

      // Tạo đơn hàng
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...info, items: cart, total, fileToken }),
      });
      const orderData = await orderRes.json();

      if (!orderData.orderCode) {
        setError(orderData.error || 'Có lỗi xảy ra, vui lòng thử lại');
        return;
      }

      setOrderCode(orderData.orderCode);
      setStep('done');
      onClearCart();
    } catch (e) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 13px',
    border: '1.5px solid #E8DDD3', borderRadius: 9,
    fontSize: 14, boxSizing: 'border-box',
    fontFamily: 'inherit', outline: 'none', marginBottom: 12,
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#6E5040', marginBottom: 5, letterSpacing: 0.3,
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.55)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '32px 8px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, margin: '0 0 8px' }}>Đặt hàng thành công!</h2>
            <p style={{ color: '#9E8878', marginBottom: 8 }}>Mã đơn hàng của bạn:</p>
            <div style={{ background: '#FBF8F3', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'inline-block' }}>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#8B4A2B', letterSpacing: 2 }}>{orderCode}</p>
            </div>
            <p style={{ color: '#9E8878', fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>
              Shop sẽ xác nhận đơn hàng trong thời gian sớm nhất.<br />Cảm ơn bạn đã tin tưởng Khánh! 🌸
            </p>
            <button onClick={onClose} style={{ background: '#8B4A2B', color: '#fff', border: 'none', padding: '13px 40px', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Đóng</button>
          </div>
        )}

        {/* ── PAYMENT ── */}
        {step === 'payment' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', color: '#9E8878', cursor: 'pointer', fontSize: 13, padding: 0 }}>← Quay lại</button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, margin: '4px 0 0' }}>Thanh toán</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            <div style={{ background: '#FBF8F3', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9E8878' }}>Nội dung chuyển khoản:</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#2C1A0E' }}>CNHD {info.phone}</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6E5040' }}>Số tiền: <strong style={{ color: '#8B4A2B' }}>{fmt(total)}</strong></p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src="/image.png" alt="QR thanh toán" style={{ width: '100%', maxWidth: 260, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <p style={{ margin: '10px 0 0', fontSize: 12, color: '#B8A090' }}>Quét mã để chuyển khoản</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Ảnh xác nhận chuyển khoản (tuỳ chọn)</label>
              <label style={{ display: 'block', border: '2px dashed #E8DDD3', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: screenshotPreview ? '#fff' : '#FBF8F3' }}>
                <input type="file" accept="image/*" onChange={handleScreenshot} style={{ display: 'none' }} />
                {screenshotPreview
                  ? <img src={screenshotPreview} alt="preview" style={{ maxHeight: 140, borderRadius: 8, maxWidth: '100%' }} />
                  : <div style={{ color: '#B8A090', fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>Bấm để chọn ảnh</div>
                }
              </label>
            </div>

            {error && <p style={{ color: '#C44A2B', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={submitting}
              style={{ width: '100%', background: submitting ? '#C4B0A0' : '#8B4A2B', color: '#fff', border: 'none', padding: '15px', borderRadius: 11, cursor: submitting ? 'wait' : 'pointer', fontSize: 16, fontWeight: 700 }}
            >
              {submitting ? 'Đang xử lý...' : `✓ Xác nhận đã chuyển khoản → ${fmt(total)}`}
            </button>
          </>
        )}

        {/* ── FORM ── */}
        {step === 'form' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: '#9E8878', cursor: 'pointer', fontSize: 13, padding: 0 }}>← Quay lại</button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, margin: '4px 0 0' }}>Thông tin đặt hàng</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            <div style={{ background: '#FBF8F3', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              {cart.map((i) => (
                <div key={i.cartKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: '#4A3020' }}>
                  <span>{i.name}{i.customName ? ` (${i.customName})` : ''} × {i.qty}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(i.unitPrice * i.qty)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #EAE0D5', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>Tổng</span>
                <span style={{ color: '#8B4A2B' }}>{fmt(total)}</span>
              </div>
            </div>

            {[
              { key: 'name', label: 'Họ tên *', placeholder: 'Nguyễn Văn A', type: 'text' },
              { key: 'phone', label: 'Số điện thoại *', placeholder: '0901 234 567', type: 'tel' },
              { key: 'address', label: 'Địa chỉ giao hàng *', placeholder: '123 Đường ABC, Quận 1, TP.HCM', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} placeholder={placeholder} value={info[key]}
                  onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
                />
              </div>
            ))}

            <label style={labelStyle}>Ghi chú</label>
            <textarea placeholder="Yêu cầu đặc biệt, màu sắc..." value={info.note}
              onChange={(e) => setInfo({ ...info, note: e.target.value })}
              style={{ ...inputStyle, resize: 'none', height: 80 }}
              onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
              onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
            />

            <button
              disabled={!formValid}
              onClick={() => setStep('payment')}
              style={{ marginTop: 8, width: '100%', background: formValid ? '#8B4A2B' : '#D4B8A8', color: '#fff', border: 'none', padding: '15px', borderRadius: 11, cursor: formValid ? 'pointer' : 'default', fontSize: 16, fontWeight: 700 }}
            >
              Tiếp tục → Thanh toán
            </button>
          </>
        )}

        {/* ── CART ── */}
        {step === 'cart' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, margin: 0 }}>Giỏ hàng</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#B8A090' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                <p>Giỏ hàng trống</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.cartKey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F0E8E0' }}>
                    <div style={{ width: 54, height: 54, borderRadius: 8, background: '#F5EEE6', overflow: 'hidden', flexShrink: 0 }}>
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔑</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</p>
                      {item.customName && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8B4A2B' }}>Tên: {item.customName}</p>}
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: '#8B4A2B', fontWeight: 600 }}>{fmt(item.unitPrice)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => onChangeQty(item.cartKey, item.qty - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E8DDD3', background: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => onChangeQty(item.cartKey, item.qty + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E8DDD3', background: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button onClick={() => onRemove(item.cartKey)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>×</button>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, padding: '16px 0 0', marginTop: 4 }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: '#8B4A2B' }}>{fmt(total)}</span>
                </div>

                <button
                  onClick={() => setStep('form')}
                  style={{ marginTop: 18, width: '100%', background: '#8B4A2B', color: '#fff', border: 'none', padding: '15px', borderRadius: 11, cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
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

// ─── Home ──────────────────────────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/banners').then((r) => r.json()),
    ]).then(([pData, bData]) => {
      setProducts(pData.products || []);
      setBanners(bData.banners || []);
    }).finally(() => setLoading(false));
  }, []);

  const addToCart = (item) => {
    const cartKey = `${item.id}_${item.customName || 'plain'}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) return prev.map((i) => i.cartKey === cartKey ? { ...i, qty: i.qty + item.qty } : i);
      return [...prev, { ...item, cartKey }];
    });
    setShowCart(true);
  };

  const removeFromCart = (cartKey) => setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));
  const changeQty = (cartKey, qty) => {
    if (qty <= 0) return removeFromCart(cartKey);
    setCart((prev) => prev.map((i) => i.cartKey === cartKey ? { ...i, qty } : i));
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Khánh — Móc Khóa & Nam Châm</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #FBF8F3; }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-thumb { background: #D4B8A8; border-radius: 3px; }
          input::placeholder, textarea::placeholder { color: #C4AFA0; }
        `}</style>
      </Head>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FBF8F3', minHeight: '100vh', color: '#2C1A0E' }}>
        {/* Header */}
        <header style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EAE0D5', position: 'sticky', top: 0, background: 'rgba(251,248,243,0.95)', backdropFilter: 'blur(8px)', zIndex: 100 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, lineHeight: 1 }}>KHÁNH</h1>
            <p style={{ fontSize: 10, color: '#B8A090', letterSpacing: 2.5, marginTop: 2 }}>MÓC KHÓA · NAM CHÂM</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            style={{ position: 'relative', background: '#2C1A0E', color: '#fff', border: 'none', borderRadius: 50, padding: '9px 18px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}
          >
            🛒 {totalItems > 0 ? `${totalItems} món` : 'Giỏ hàng'}
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#C4621C', color: '#fff', width: 20, height: 20, borderRadius: '50%', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </span>
            )}
          </button>
        </header>

        {/* Banner Slider */}
        <BannerSlider banners={banners} />

        {/* Search */}
        <div style={{ padding: '20px 20px 0', maxWidth: 900, margin: '0 auto' }}>
          <input
            type="text" placeholder="Tìm sản phẩm..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E8DDD3', borderRadius: 12, fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'inherit', color: '#2C1A0E' }}
            onFocus={(e) => (e.target.style.borderColor = '#8B4A2B')}
            onBlur={(e) => (e.target.style.borderColor = '#E8DDD3')}
          />
        </div>

        {/* Products */}
        <main style={{ padding: '20px 20px 60px', maxWidth: 900, margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#B8A090' }}>
              <p style={{ fontSize: 16 }}>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 12, color: '#B8A090', marginBottom: 16 }}>{filtered.length} sản phẩm</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#B8A090' }}>
                  <p>Không tìm thấy sản phẩm nào</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}

      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onChangeQty={changeQty}
          onClearCart={() => setCart([])}
        />
      )}
    </>
  );
}

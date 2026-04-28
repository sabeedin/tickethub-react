import { useState } from "react"

function formatDate(d) {
  if (!d) return "-"
  return `${d.date || ""}${d.time ? " " + d.time : ""}`
}

export default function OrderModal({ open, onClose, concert, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    qty: 1,
    zoneIndex: "",
    showDateIndex: "",
    pressDateIndex: "",
    infoStatus: "complete",
    customerNote: ""
  })

  if (!open || !concert) return null

  const zones = concert.zones || []
  const showDates = concert.showDates || []
  const pressDates = concert.pressDates || []

  const zone = zones[Number(form.zoneIndex)]
  const qty = Number(form.qty)
  const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1
  const total = zone ? (Number(zone.price) + Number(zone.fee || 0)) * safeQty : 0

async function submit() {
  if (!form.name.trim()) return alert("กรอกชื่อลูกค้าก่อน")
  if (!zone) return alert("เลือกโซนก่อน")
  if (!Number.isFinite(qty) || qty < 1) return alert("จำนวนตั๋วต้องมากกว่า 0")

  const selectedShowDate = showDates[Number(form.showDateIndex)]
  const selectedPressDate = pressDates[Number(form.pressDateIndex)]

  const ok = await onSubmit({
    name: form.name,
    contact: form.contact,
    qty,
    concert: concert.name,
    concertId: concert.id,
    venue: concert.venue,
    ticketUrl: concert.ticketUrl,
    showDate: selectedShowDate ? formatDate(selectedShowDate) : "",
    pressDate: selectedPressDate ? formatDate(selectedPressDate) : "",
    zoneCode: zone.code,
    zonePrice: Number(zone.price),
    feePerTicket: Number(zone.fee || 0),
    feeTotal: Number(zone.fee || 0) * qty,
    total,
    infoStatus: form.infoStatus,
    customerNote: form.customerNote.trim()
  })

  if (!ok) return

  setForm({
    name: "",
    contact: "",
    qty: 1,
    zoneIndex: "",
    showDateIndex: "",
    pressDateIndex: "",
    infoStatus: "complete",
    customerNote: ""
  })

  onClose()
}

  return (
    <div className="modal-back">
      <div className="modal">
        <h3>เพิ่มออเดอร์ — {concert.name}</h3>

        <div className="form">
          <input
            className="input"
            placeholder="ชื่อลูกค้า"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="เบอร์โทร / ไลน์"
            value={form.contact}
            onChange={e => setForm({ ...form, contact: e.target.value })}
          />

          <select
            className="input"
            value={form.showDateIndex}
            onChange={e => setForm({ ...form, showDateIndex: e.target.value })}
          >
            <option value="">เลือกวันแสดง</option>
            {showDates.map((d, i) => (
              <option key={i} value={i}>
                {formatDate(d)}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.pressDateIndex}
            onChange={e => setForm({ ...form, pressDateIndex: e.target.value })}
          >
            <option value="">เลือกรอบกด</option>
            {pressDates.map((d, i) => (
              <option key={i} value={i}>
                {formatDate(d)}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.zoneIndex}
            onChange={e => setForm({ ...form, zoneIndex: e.target.value })}
          >
            <option value="">เลือกโซน</option>
            {zones.map((z, i) => (
              <option key={i} value={i}>
                {z.code} — {z.price} บาท / ค่ากด {z.fee || 0} บาท
              </option>
            ))}
          </select>

          <input
            className="input"
            type="number"
            min="1"
            value={form.qty}
            onChange={e => setForm({ ...form, qty: e.target.value })}
          />

          <select
            className="input"
            value={form.infoStatus}
            onChange={e => setForm({ ...form, infoStatus: e.target.value })}
          >
            <option value="complete">ข้อมูลครบ</option>
            <option value="waiting">รอข้อมูล</option>
            <option value="confirm">ต้องยืนยัน</option>
          </select>

          <textarea
            className="input textarea"
            placeholder="หมายเหตุลูกค้า เช่น โซนสำรอง, งบสูงสุด, ต้องการที่นั่งติดกัน"
            value={form.customerNote}
            onChange={e => setForm({ ...form, customerNote: e.target.value })}
          />

          <div className="total-box">
            ราคาบัตร: <b>{zone ? Number(zone.price) * safeQty : 0}</b> บาท<br />
            ค่ากด: <b>{zone ? Number(zone.fee || 0) * safeQty : 0}</b> บาท<br />
            รวมทั้งหมด: <b>{total}</b> บาท
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn primary" onClick={submit}>
            บันทึกออเดอร์
          </button>
          <button className="btn" onClick={onClose}>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}

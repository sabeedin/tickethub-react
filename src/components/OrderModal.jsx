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
    pressDateIndex: ""
  })

  if (!open || !concert) return null

  const zones = concert.zones || []
  const showDates = concert.showDates || []
  const pressDates = concert.pressDates || []

  const zone = zones[Number(form.zoneIndex)]
  const total = zone ? (Number(zone.price) + Number(zone.fee || 0)) * Number(form.qty || 1) : 0

async function submit() {
  if (!form.name.trim()) return alert("กรอกชื่อลูกค้าก่อน")
  if (!zone) return alert("เลือกโซนก่อน")

  const selectedShowDate = showDates[Number(form.showDateIndex)]
  const selectedPressDate = pressDates[Number(form.pressDateIndex)]

  const ok = await onSubmit({
    name: form.name,
    contact: form.contact,
    qty: Number(form.qty || 1),
    concert: concert.name,
    concertId: concert.id,
    venue: concert.venue,
    ticketUrl: concert.ticketUrl,
    showDate: selectedShowDate ? formatDate(selectedShowDate) : "",
    pressDate: selectedPressDate ? formatDate(selectedPressDate) : "",
    zoneCode: zone.code,
    zonePrice: Number(zone.price),
    feePerTicket: Number(zone.fee || 0),
    feeTotal: Number(zone.fee || 0) * Number(form.qty || 1),
    total
  })

  if (!ok) return

  setForm({
    name: "",
    contact: "",
    qty: 1,
    zoneIndex: "",
    showDateIndex: "",
    pressDateIndex: ""
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
            onChange={e => setForm({ ...form, qty: Number(e.target.value) })}
          />

          <div className="total-box">
            ราคาบัตร: <b>{zone ? Number(zone.price) * Number(form.qty || 1) : 0}</b> บาท<br />
            ค่ากด: <b>{zone ? Number(zone.fee || 0) * Number(form.qty || 1) : 0}</b> บาท<br />
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
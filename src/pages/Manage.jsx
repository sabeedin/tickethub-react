import { useState } from "react"
import useConcerts from "../hooks/useConcerts.js"

const emptyForm = {
  name: "",
  venue: "",
  ticketUrl: "",
  status: "open",
  image: ""
}

export default function Manage() {
  const { concerts, addConcert, updateConcert, deleteConcert } = useConcerts()

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showDates, setShowDates] = useState([{ date: "", time: "" }])
  const [pressDates, setPressDates] = useState([{ date: "", time: "" }])
  const [zones, setZones] = useState([{ code: "", price: "", fee: "" }])

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowDates([{ date: "", time: "" }])
    setPressDates([{ date: "", time: "" }])
    setZones([{ code: "", price: "", fee: "" }])
  }

  function startEdit(c) {
    setEditingId(c.id)

    setForm({
      name: c.name || "",
      venue: c.venue || "",
      ticketUrl: c.ticketUrl || "",
      status: c.status || "open",
      image: c.image || ""
    })

    setShowDates(c.showDates?.length ? c.showDates : [{ date: "", time: "" }])
    setPressDates(c.pressDates?.length ? c.pressDates : [{ date: "", time: "" }])
    setZones(c.zones?.length ? c.zones : [{ code: "", price: "", fee: "" }])

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function updateShowDate(index, key, value) {
    const copy = [...showDates]
    copy[index][key] = value
    setShowDates(copy)
  }

  function updatePressDate(index, key, value) {
    const copy = [...pressDates]
    copy[index][key] = value
    setPressDates(copy)
  }

  function updateZone(index, key, value) {
    const copy = [...zones]
    copy[index][key] = value
    setZones(copy)
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function submit(e) {
    e.preventDefault()

    if (!form.name.trim()) return alert("กรอกชื่อคอนเสิร์ตก่อน")

    const cleanShowDates = showDates.filter(d => d.date)
    const cleanPressDates = pressDates.filter(d => d.date || d.time)
    const cleanZones = zones
      .filter(z => z.code && z.price)
      .map(z => ({
        code: z.code,
        price: Number(z.price),
        fee: Number(z.fee || 0)
      }))

    const concertData = {
      name: form.name,
      venue: form.venue,
      ticketUrl: form.ticketUrl,
      status: form.status,
      image: form.image,
      showDates: cleanShowDates,
      pressDates: cleanPressDates,
      zones: cleanZones
    }

    if (editingId) {
      updateConcert(editingId, concertData)
    } else {
      addConcert(concertData)
    }

    resetForm()
  }

  return (
    <>
      <h2>{editingId ? "แก้ไขคอนเสิร์ต" : "จัดการคอนเสิร์ต"}</h2>
      <p style={{ color: "var(--muted)" }}>
        เพิ่มหรือแก้ไขรายละเอียดคอนเสิร์ต แล้วหน้าอีเวนต์จะดึงไปแสดง
      </p>

      <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={submit}>
        <div className="form">
          <input
            className="input"
            placeholder="ชื่อคอนเสิร์ต"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="สถานที่จัด"
            value={form.venue}
            onChange={e => setForm({ ...form, venue: e.target.value })}
          />

          <input
            className="input"
            placeholder="เว็บกดบัตร เช่น https://..."
            value={form.ticketUrl}
            onChange={e => setForm({ ...form, ticketUrl: e.target.value })}
          />

          <select
            className="input"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="open">เปิดรับ</option>
            <option value="soldout">Sold Out</option>
            <option value="cancelled">ยกเลิก</option>
          </select>

          <div>
            <h3>วันแสดง</h3>
            {showDates.map((d, i) => (
              <div className="filters" key={i}>
                <input
                  className="input"
                  type="date"
                  value={d.date}
                  onChange={e => updateShowDate(i, "date", e.target.value)}
                />
                <input
                  className="input"
                  type="time"
                  value={d.time || ""}
                  onChange={e => updateShowDate(i, "time", e.target.value)}
                />
                <button
                  className="btn danger"
                  type="button"
                  onClick={() => setShowDates(showDates.filter((_, idx) => idx !== i))}
                >
                  ลบ
                </button>
              </div>
            ))}

            <button
              className="btn"
              type="button"
              onClick={() => setShowDates([...showDates, { date: "", time: "" }])}
            >
              + เพิ่มวันแสดง
            </button>
          </div>

          <div>
            <h3>วันกดบัตร</h3>
            {pressDates.map((d, i) => (
              <div className="filters" key={i}>
                <input
                  className="input"
                  type="date"
                  value={d.date || ""}
                  onChange={e => updatePressDate(i, "date", e.target.value)}
                />
                <input
                  className="input"
                  type="time"
                  value={d.time || ""}
                  onChange={e => updatePressDate(i, "time", e.target.value)}
                />
                <button
                  className="btn danger"
                  type="button"
                  onClick={() => setPressDates(pressDates.filter((_, idx) => idx !== i))}
                >
                  ลบ
                </button>
              </div>
            ))}

            <button
              className="btn"
              type="button"
              onClick={() => setPressDates([...pressDates, { date: "", time: "" }])}
            >
              + เพิ่มวัน/เวลากด
            </button>
          </div>

          <div>
            <h3>โซนบัตร / ราคาบัตร / ค่ากด</h3>
            {zones.map((z, i) => (
              <div className="filters" key={i}>
                <input
                  className="input"
                  placeholder="โซน เช่น VIP"
                  value={z.code || ""}
                  onChange={e => updateZone(i, "code", e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="ราคาบัตร"
                  value={z.price || ""}
                  onChange={e => updateZone(i, "price", e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="ค่ากด"
                  value={z.fee || ""}
                  onChange={e => updateZone(i, "fee", e.target.value)}
                />
                <button
                  className="btn danger"
                  type="button"
                  onClick={() => setZones(zones.filter((_, idx) => idx !== i))}
                >
                  ลบ
                </button>
              </div>
            ))}

            <button
              className="btn"
              type="button"
              onClick={() => setZones([...zones, { code: "", price: "", fee: "" }])}
            >
              + เพิ่มโซน
            </button>
          </div>

          <div>
            <h3>รูปคอนเสิร์ต</h3>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

            {form.image && (
              <img
                src={form.image}
                alt="preview"
                style={{
                  width: 140,
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginTop: 12
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" type="submit">
              {editingId ? "บันทึกการแก้ไข" : "+ เพิ่มคอนเสิร์ต"}
            </button>

            {editingId && (
              <button className="btn" type="button" onClick={resetForm}>
                ยกเลิกแก้ไข
              </button>
            )}
          </div>
        </div>
      </form>

      {concerts.map(c => (
        <div className="order" key={c.id}>
          <div className="order-head">
            <div>
              <div className="order-name">{c.name}</div>
              <div className="order-sub">{c.venue || "-"}</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => startEdit(c)}>
                แก้ไข
              </button>

              <button className="btn danger" onClick={() => deleteConcert(c.id)}>
                ลบ
              </button>
            </div>
          </div>

          {c.image && (
            <img
              src={c.image}
              alt={c.name}
              style={{
                width: 100,
                height: 130,
                objectFit: "cover",
                borderRadius: 12,
                marginTop: 10
              }}
            />
          )}

          <div className="meta" style={{ marginTop: 10 }}>
            <div>เว็บกด: {c.ticketUrl || "-"}</div>
            <div>
              วันแสดง: {c.showDates?.map(d => `${d.date} ${d.time || ""}`).join(" / ") || "-"}
            </div>
            <div>
              วันกด: {c.pressDates?.map(d => `${d.date} ${d.time || ""}`).join(" / ") || "-"}
            </div>
            <div>
              โซน: {c.zones?.map(z => `${z.code} ${z.price} บาท ค่ากด ${z.fee} บาท`).join(" / ") || "-"}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
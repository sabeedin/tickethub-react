import { useState } from "react"
import OrderModal from "../components/OrderModal.jsx"
import useOrders from "../hooks/useOrders.js"
import useConcerts from "../hooks/useConcerts.js"

function formatDates(list = []) {
  if (!list.length) return "-"
  return list.map(d => `${d.date}${d.time ? " " + d.time : ""}`).join(" / ")
}

export default function Home() {
  const { addOrder } = useOrders()
  const { concerts } = useConcerts()

  const [open, setOpen] = useState(false)
  const [concert, setConcert] = useState(null)

  return (
    <>
      <h2>อีเวนต์เร็ว ๆ นี้</h2>
      <p style={{ color: "var(--muted)" }}>
        เลือกอีเวนต์เพื่อเพิ่มออเดอร์
      </p>

      {concerts.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          ยังไม่มีคอนเสิร์ต ไปเพิ่มที่หน้า “จัดการ” ก่อน
        </p>
      )}

      <div className="grid">
        {concerts.map(c => (
          <article className="card event-card" key={c.id}>
            <div
              className="event-poster"
              style={{
                backgroundImage: c.image
                  ? `linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.15)), url(${c.image})`
                  : undefined
              }}
            >
              <div className="event-status">
                {c.status === "open"
                  ? "เปิดรับ"
                  : c.status === "soldout"
                  ? "Sold Out"
                  : "ยกเลิก"}
              </div>

              <div className="event-info">
                <h3>{c.name}</h3>
                <p>{c.venue || "-"}</p>
                <p>📅 {formatDates(c.showDates)}</p>
              </div>
            </div>

            <div className="card-actions">
              <span className="pill">{c.zones?.length || 0} โซน</span>

              <button
                className="btn primary"
                disabled={c.status !== "open"}
                onClick={() => {
                  setConcert(c)
                  setOpen(true)
                }}
              >
                + เพิ่มออเดอร์
              </button>
            </div>
          </article>
        ))}
      </div>

      <OrderModal
        open={open}
        onClose={() => setOpen(false)}
        concert={concert}
        onSubmit={addOrder}
      />
    </>
  )
}
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
      <p style={{ color: "var(--muted)" }}>คลิกการ์ดเพื่อเพิ่มออเดอร์</p>

      {concerts.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          ยังไม่มีคอนเสิร์ต ไปเพิ่มที่หน้า “จัดการ” ก่อน
        </p>
      )}

      <div className="grid">
        {concerts.map(c => (
          <article className="card" key={c.id}>
            <div className="poster" style={{ overflow: "hidden" }}>
              {c.image && (
                <img
                  src={c.image}
                  alt={c.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.65
                  }}
                />
              )}

              <span className="tag" style={{ position: "relative", zIndex: 1 }}>
                {c.status === "open"
                  ? "เปิดรับ"
                  : c.status === "soldout"
                  ? "Sold Out"
                  : "ยกเลิก"}
              </span>
            </div>

            <div className="card-body">
              <h3>{c.name}</h3>

              <div className="meta">
                <div>📅 วันแสดง: {formatDates(c.showDates)}</div>
                <div>🖱 วันกด: {formatDates(c.pressDates)}</div>
                <div>📍 สถานที่: {c.venue || "-"}</div>
                <div>
                  💳 โซน:{" "}
                  {c.zones?.length
                    ? c.zones.map(z => `${z.code} ${z.price}`).join(" / ")
                    : "-"}
                </div>

                {c.ticketUrl && (
                  <div>
                    🔗 เว็บกด:{" "}
                    <a
                      href={c.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#c4b5fd" }}
                    >
                      เปิดลิงก์
                    </a>
                  </div>
                )}
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
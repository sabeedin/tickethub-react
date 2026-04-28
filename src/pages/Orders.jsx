import useOrders from "../hooks/useOrders.js"
import * as XLSX from "xlsx"

function safeSheetName(name, index) {
  const cleanName = String(name || "")
    .replace(/[:\\/?*\[\]]/g, " ")
    .trim()

  return (cleanName || `Sheet ${index + 1}`).slice(0, 31)
}

function exportExcel(orders) {
  const wb = XLSX.utils.book_new()

  const grouped = orders.reduce((acc, o) => {
    const name = o.concert || "ไม่ระบุงาน"
    if (!acc[name]) acc[name] = []
    acc[name].push(o)
    return acc
  }, {})

  Object.entries(grouped).forEach(([concertName, list], index) => {
    const rows = [
      ["ชื่อลูกค้า", "คอนเสิร์ต", "โซน", "จำนวน", "ยอดรวม", "สถานะ", "สถานะข้อมูล", "หมายเหตุลูกค้า"]
    ]

    list.forEach(o => {
      rows.push([
        o.name,
        o.concert,
        o.zoneCode,
        o.qty,
        o.total,
        o.status,
        o.infoStatus || "complete",
        o.customerNote || ""
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(concertName, index))
  })

  XLSX.writeFile(wb, "orders.xlsx")
}

const STATUS = {
  pending: "รอดำเนินการ",
  processing: "กำลังกด",
  success: "สำเร็จ",
  failed: "ไม่ได้"
}

const INFO_STATUS = {
  complete: "ข้อมูลครบ",
  waiting: "รอข้อมูล",
  confirm: "ต้องยืนยัน"
}

export default function Orders() {
  const {
    orders,
    updateStatus,
    updateInfoStatus,
    deleteOrder,
    setFilter,
    setInfoFilter,
    setSearch,
    summary
  } = useOrders()

  return (
    <>
      <div className="summary">
        <div className="stat">
          <span>ออเดอร์ทั้งหมด</span>
          <b>{summary.total}</b>
        </div>

        <div className="stat">
          <span>สำเร็จ</span>
          <b>{summary.success}</b>
        </div>

        <div className="stat">
          <span>รอดำเนินการ</span>
          <b>{summary.pending}</b>
        </div>

        <div className="stat">
          <span>รอข้อมูล</span>
          <b>{summary.waitingInfo}</b>
        </div>

        <div className="stat">
          <span>ยอดรวม</span>
          <b>{summary.revenue} บาท</b>
        </div>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="ค้นหาชื่อลูกค้า..."
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="input"
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="processing">กำลังกด</option>
          <option value="success">สำเร็จ</option>
          <option value="failed">ไม่ได้</option>
        </select>

        <select
          className="input"
          onChange={e => setInfoFilter(e.target.value)}
        >
          <option value="">ทุกสถานะข้อมูล</option>
          <option value="complete">ข้อมูลครบ</option>
          <option value="waiting">รอข้อมูล</option>
          <option value="confirm">ต้องยืนยัน</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button
          className="btn primary"
          onClick={() => exportExcel(orders)}
        >
          📥 Export Excel
        </button>
      </div>      {orders.length === 0 && (
        <p style={{ color: "var(--muted)" }}>ยังไม่มีออเดอร์</p>
      )}

      {orders.map(o => (
        <div className="order" key={o.id}>
          <div className="order-head">
            <div>
              <div className="order-name">{o.name}</div>
              <div className="order-sub">
                {o.concert} • {o.venue || "-"} • โซน {o.zoneCode}
              </div>
            </div>

            <div className="badges">
              <span className={`badge info-${o.infoStatus || "complete"}`}>
                {INFO_STATUS[o.infoStatus || "complete"]}
              </span>
              <span className={`badge ${o.status}`}>
                {STATUS[o.status]}
              </span>
            </div>
          </div>

          <div className="meta" style={{ marginTop: 10 }}>
            <div>จำนวน: {o.qty} ใบ</div>
            <div>ยอดรวม: {o.total} บาท</div>
            {o.showDate && <div>วันแสดง: {o.showDate}</div>}
            {o.pressDate && <div>วันกด: {o.pressDate}</div>}
            {o.contact && <div>ติดต่อ: {o.contact}</div>}
          </div>

          {o.customerNote && (
            <div className="note">
              <b>หมายเหตุลูกค้า:</b> {o.customerNote}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <select
              className="input"
              value={o.status}
              onChange={e => updateStatus(o.id, e.target.value)}
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="processing">กำลังกด</option>
              <option value="success">สำเร็จ</option>
              <option value="failed">ไม่ได้</option>
            </select>

            <select
              className="input"
              value={o.infoStatus || "complete"}
              onChange={e => updateInfoStatus(o.id, e.target.value)}
            >
              <option value="complete">ข้อมูลครบ</option>
              <option value="waiting">รอข้อมูล</option>
              <option value="confirm">ต้องยืนยัน</option>
            </select>

            <button
              className="btn danger"
              onClick={() => deleteOrder(o.id)}
            >
              ลบ
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

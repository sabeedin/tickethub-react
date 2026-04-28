import useOrders from "../hooks/useOrders.js"
import { supabase } from "../lib/supabase.js"
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
      ["คิว", "ชื่อลูกค้า", "คอนเสิร์ต", "โซน", "ความยากโซน", "ผู้กด", "จำนวน", "ยอดรวม", "สถานะ", "สถานะข้อมูล", "หมายเหตุลูกค้า"]
    ]

    list.forEach(o => {
      rows.push([
        o.queueNumber || "",
        o.name,
        o.concert,
        o.zoneCode,
        o.zoneDifficulty || "",
        o.assignee || "",
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

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function exportBackup() {
  const [ordersResult, concertsResult] = await Promise.all([
    supabase.from("orders").select("*").order("id", { ascending: false }),
    supabase.from("concerts").select("*").order("id", { ascending: false })
  ])

  if (ordersResult.error || concertsResult.error) {
    alert(ordersResult.error?.message || concertsResult.error?.message)
    return
  }

  const date = new Date().toISOString().slice(0, 10)

  downloadJson(`tickethub-backup-${date}.json`, {
    app: "TicketHub React",
    exportedAt: new Date().toISOString(),
    version: 1,
    tables: {
      orders: ordersResult.data || [],
      concerts: concertsResult.data || []
    }
  })
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

const DIFFICULTY = {
  easy: "ง่าย",
  normal: "ปานกลาง",
  hard: "ยาก",
  "very-hard": "ยากมาก"
}

export default function Orders() {
  const {
    orders,
    updateStatus,
    updateInfoStatus,
    updateOrder,
    deleteOrder,
    setFilter,
    setInfoFilter,
    setDifficultyFilter,
    setAssigneeFilter,
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
          <span>ยังไม่แบ่งผู้กด</span>
          <b>{summary.unassigned}</b>
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

        <select
          className="input"
          onChange={e => setDifficultyFilter(e.target.value)}
        >
          <option value="">ทุกความยาก</option>
          <option value="easy">ง่าย</option>
          <option value="normal">ปานกลาง</option>
          <option value="hard">ยาก</option>
          <option value="very-hard">ยากมาก</option>
        </select>

        <input
          className="input"
          placeholder="ค้นหาผู้กด..."
          onChange={e => setAssigneeFilter(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          className="btn primary"
          onClick={() => exportExcel(orders)}
        >
          📥 Export Excel
        </button>
        <button
          className="btn"
          onClick={exportBackup}
        >
          💾 Export Backup
        </button>
      </div>      {orders.length === 0 && (
        <p style={{ color: "var(--muted)" }}>ยังไม่มีออเดอร์</p>
      )}

      {orders.map(o => (
        <div className="order" key={o.id}>
          <div className="order-head">
            <div>
              <div className="order-name">
                {o.queueNumber ? `#คิว ${o.queueNumber} · ` : ""}
                {o.name}
              </div>
              <div className="order-sub">
                {o.concert} • {o.venue || "-"} • โซน {o.zoneCode}
              </div>
            </div>

            <div className="badges">
              {o.zoneDifficulty && (
                <span className={`badge difficulty-${o.zoneDifficulty}`}>
                  {DIFFICULTY[o.zoneDifficulty]}
                </span>
              )}
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
            <div>ผู้กด: {o.assignee || "ยังไม่ระบุ"}</div>
          </div>

          {o.customerNote && (
            <div className="note">
              <b>หมายเหตุลูกค้า:</b> {o.customerNote}
            </div>
          )}

          <div className="order-controls">
            <input
              className="input small-input"
              placeholder="คิว"
              defaultValue={o.queueNumber || ""}
              onBlur={e => updateOrder(o.id, { queueNumber: e.target.value.trim() })}
            />

            <input
              className="input assignee-input"
              placeholder="ผู้กด"
              defaultValue={o.assignee || ""}
              onBlur={e => updateOrder(o.id, { assignee: e.target.value.trim() })}
            />

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
              value={o.zoneDifficulty || ""}
              onChange={e => updateOrder(o.id, { zoneDifficulty: e.target.value })}
            >
              <option value="">ไม่ระบุความยาก</option>
              <option value="easy">ง่าย</option>
              <option value="normal">ปานกลาง</option>
              <option value="hard">ยาก</option>
              <option value="very-hard">ยากมาก</option>
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

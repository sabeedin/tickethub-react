import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function useOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState("")
  const [infoFilter, setInfoFilter] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setOrders((data || []).map(r => ({
      id: r.id,
      queueNumber: "",
      assignee: "",
      zoneDifficulty: "",
      infoStatus: "complete",
      customerNote: "",
      ...r.data
    })))
  }

  async function addOrder(order) {
    const newOrder = {
      id: Date.now(),
      queueNumber: "",
      assignee: "",
      zoneDifficulty: "",
      infoStatus: "complete",
      customerNote: "",
      ...order,
      status: "pending",
      createdAt: new Date().toLocaleDateString("th-TH")
    }

    const { error } = await supabase
      .from("orders")
      .upsert({ id: newOrder.id, data: newOrder })

    if (error) {
      alert(error.message)
      console.error(error)
      return false
    }

    setOrders(prev => [newOrder, ...prev])
    return true
  }

  async function updateOrder(id, patch) {
    const updated = orders.map(o =>
      o.id === id ? { ...o, ...patch } : o
    )

    setOrders(updated)

    const order = updated.find(o => o.id === id)

    const { error } = await supabase
      .from("orders")
      .upsert({ id, data: order })

    if (error) {
      alert(error.message)
      console.error(error)
    }
  }

  async function updateStatus(id, status) {
    return updateOrder(id, { status })
  }

  async function updateInfoStatus(id, infoStatus) {
    return updateOrder(id, { infoStatus })
  }

  async function deleteOrder(id) {
    if (!confirm("ลบออเดอร์นี้ใช่ไหม?")) return

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      console.error(error)
      return
    }

    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const filtered = orders.filter(o => {
    if (filter && o.status !== filter) return false
    if (infoFilter && (o.infoStatus || "complete") !== infoFilter) return false
    if (difficultyFilter && (o.zoneDifficulty || "") !== difficultyFilter) return false
    if (assigneeFilter && !o.assignee?.toLowerCase().includes(assigneeFilter.toLowerCase())) return false
    if (search && !o.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (a.concertId === b.concertId) {
      const queueA = Number(a.queueNumber)
      const queueB = Number(b.queueNumber)
      const hasQueueA = Number.isFinite(queueA) && queueA > 0
      const hasQueueB = Number.isFinite(queueB) && queueB > 0

      if (hasQueueA && hasQueueB && queueA !== queueB) return queueA - queueB
      if (hasQueueA !== hasQueueB) return hasQueueA ? -1 : 1
    }

    return Number(b.id) - Number(a.id)
  })

const summary = {
  total: orders.length,
  success: orders.filter(o => o.status === "success").length,
  pending: orders.filter(o => o.status === "pending").length,
  waitingInfo: orders.filter(o => o.infoStatus === "waiting").length,
  unassigned: orders.filter(o => !o.assignee?.trim()).length,
  failed: orders.filter(o => o.status === "failed").length,
  revenue: orders
    .filter(o => o.status === "success")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
}

  return {
    orders: filtered,
    addOrder,
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
  }
}

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function useOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState("")
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

    setOrders((data || []).map(r => ({ id: r.id, ...r.data })))
  }

  async function addOrder(order) {
    const newOrder = {
      id: Date.now(),
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

  async function updateStatus(id, status) {
    const updated = orders.map(o =>
      o.id === id ? { ...o, status } : o
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
    if (search && !o.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const summary = {
    total: orders.length,
    success: orders.filter(o => o.status === "success").length,
    pending: orders.filter(o => o.status === "pending").length,
    failed: orders.filter(o => o.status === "failed").length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  }

  return {
    orders: filtered,
    addOrder,
    updateStatus,
    deleteOrder,
    setFilter,
    setSearch,
    summary
  }
}
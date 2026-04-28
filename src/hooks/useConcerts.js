import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function useConcerts() {
  const [concerts, setConcerts] = useState([])

  useEffect(() => {
    loadConcerts()
  }, [])

  async function loadConcerts() {
    const { data, error } = await supabase
      .from("concerts")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setConcerts(
      (data || []).map(c => ({
        id: c.id,
        ...c.data
      }))
    )
  }

  async function addConcert(concert) {
    const newConcert = {
      id: Date.now(),
      ...concert
    }

    const { error } = await supabase
      .from("concerts")
      .upsert({ id: newConcert.id, data: newConcert })

    if (error) {
      alert(error.message)
      return
    }

    setConcerts(prev => [newConcert, ...prev])
  }

  async function updateConcert(id, concert) {
    const updatedConcert = {
      id,
      ...concert
    }

    const { error } = await supabase
      .from("concerts")
      .upsert({ id, data: updatedConcert })

    if (error) {
      alert(error.message)
      return
    }

    setConcerts(prev =>
      prev.map(c => (c.id === id ? updatedConcert : c))
    )
  }

  async function deleteConcert(id) {
    if (!confirm("ลบคอนเสิร์ตนี้ใช่ไหม?")) return

    const { error } = await supabase
      .from("concerts")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    setConcerts(prev => prev.filter(c => c.id !== id))
  }

  return {
    concerts,
    addConcert,
    updateConcert,
    deleteConcert
  }
}
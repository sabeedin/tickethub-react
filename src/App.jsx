import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase.js"
import Home from "./pages/Home.jsx"
import Orders from "./pages/Orders.jsx"
import Manage from "./pages/Manage.jsx"
import Login from "./pages/Login.jsx"

export default function App() {
  const [tab, setTab] = useState("home")
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  async function checkSession() {
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return <div className="app">กำลังโหลด...</div>
  }

  if (!session) {
    return <Login />
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="logo"></div>
            <div>
              <h1>TicketHub React</h1>
              <p>ระบบจัดการออเดอร์บัตรคอนเสิร์ต</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              {session.user.email}
            </span>

            <button className="btn danger" onClick={logout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="app">
        <div className="tabs">
          <button
            className={`tab ${tab === "home" ? "active" : ""}`}
            onClick={() => setTab("home")}
          >
            🎪 อีเวนต์
          </button>

          <button
            className={`tab ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            📋 ออเดอร์
          </button>

          <button
            className={`tab ${tab === "manage" ? "active" : ""}`}
            onClick={() => setTab("manage")}
          >
            ⚙️ จัดการ
          </button>
        </div>

        {tab === "home" && <Home />}
        {tab === "orders" && <Orders />}
        {tab === "manage" && <Manage />}
      </main>
    </>
  )
}
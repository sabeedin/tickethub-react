import { useState } from "react"
import Home from "./pages/Home.jsx"
import Orders from "./pages/Orders.jsx"
import Manage from "./pages/Manage.jsx"

export default function App() {
  const [tab, setTab] = useState("home")

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
        </div>
      </header>

      <main className="app">
        <div className="tabs">
          <button className={`tab ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>
            🎪 อีเวนต์
          </button>

          <button className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
            📋 ออเดอร์
          </button>

          <button className={`tab ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>
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
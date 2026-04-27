import { useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function Login() {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (result.error) {
      alert(result.error.message)
      return
    }

    if (mode === "signup") {
      alert("สมัครสำเร็จ ถ้าระบบให้ยืนยันอีเมล ให้ไปกดยืนยันในอีเมลก่อน")
    }
  }

  return (
    <div className="authScreen">
      <form className="authBox" onSubmit={submit}>
        <div className="brand" style={{ marginBottom: 20 }}>
          <div className="logo"></div>
          <div>
            <h1>TicketHub React</h1>
            <p>เข้าสู่ระบบเพื่อจัดการออเดอร์</p>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            เข้าสู่ระบบ
          </button>

          <button
            type="button"
            className={`tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            สมัครสมาชิก
          </button>
        </div>

        <div className="form">
          <input
            className="input"
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="btn primary" disabled={loading}>
            {loading
              ? "กำลังโหลด..."
              : mode === "login"
              ? "เข้าสู่ระบบ"
              : "สมัครสมาชิก"}
          </button>
        </div>
      </form>
    </div>
  )
}
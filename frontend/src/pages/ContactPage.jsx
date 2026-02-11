import { useState } from 'react'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'

export function ContactPage() {
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  function submit() {
    if (!name.trim() || !email.trim() || !msg.trim()) {
      toast.push('Please fill name, email, and message', { type: 'error' })
      return
    }
    toast.push('Message sent successfully', { type: 'success' })
    setName('')
    setEmail('')
    setMsg('')
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">Contact</div>
        <div className="mt-2 text-slate-600">Support is available 24/7. We’ll respond as soon as possible.</div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500">Email</div>
            <div className="mt-1 font-semibold text-slate-900">Dito@gmail.com</div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500">Phone</div>
            <div className="mt-1 font-semibold text-slate-900">8 708 774 91 52</div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500">Address</div>
            <div className="mt-1 font-semibold text-slate-900">Turan 55, Astana</div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white border border-slate-200 p-6">
          <div className="font-extrabold text-slate-900">Send a message</div>
          <div className="mt-4 grid gap-3 max-w-xl">
            <input
              className="px-4 py-3 rounded-2xl border border-slate-200"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="px-4 py-3 rounded-2xl border border-slate-200"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              className="px-4 py-3 rounded-2xl border border-slate-200 min-h-[140px]"
              placeholder="Message"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <button
              type="button"
              onClick={submit}
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Send
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { type BrandPlan, formatINR } from '@/lib/mock-data'
import { MessageCircle, X, Send, ChevronDown, ThumbsUp, ThumbsDown, User, Bot, Phone } from 'lucide-react'

const BANK = {
  name:    'BitSpeed Technologies Pvt Ltd',
  account: '9876543210001234',
  ifsc:    'HDFC0001234',
  upi:     'bitespeed@hdfcbank',
}

type MessageRole = 'bot' | 'user' | 'system'
interface Message {
  id:      string
  role:    MessageRole
  text:    string
  time:    string
  showFeedback?: boolean
  feedbackDone?: boolean
  showConnect?:  boolean
}

function makeId() { return Math.random().toString(36).slice(2) }
function now()    { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }

function buildFAQs(plan: BrandPlan | null, brand: string) {
  return [
    {
      question: 'When is my next billing date?',
      answer:   plan
        ? `Your current billing cycle runs from **${plan.billingStart}** to **${plan.billingEnd}**. Your next billing date is **${plan.nextBillingDate}**.`
        : 'Please check the Plan Details page in the sidebar for your next billing date.',
    },
    {
      question: 'How do I pay my invoice?',
      answer:   `Transfer payment to:\n• **Bank:** HDFC Bank\n• **Account:** ${BANK.account}\n• **IFSC:** ${BANK.ifsc}\n• **UPI:** ${BANK.upi}\n\nAlways mention your **invoice number** in the payment remarks so we can match it instantly.`,
    },
    {
      question: 'How to request a due date extension?',
      answer:   'Go to **Invoices** or **Billing Info** in the sidebar. Click the calendar icon on any pending or overdue invoice, enter your new requested date, and provide a reason. Our finance team reviews requests within **1 business day**.',
    },
    {
      question: plan?.model === 'prepaid' ? 'How does my wallet work?' : 'What is my credit cycle?',
      answer:   plan?.model === 'prepaid'
        ? `You're on the **Prepaid (wallet-based)** model. Your current wallet balance is **${formatINR(plan.walletBalance)}**. Services are deducted from your wallet balance. Top up anytime from the Overview page.`
        : plan?.model === 'postpaid'
        ? `You're on **Postpaid** with a **${plan.creditCycleDays}-day credit cycle**. Invoices are due ${plan.creditCycleDays} days from the issue date. Your platform fee is **${formatINR(plan.platformFee ?? 0)}/month**.`
        : `You're on the **Shopify Billing** model. Charges are automatically billed through your Shopify account. Contact us if you see any discrepancy.`,
    },
    {
      question: 'How do I download my invoices or ledger?',
      answer:   'Go to **Payments** in the sidebar and click **Download Ledger** to get a full CSV of all transactions. For individual invoices, go to **Invoices** and click the download icon on any row. You can also download from the **Billing Info** page.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:   'We accept the following payment methods:\n• **Bank Transfer** (NEFT / RTGS)\n• **UPI**\n• **Credit Card**\n• **Cheque**\n\nAll payments must reference your invoice number.',
    },
    {
      question: 'Why is my account at risk or suspended?',
      answer:   'Accounts are marked **At Risk** when a payment is past its due date. Accounts are **Suspended** when the overdue balance remains unpaid beyond the grace period. Clear the outstanding invoice immediately to restore access — or request a due date extension from the Invoices page.',
    },
    {
      question: 'How long does reconciliation take?',
      answer:   'Once your payment is received in our account, reconciliation typically happens within **1–2 business days**. Your invoice status will update to **Paid** once matched. If your payment shows in your bank but the invoice is still unpaid after 2 days, contact our finance team.',
    },
  ]
}

function formatText(text: string) {
  // Bold **text** and newlines
  const parts = text.split('\n')
  return parts.map((line, i) => {
    const segments = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {segments.map((seg, j) => j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg)}
        {i < parts.length - 1 && <br />}
      </span>
    )
  })
}

export default function ChatWidget({ plan, brand }: { plan: BrandPlan | null; brand: string }) {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [typing,   setTyping]   = useState(false)
  const [agentReq, setAgentReq] = useState(false)
  const [unread,   setUnread]   = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const faqs      = buildFAQs(plan, brand)

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id:   makeId(),
        role: 'bot',
        text: `Hi! 👋 I'm the BitSpeed Finance assistant. How can I help you today?\n\nPick a question below or type your own.`,
        time: now(),
      }])
    }
    if (open) setUnread(0)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function addBotMessage(text: string, extras?: Partial<Message>) {
    setMessages(prev => [...prev, { id: makeId(), role: 'bot', text, time: now(), ...extras }])
  }

  function handleFAQ(q: string, a: string) {
    // Add user message
    setMessages(prev => [...prev, { id: makeId(), role: 'user', text: q, time: now() }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addBotMessage(a, { showFeedback: true })
    }, 900)
  }

  function handleFeedback(msgId: string, helpful: boolean) {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedbackDone: true, showConnect: !helpful } : m))
    if (helpful) {
      setTimeout(() => addBotMessage('Glad I could help! Is there anything else you\'d like to know?'), 400)
    }
  }

  function handleConnectAgent(msgId: string) {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showConnect: false } : m))
    setAgentReq(true)
    setMessages(prev => [...prev, {
      id: makeId(), role: 'system',
      text: `✅ Our finance team has been notified. Someone will reach out to **${brand}** within **24 hours** during business hours (Mon–Fri, 10 AM – 6 PM IST).`,
      time: now(),
    }])
  }

  function handleSend() {
    const q = input.trim()
    if (!q) return
    setInput('')
    setMessages(prev => [...prev, { id: makeId(), role: 'user', text: q, time: now() }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      // Simple keyword matching
      const lower = q.toLowerCase()
      const matched = faqs.find(f =>
        f.question.toLowerCase().split(' ').filter(w => w.length > 3).some(w => lower.includes(w))
      )
      if (matched) {
        addBotMessage(matched.answer, { showFeedback: true })
      } else {
        addBotMessage(
          `I'm not sure I have a specific answer for that. Here are some things I can help with — or you can connect with our finance team directly.`,
          { showConnect: true }
        )
      }
    }, 1000)
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!open && (
          <div
            className="px-3.5 py-2 rounded-full text-xs font-semibold shadow-lg"
            style={{ background: '#fff', color: '#0D1B3E', border: '1px solid #D6D3D1' }}
          >
            Need help? Chat with us
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all"
          style={{ background: '#0D1B3E', color: '#fff', position: 'relative' }}
        >
          {open ? <ChevronDown size={22} /> : <MessageCircle size={22} />}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#DC2626', color: '#fff' }}>
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 380, height: 540, background: '#fff', border: '1px solid #D6D3D1' }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 flex items-center justify-between shrink-0" style={{ background: '#0D1B3E' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Bot size={16} style={{ color: '#fff' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">BitSpeed Finance Support</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Online · Usually replies instantly</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: '#F9F9F9' }}>
            {messages.map(msg => (
              <div key={msg.id}>
                {/* Message bubble */}
                <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role !== 'user' && (
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mb-1"
                      style={{ background: msg.role === 'system' ? '#F0FDF4' : '#0D1B3E' }}>
                      {msg.role === 'system' ? <Bot size={12} style={{ color: '#16A34A' }} /> : <Bot size={12} style={{ color: '#fff' }} />}
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mb-1"
                      style={{ background: '#E5E7EB' }}>
                      <User size={12} style={{ color: '#6B7280' }} />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                    style={{
                      background:   msg.role === 'user' ? '#0D1B3E' : msg.role === 'system' ? '#F0FDF4' : '#fff',
                      color:        msg.role === 'user' ? '#fff'    : msg.role === 'system' ? '#166534' : '#1a1a1a',
                      border:       msg.role === 'user' ? 'none'    : '1px solid #E5E7EB',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}
                  >
                    {formatText(msg.text)}
                    <p className="mt-1 text-right" style={{ fontSize: '10px', color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>{msg.time}</p>
                  </div>
                </div>

                {/* Feedback */}
                {msg.showFeedback && !msg.feedbackDone && (
                  <div className="ml-8 mt-2 flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>Was this helpful?</span>
                    <button onClick={() => handleFeedback(msg.id, true)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:bg-green-50"
                      style={{ color: '#16A34A', border: '1px solid #BBF7D0' }}>
                      <ThumbsUp size={11} /> Yes
                    </button>
                    <button onClick={() => handleFeedback(msg.id, false)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:bg-red-50"
                      style={{ color: '#DC2626', border: '1px solid #FECACA' }}>
                      <ThumbsDown size={11} /> No
                    </button>
                  </div>
                )}
                {msg.feedbackDone && !msg.showConnect && (
                  <div className="ml-8 mt-1">
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>Thanks for your feedback</span>
                  </div>
                )}

                {/* Connect with agent */}
                {msg.showConnect && (
                  <div className="ml-8 mt-2">
                    <button
                      onClick={() => handleConnectAgent(msg.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: '#0D1B3E', color: '#fff' }}
                    >
                      <Phone size={11} /> Connect with Finance Team
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: '#0D1B3E' }}>
                  <Bot size={12} style={{ color: '#fff' }} />
                </div>
                <div className="px-4 py-3 rounded-2xl" style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '18px 18px 18px 4px' }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#9CA3AF', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions (shown when no messages from user yet) */}
          {messages.length <= 1 && !typing && (
            <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: '#E5E7EB', background: '#fff' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Common questions</p>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {faqs.map(faq => (
                  <button
                    key={faq.question}
                    onClick={() => handleFAQ(faq.question, faq.answer)}
                    className="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all hover:bg-zinc-50"
                    style={{ background: '#F5F4F3', color: '#1a1a1a', border: '1px solid #E5E7EB' }}
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t shrink-0 flex gap-2 items-center" style={{ borderColor: '#E5E7EB', background: '#fff' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a question…"
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#F5F4F3', border: '1px solid #E5E7EB', color: '#1a1a1a' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0"
              style={{ background: input.trim() ? '#0D1B3E' : '#E5E7EB', color: input.trim() ? '#fff' : '#9CA3AF' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}

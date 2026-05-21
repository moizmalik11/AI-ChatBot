import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const scrollRef = useRef(null)

  const [avatar, setAvatar] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    // scroll to bottom on messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isTyping])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chat_avatar')
      if (stored) setAvatar(stored)
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (chatActive && textareaRef.current) textareaRef.current.focus()
  }, [chatActive])

  function append(sender, text) {
    setMessages(m => [...m, { sender, text }])
  }

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed) return
    append('user', trimmed)
    // mark chat as active (switch from hero to full-screen chat)
    setChatActive(true)
    setInput('')
    setIsSending(true)
    setIsTyping(true)

    // show typing indicator until resolved
    try {
      const options = {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': 'Your Key',
          'X-RapidAPI-Host': 'chatgpt53.p.rapidapi.com'
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: trimmed }] })
      }
      const res = await fetch('https://chatgpt53.p.rapidapi.com/', options)
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content || 'No response.'
      setIsTyping(false)
      append('bot', text)
    } catch (e) {
      setIsTyping(false)
      append('bot', 'Error: check API key or network')
    } finally {
      setIsSending(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Sidebar handlers and avatar upload
  function handleNewChat() {
    setMessages([])
    setChatActive(false)
    setInput('')
    setShowSearch(false)
  }

  function handleSearch() {
    setShowSearch(s => !s)
    setShowSettings(false)
  }

  function handleCompose() {
    setChatActive(true)
    setTimeout(() => textareaRef.current?.focus(), 60)
  }

  function handleGrid() {
    setShowModelSelector(s => !s)
  }

  function handleSettings() {
    setShowSettings(s => !s)
    setShowSearch(false)
  }

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result
      setAvatar(data)
      try { localStorage.setItem('chat_avatar', data) } catch (e) {}
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={`hero-app ${chatActive ? 'chat-active' : ''}`}>
      <Head>
        <title>Ask — Gemini-like UI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <aside className="side-nav">
        <button className="nav-btn" onClick={handleNewChat} title="New chat"><i className="fa-solid fa-plus"></i></button>
        <button className="nav-btn" onClick={handleCompose} title="Compose"><i className="fa-solid fa-pen"></i></button>
        <button className="nav-btn" onClick={handleSearch} title="Search"><i className="fa-solid fa-magnifying-glass"></i></button>
        <button className="nav-btn" onClick={handleGrid} title="Models"><i className="fa-solid fa-grid-2"></i></button>
        <div className="side-spacer" />
        <button className="nav-btn" onClick={handleSettings} title="Settings"><i className="fa-solid fa-gear"></i></button>
        <img className="avatar" src={avatar || '/avatar.png'} alt="avatar" onClick={handleAvatarClick} />
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
      </aside>
      {/* If no messages yet, show hero; otherwise show chat view */}
      {messages.length === 0 && !isTyping ? (
        <main className="hero">
          <h1 className="hero-title">Where should we start?</h1>

          <div className="search-pill">
            <button className="pill-left"><i className="fa-solid fa-plus"></i></button>
            <input className="pill-input" placeholder="Ask Gemini" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
            <div className="pill-right">
              <div className="model-select" onClick={() => setShowModelSelector(s => !s)}>Flash <i className="fa-solid fa-chevron-down"/></div>
              <button className="mic-btn"><i className="fa-solid fa-microphone"/></button>
            </div>
          </div>
          {showModelSelector && (
            <div className="model-pop">Model: Flash (demo)</div>
          )}
        </main>
      ) : (
        <main className="chat-shell">
          <div className="header">
            <div className="brand">
              <i className="fa-solid fa-robot"></i>
              <h3>Chat</h3>
            </div>
            <div className="actions">
              <button className="icon-btn" id="theme-toggle" title="Toggle theme"> <i className="fa-solid fa-sun"></i> </button>
            </div>
          </div>

          <div className="chat-card">
            <div className="chat-container" id="scroll-region" ref={scrollRef}>
              <div id="chat-log">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-box row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                    <div className="icon" id={m.sender === 'user' ? 'user-icon' : 'bot-icon'}>
                      <i className={m.sender === 'user' ? 'fa-solid fa-user' : 'fa-solid fa-robot'}></i>
                    </div>
                    <div className={`bubble ${m.sender}`}>{m.text}</div>
                  </div>
                ))}

                {isTyping && (
                  <div className="chat-box row bot-row">
                    <div className="icon" id="bot-icon"><i className="fa-solid fa-robot"></i></div>
                    <div className="bubble typing-bubble"><span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="input-area">
              <div className="composer">
                <textarea ref={textareaRef} id="user-input" placeholder="Send a message. Press Enter to send, Shift+Enter for newline" rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button id="send-button" aria-label="Send" onClick={sendMessage} disabled={isSending} className={isSending? 'btn-sending':''}>
                  <i className={`fa-solid fa-paper-plane`} id="button-icon"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    // scroll to bottom on messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isTyping])

  function append(sender, text) {
    setMessages(m => [...m, { sender, text }])
  }

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed) return
    append('user', trimmed)
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

  return (
    <div className="container" id="app">
      <Head>
        <title>ChatGPT Bot | ByMoiz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="header">
        <div className="brand">
          <i className="fa-solid fa-robot"></i>
          <h3>ChatGPT Bot</h3>
        </div>
        <div className="actions">
          <button className="icon-btn" id="theme-toggle" title="Toggle theme"> <i className="fa-solid fa-sun"></i> </button>
        </div>
      </div>

      <div className="chat-card">
        <div className="info"> <a href="#">Welcome, greetings from developer Moiz!</a> </div>

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
            <textarea id="user-input" placeholder="Send a message. Press Enter to send, Shift+Enter for newline" rows={1}
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
    </div>
  )
}

// src/ui.ts
export function handleUI(): Response {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>cf_ai_edge_chat_memory</title>
      <style>
        body{font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif;margin:0;padding:1rem;max-width:800px}
        #log{border:1px solid #ddd;border-radius:12px;padding:1rem;height:55vh;overflow:auto;white-space:pre-wrap}
        .msg{margin:.5rem 0;padding:.5rem .75rem;border-radius:10px}
        .user{background:#eef}
        .assistant{background:#efe}
        .row{display:flex;gap:.5rem;margin-top:.75rem}
        input,button,textarea{font-size:1rem}
        textarea{flex:1;min-height:3rem}
      </style>
    </head>
    <body>
      <h1>Cloudflare AI Chat (Workers AI + Durable Objects)</h1>
      <div id="log" aria-live="polite"></div>
      <div class="row">
        <textarea id="input" placeholder="Say hi…"></textarea>
        <button id="send">Send</button>
      </div>
      <script>
        const log = document.getElementById('log');
        const input = document.getElementById('input');
        const btn = document.getElementById('send');
        let sessionId = localStorage.getItem('cf_session') || crypto.randomUUID();
        localStorage.setItem('cf_session', sessionId);

        function add(role, text){
          const div = document.createElement('div');
          div.className = 'msg ' + role;
          div.textContent = (role === 'user' ? 'You: ' : 'Assistant: ') + text;
          log.appendChild(div); log.scrollTop = log.scrollHeight;
        }

        async function send(){
          const message = input.value.trim();
          if(!message) return;
          add('user', message);
          input.value='';
          const res = await fetch('/api/chat', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({message, sessionId})
          });
          const data = await res.json();
          add('assistant', data.reply);
        }

        btn.addEventListener('click', send);
        input.addEventListener('keydown', (e)=>{
          if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); }
        });
      </script>
    </body>
  </html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
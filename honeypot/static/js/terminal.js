// ── Terminal Engine ────────────────────────────────────────────────
const PROMPT_HTML = '<span class="out-prompt"><span class="pu">admin</span><span class="ph">@fileserver</span><span class="ps">:~$</span></span> ';

const FS = {
  '~': ['ConfidentialApp.exe', '.bash_history', '.bashrc', '.profile', 'readme.txt']
};

let cwd = '~';
let history = [];
let histIdx = -1;

const COMMAND_RESPONSES = {
  ls: () => {
    const files = FS[cwd] || [];
    return files.map(f => {
      if (f.endsWith('.exe'))  return `<span class="out-exe">${f}</span>`;
      if (f.startsWith('.'))  return `<span class="out-dim">${f}</span>`;
      return `<span class="out-result">${f}</span>`;
    }).join('  ');
  },
  pwd: () => `<span class="out-result">/home/admin</span>`,
  whoami: () => `<span class="out-result">admin</span>`,
  id: () => `<span class="out-result">uid=1000(admin) gid=1000(admin) groups=1000(admin),27(sudo),4(adm)</span>`,
  uname: (args) => {
    if (args.includes('-a')) return `<span class="out-result">Linux fileserver 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux</span>`;
    return `<span class="out-result">Linux</span>`;
  },
  date: () => `<span class="out-result">${new Date().toString()}</span>`,
  uptime: () => `<span class="out-result"> 14:32:09 up 47 days, 6:18, 1 user,  load average: 0.12, 0.08, 0.05</span>`,
  cat: (args) => {
    const file = args[0];
    if (!file) return `<span class="out-err">cat: missing operand</span>`;
    if (file === 'readme.txt') return `<span class="out-result">Corporate File Server v2.4.1\nFor support contact: it-support@corp.internal\nDo NOT share credentials.</span>`;
    if (file === '.bash_history') return `<span class="out-dim">ls\ncat readme.txt\nsudo su\nConfidentialApp.exe</span>`;
    if (file === '.bashrc') return `<span class="out-dim"># ~/.bashrc: executed by bash(1) for non-login shells.\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -alF'</span>`;
    return `<span class="out-err">cat: ${file}: No such file or directory</span>`;
  },
  echo: (args) => `<span class="out-result">${args.join(' ')}</span>`,
  clear: () => '__CLEAR__',
  help: () => `<span class="out-result">Available commands:</span>
<span class="out-dim">  ls          - list directory contents
  cat [file]  - display file contents
  pwd         - print working directory
  whoami      - display current user
  id          - display user identity
  uname [-a]  - system information
  date        - current date and time
  uptime      - system uptime
  echo [text] - print text
  clear       - clear terminal
  help        - show this help</span>`,
  sudo: () => `<span class="out-err">[sudo] password for admin: \nSorry, try again.\nSorry, try again.\nsudo: 3 incorrect password attempts</span>`,
  ping: (args) => {
    if (!args[0]) return `<span class="out-err">ping: missing host operand</span>`;
    return `<span class="out-result">PING ${args[0]} (192.168.1.1): 56 data bytes\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1</span>`;
  },
  history: () => history.map((c,i)=> `<span class="out-dim">${String(i+1).padStart(4,'  ')}  ${c}</span>`).join('\n') || '<span class="out-dim">  (empty)</span>',
};

function getOutput(el) {
  return document.getElementById(el || 'output');
}

function appendLine(html) {
  const out = getOutput();
  out.innerHTML += '\n' + html;
  out.scrollIntoView({ block: 'end' });
  window.scrollTo(0, document.body.scrollHeight);
}

function showRansomware() {
  document.getElementById('ransomOverlay').classList.add('show');
}

function closeRansom() {
  document.getElementById('ransomOverlay').classList.remove('show');
}

function handleExe(name) {
  appendLine(`${PROMPT_HTML}<span class="out-cmd">./${name}</span>`);
  appendLine(`<span class="out-result">Executing ${name}...</span>`);
  setTimeout(() => {
    appendLine(`<span class="out-err">[!] Installing package dependencies...</span>`);
    setTimeout(() => {
      appendLine(`<span class="out-err">[!] Modifying system files...</span>`);
      setTimeout(showRansomware, 600);
    }, 500);
  }, 400);
}

function runCommand(event) {
  if (event.key !== 'Enter') {
    // History navigation
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        document.getElementById('cmd').value = history[history.length - 1 - histIdx] || '';
      }
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (histIdx > 0) { histIdx--; document.getElementById('cmd').value = history[history.length - 1 - histIdx] || ''; }
      else { histIdx = -1; document.getElementById('cmd').value = ''; }
    }
    return;
  }

  const input = document.getElementById('cmd');
  const raw = input.value.trim();
  input.value = '';
  histIdx = -1;

  if (!raw) { appendLine(PROMPT_HTML); return; }

  history.push(raw);
  const parts = raw.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Print the entered command
  appendLine(`${PROMPT_HTML}<span class="out-cmd">${escapeHtml(raw)}</span>`);

  // Check .exe execution
  const exeNames = (FS[cwd] || []).filter(f => f.endsWith('.exe'));
  if (exeNames.map(e => e.toLowerCase()).includes(cmd) ||
      exeNames.map(e => e.toLowerCase()).includes(cmd.replace('./', '')) ||
      (cmd === './' + exeNames[0]?.toLowerCase()) ) {
    handleExe(exeNames.find(e => e.toLowerCase() === cmd.replace('./', '')) || exeNames[0]);
    return;
  }

  // Built-in commands
  if (COMMAND_RESPONSES[cmd]) {
    const result = COMMAND_RESPONSES[cmd](args);
    if (result === '__CLEAR__') {
      document.getElementById('output').innerHTML = '';
    } else if (result) {
      appendLine(result);
    }
  } else {
    appendLine(`<span class="out-err">bash: ${escapeHtml(cmd)}: command not found</span>`);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Focus input on click anywhere in terminal
document.addEventListener('DOMContentLoaded', () => {
  const termBody = document.querySelector('.term-body');
  if (termBody) {
    termBody.addEventListener('click', () => document.getElementById('cmd').focus());
  }
  document.getElementById('cmd')?.focus();
});

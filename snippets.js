const SNIPPETS = {
  javascript: [
    "const unique = [...new Set(array)];",
    "const data = await fetch(url).then(res => res.json());",
    "const debounce = (fn, delay) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };",
    "interface User { id: string; name: string; role: 'admin' | 'guest'; }",
    "const activeUsers = users.filter(u => u.isActive).map(u => u.id);",
    "const sum = numbers.reduce((acc, curr) => acc + curr, 0);",
    "const clone = JSON.parse(JSON.stringify(originalObject));",
    "export const useAuth = () => useContext(AuthContext);",
    "const { id, name: userName, ...rest } = fetchUserData();",
    "const merge = (a, b) => ({ ...a, ...b });",
    "const clamp = (val, min, max) => Math.min(Math.max(val, min), max);"
  ],
  htmlcss: [
    "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;",
    "backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%);",
    "article:has(img) { border: 1px solid var(--border-glow); padding: 1rem; }",
    "@container sidebar (width > 400px) { .card { display: flex; flex-direction: row; } }",
    "<dialog id=\"vault-modal\"> <form method=\"dialog\"> <button>Close</button> </form> </dialog>",
    "transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out;",
    "position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;",
    "text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
    "box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);",
    "clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);",
    "input:focus-within { outline: 2px solid var(--primary-accent); }"
  ],
  terminal: [
    "git commit -am \"feat: implement spaced repetition typing algorithm\"",
    "git rebase -i HEAD~3 && git push origin main --force-with-lease",
    "ssh -i ~/.ssh/id_ed25519 deploy@192.168.1.100 -p 2222",
    "grep -rnw './src' -e 'localStorage' --include='*.js'",
    "docker compose up --build -d && docker compose logs -f app",
    "find . -name \"node_modules\" -type d -prune -exec rm -rf '{}' +",
    "curl -s https://api.github.com/users/octocat | jq '.public_repos'",
    "npm install -D typescript @types/react @types/node tailwindcss",
    "kill -9 $(lsof -t -i:3000) || echo \"Port 3000 was already clear\"",
    "tar -czvf backup-assets-$(date +%F).tar.gz ./public/assets",
    "chmod 400 ~/.ssh/id_ed25519 && ls -la ~/.ssh"
  ],
  philosophy: [
    "Simplicity is the ultimate sophistication. - Leonardo da Vinci",
    "First, solve the problem. Then, write the code. - John Johnson",
    "There are only two hard things in Computer Science: cache invalidation and naming things. - Phil Karlton",
    "Talk is cheap. Show me the code. - Linus Torvalds",
    "Program testing can be used to show the presence of bugs, but never to show their absence! - Edsger W. Dijkstra",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
    "Premature optimization is the root of all evil. - Donald Knuth",
    "Complexity is the enemy of reliability. - Tony Hoare",
    "The best way to predict the future is to invent it. - Alan Kay",
    "Design is not just what it looks like and feels like. Design is how it works. - Steve Jobs",
    "Make it work, make it right, make it fast. - Kent Beck"
  ]
};

const PATH_SNIPPETS = {
  javascript: [
    { level: 1, title: "Variable Basics", text: "let score = 0; const max = 100;", desc: "Practice basic declarations using 'let', 'const', and semicolons." },
    { level: 2, title: "Conditional Statements", text: "if (score >= max) { console.log(\"Win!\"); }", desc: "Learn brace structure and double-quotes keys." },
    { level: 3, title: "Functional Syntax", text: "function greet(name) { return \"Hello \" + name; }", desc: "Practice standard function templates and parameters." },
    { level: 4, title: "Arrow Functions", text: "const double = x => x * 2; console.log(double(5));", desc: "Master the fat-arrow key combination (=>) and parenthesis." },
    { level: 5, title: "Array Operations", text: "const active = list.filter(item => item.isActive);", desc: "Practice array callbacks, dots, and properties." },
    { level: 6, title: "Asynchronous Fetch", text: "const data = await fetch(url).then(res => res.json());", desc: "Master async declarations, fetches, and brackets." },
    { level: 7, title: "OOP Classes", text: "class User { constructor(id) { this.id = id; } }", desc: "Practice standard JavaScript class definitions and OOP attributes." },
    { level: 8, title: "Spread Operator", text: "const unique = [...new Set([1, 2, 2, 3])];", desc: "Type coding symbols: dots, brackets, and Set instances." },
    { level: 9, title: "Object Destructuring", text: "const { name, email, ...rest } = parseProfile(data);", desc: "Master the spread operator and destructuring brackets." },
    { level: 10, title: "React Context Hook", text: "export const useAuth = () => useContext(AuthContext);", desc: "Graduation level: Type a complete React authentication hook state." }
  ],
  htmlcss: [
    { level: 1, title: "HTML Elements", text: "<div class=\"card\">Hello World</div>", desc: "Type HTML bracket enclosures (< >) and attributes." },
    { level: 2, title: "Flex Centering", text: "display: flex; align-items: center; justify-content: center;", desc: "Master essential CSS layout spacing and colons." },
    { level: 3, title: "CSS Parent Selector", text: "article:has(img) { border: 1px solid var(--border); }", desc: "Practice parent relationship styling and variables." },
    { level: 4, title: "Responsive CSS Grids", text: "grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));", desc: "Type highly challenging CSS grid declarations." },
    { level: 5, title: "Glassmorphic Backdrop", text: "backdrop-filter: blur(12px) saturate(180%);", desc: "Practice modern UI CSS filter properties and percentages." },
    { level: 6, title: "Native Modal Popover", text: "<dialog id=\"modal\" popover>Welcome Top Layer</dialog>", desc: "Practice semantic HTML elements and popover syntax." },
    { level: 7, title: "CSS Transforms", text: "transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);", desc: "Type complex CSS animation properties and bezier values." },
    { level: 8, title: "Container Queries", text: "@container card (width > 400px) { .title { font-size: 2rem; } }", desc: "Practice modern container query breakpoints and structures." },
    { level: 9, title: "Accessible Semantic Forms", text: "<form action=\"/submit\" method=\"post\" aria-label=\"Signup\">", desc: "Master semantic form variables and accessibility properties." },
    { level: 10, title: "Complex Clipping Path", text: "clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%);", desc: "CSS Graduation: Practice precise clipping layouts and coordinate lists." }
  ],
  terminal: [
    { level: 1, title: "Basic Prompt", text: "but there is no confirmation or prompt to go to the next one.", desc: "Start simple: Type a basic user-friendly English sentence with no symbols." },
    { level: 2, title: "Smooth Transition", text: "Let's slowly transition softly and seamlessly to different texts.", desc: "Type a longer sentence to build comfort with soft transitions." },
    { level: 3, title: "Git Basics", text: "git add .", desc: "First soft transition: Type a very short Git staging command." },
    { level: 4, title: "Git Commits", text: "git commit -m \"feat: reward motivated players\"", desc: "Master basic Git commits, hyphens, and double quotes." },
    { level: 5, title: "Force Push", text: "git push origin main --force-with-lease", desc: "Practice double hyphens, multi-argument flags, and safe branch workflows." },
    { level: 6, title: "Docker Start", text: "docker compose up --build -d", desc: "Type commands featuring compose layouts, building, and background flags." },
    { level: 7, title: "SSH Connections", text: "ssh -i ~/.ssh/id_ed25519 deploy@192.168.1.100", desc: "Type safe keys, tildes, backslashes, and IP addresses." },
    { level: 8, title: "Terminal Grepping", text: "grep -rnw './src' -e 'localStorage'", desc: "Practice directory search commands with quotes, dots, and folders." },
    { level: 9, title: "Process Termination", text: "kill -9 $(lsof -t -i:3000) || echo \"Port cleared\"", desc: "Master nested bash subshell evaluations and evaluations." },
    { level: 10, title: "Command Sequence", text: "git rebase -i HEAD~3 && git status && git push origin feature", desc: "Graduation level: type a sequential multi-command Git workflow using ampersands." }
  ],
  symbols: [
    { level: 1, title: "Ternary Operators", text: "const x = (y === 5) ? true : false;", desc: "Type common ternary operations, question marks, and colons." },
    { level: 2, title: "Nested Array Brackets", text: "const arr = [[1, 2], [3, 4], [5, 6]];", desc: "Practice nested braces and multi-dimensional coordinate structures." },
    { level: 3, title: "Standard Code Brackets", text: "const map = { keys: [ '(', '[', '{', '}' ] };", desc: "Type coding delimiters and braces of all types." },
    { level: 4, title: "Template Backticks", text: "const str = `Template contains ${val} evaluation`;", desc: "Master the backtick key (`) and shell evaluations (${})." },
    { level: 5, title: "Regular Expressions", text: "const regex = /^[a-zA-Z0-9#_]+$/g;", desc: "Practice difficult regex patterns, slashes, and symbols." },
    { level: 6, title: "Firebase Imports", text: "import { app, db } from '../firebase/config';", desc: "Type path strings and import declarations." },
    { level: 7, title: "Strict URL Paths", text: "const url = \"https://api.github.com/users/octocat/repos\";", desc: "Practice typing strict, symbol-heavy API URL strings." },
    { level: 8, title: "Arithmetic Modulo", text: "let index = (array.length - 1) % limit;", desc: "Practice coding math calculations: brackets, dashes, and percentages." },
    { level: 9, title: "Optional Chaining", text: "const val = object?.profile?.settings?.(true) ?? \"default\";", desc: "Master optional chaining (?.) and nullish coalescing (??)." },
    { level: 10, title: "Nested Matrix Iteration", text: "for (let i = 0; i < n; i++) { matrix[i][i] = 1.0; }", desc: "Symbols Graduation: Type progressive nested array brackets and counters." }
  ]
};

// Export SNIPPETS for modular script or attach to window for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SNIPPETS, PATH_SNIPPETS };
} else {
  window.SNIPPETS = SNIPPETS;
  window.PATH_SNIPPETS = PATH_SNIPPETS;
}

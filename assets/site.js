
(() => {
  const items = document.querySelectorAll(".rise");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  const root = document.getElementById("try");
  if (!root) return;
  const T = JSON.parse(root.dataset.text);
  const decimal = root.dataset.decimal || ",";

  const svg = root.querySelector("svg");
  const needle = svg.querySelector(".needle");
  const button = root.querySelector(".try-button");
  const targetValue = root.querySelector(".target-value");
  const readout = root.querySelector(".readout");
  const resultLine = root.querySelector(".result-line");
  const triesLeft = root.querySelector(".tries-left");

  const MAX_TRIES = 2;
  const KEY = "tz-deneme";
  const readUsed = () => {
    let value = 0;
    try { value = parseInt(localStorage.getItem(KEY) || "0", 10) || 0; } catch (_) {}
    const cookie = document.cookie.match(/(?:^|; )tz-deneme=(\d+)/);
    return Math.max(value, cookie ? parseInt(cookie[1], 10) : 0);
  };
  const writeUsed = (n) => {
    try { localStorage.setItem(KEY, String(n)); } catch (_) {}
    document.cookie = `${KEY}=${n}; max-age=31536000; path=/; SameSite=Lax`;
  };
  let used = readUsed();
  const showTries = () => { triesLeft.textContent = T.left.replace("{n}", Math.max(0, MAX_TRIES - used)); };

  const ticks = svg.querySelector(".ticks");
  for (let i = 0; i < 60; i++) {
    const long = i % 5 === 0;
    const a = (i / 60) * Math.PI * 2;
    const r1 = long ? 96 : 104, r2 = 116;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 150 + Math.sin(a) * r1);
    line.setAttribute("y1", 165 - Math.cos(a) * r1);
    line.setAttribute("x2", 150 + Math.sin(a) * r2);
    line.setAttribute("y2", 165 - Math.cos(a) * r2);
    line.setAttribute("stroke-width", long ? 6 : 3);
    ticks.appendChild(line);
  }

  const fmt = (value, digits) => value.toFixed(digits).replace(".", decimal);
  const setNeedle = (deg) => needle.setAttribute("transform", `rotate(${deg} 150 165)`);

  let state = "ready";
  let target = 0, start = 0, frame = 0, timer = 0;

  function newTarget() {
    target = Math.round((2 + Math.random() * 4) * 100) / 100;
  }

  function setButton(label, tint) {
    button.textContent = label;
    button.className = `btn try-button ${tint}`;
  }

  function lock() {
    state = "locked";
    root.classList.add("locked");
    targetValue.innerHTML = "???";
    resultLine.textContent = T.locked;
    setButton(T.download, "");
    showTries();
  }

  function reset() {
    if (used >= MAX_TRIES) { lock(); return; }
    state = "ready";
    showTries();
    newTarget();
    targetValue.innerHTML = "???";
    readout.textContent = fmt(0, 2);
    resultLine.textContent = T.hint;
    setNeedle(0);
    setButton(T.start, "green");
  }

  async function countdown() {
    if (used >= MAX_TRIES) { lock(); return; }
    used += 1;
    writeUsed(used);
    showTries();
    state = "countdown";
    button.disabled = true;
    for (const n of [3, 2, 1]) {
      readout.textContent = String(n);
      if (n === 1) targetValue.innerHTML = `${fmt(target, 2)}<em>sn</em>`;
      await new Promise((r) => setTimeout(r, 650));
    }
    button.disabled = false;
    run();
  }

  function run() {
    state = "running";
    setButton(T.stop, "");
    resultLine.textContent = "";
    start = performance.now();
    const tick = (now) => {
      if (state !== "running") return;
      const elapsed = (now - start) / 1000;
      setNeedle((elapsed / target) * 360);
      readout.textContent = elapsed / target >= 0.6 ? "??" + decimal + "??" : fmt(elapsed, 2);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    timer = setTimeout(() => stop(performance.now()), (target + 3) * 1000);
  }

  function stop(now) {
    if (state !== "running") return;
    state = "done";
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    const elapsed = (now - start) / 1000;
    const diff = Math.abs(elapsed - target);
    setNeedle((elapsed / target) * 360);
    readout.textContent = fmt(elapsed, 3);
    const grade =
      diff <= 0.010 ? T.perfect :
      diff <= 0.050 ? T.great :
      diff <= 0.150 ? T.good :
      diff <= 0.400 ? T.fair : T.miss;
    resultLine.textContent = `${grade} ${fmt(diff, 3)} ${elapsed < target ? T.early : T.late}`;
    if (used >= MAX_TRIES) {
      state = "finished";
      setButton(T.download, "");
      root.classList.add("locked");
    } else {
      setButton(T.again, "blue");
    }
  }

  const press = (event) => {
    if (event.type === "keydown") {
      if (event.code !== "Space" || event.repeat) return;
      const rect = root.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      event.preventDefault();
    }
    if (event.type === "pointerdown" && event.button !== 0) return;
    const now = performance.now();
    if (state === "locked" || state === "finished") {
      if (event.type === "keydown") return;
      location.href = root.dataset.store || "#indir";
      return;
    }
    if (state === "running") stop(now);
    else if (state === "ready") countdown();
    else if (state === "done") { reset(); countdown(); }
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("keydown", (e) => { if (e.code === "Enter") press({ type: "pointerdown", button: 0 }); });
  document.addEventListener("keydown", press);

  reset();
})();

(() => {
  const open = (id) => {
    const dlg = document.getElementById(id);
    if (!dlg) return;
    document.querySelectorAll("dialog[open]").forEach((d) => d !== dlg && d.close());
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  };
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open]");
    if (opener) { event.preventDefault(); open(opener.dataset.open); return; }
    const closer = event.target.closest("[data-close]");
    if (closer) { closer.closest("dialog")?.close(); return; }
    if (event.target.tagName === "DIALOG") event.target.close();
  });
  if (location.hash === "#iletisim-yaz") open("dlg-iletisim");

  const form = document.querySelector(".contact-form");
  if (!form) return;
  const T = JSON.parse(form.dataset.text);
  const status = form.querySelector(".form-status");
  const submit = form.querySelector('[type="submit"]');
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    data.set("_subject", "Tam Zamanı: " + (data.get("konu") || ""));
    status.className = "form-status";
    status.textContent = T.sending;
    submit.disabled = true;
    let response;
    try {
      response = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
    } catch (_) {
      submit.disabled = false;
      status.textContent = "";
      form.submit();
      return;
    }
    submit.disabled = false;
    if (response.ok) {
      form.reset();
      status.className = "form-status ok";
      status.textContent = T.ok;
      return;
    }
    let detail = "";
    try {
      const body = await response.json();
      detail = (body.errors || []).map((e) => e.message).filter(Boolean).join(" ") || body.error || "";
    } catch (_) {}
    status.className = "form-status err";
    status.textContent = T.err + (detail ? " (" + detail + ")" : "");
  });
})();

(() => {
  const button = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) return;
  const set = (open) => {
    nav.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
  };
  button.addEventListener("click", () => set(!nav.classList.contains("open")));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) set(false); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") set(false); });
})();

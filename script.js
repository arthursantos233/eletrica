/* =========================================================
   ⚙️ CONFIGURAÇÃO — EDITE APENAS ESTE BLOCO
   ========================================================= */
const CONFIG = {
  // Nome exibido no site
  nome: "Seu Nome",
  nomeCurto: "Eletricista",

  // WhatsApp: DDI + DDD + número (só dígitos, sem espaços)
  // Ex.: Brasil (55) + 11 + 999999999
  telefone: "5511999999999",
  telefoneExibicao: "(11) 99999-9999",

  // Localização
  cidade: "Sua Cidade - UF",
  cidadeBadge: "Atendimento em Sua Cidade e região",
  regiao: "Sua Cidade e região metropolitana"
};

/* =========================================================
   APLICA CONFIG NO DOM
   ========================================================= */
function applyConfig() {
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.dataset.config;
    if (CONFIG[key] !== undefined) el.textContent = CONFIG[key];
  });

  document.querySelectorAll("[data-tel]").forEach((el) => {
    el.setAttribute("href", "tel:+" + CONFIG.telefone);
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* =========================================================
   LINKS DO WHATSAPP
   ========================================================= */
function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message || "Olá! Gostaria de solicitar um orçamento.");
  return "https://wa.me/" + CONFIG.telefone + "?text=" + text;
}

function bindWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.setAttribute("href", buildWhatsAppUrl(el.dataset.whatsapp));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}

/* =========================================================
   HEADER: sombra ao rolar + menu mobile
   ========================================================= */
function initHeader() {
  const header = document.getElementById("header");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("is-open")) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
}

/* =========================================================
   ANIMAÇÕES NO SCROLL (IntersectionObserver)
   ========================================================= */
function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

/* =========================================================
   NAVEGAÇÃO SUAVE ENTRE SEÇÕES
   ========================================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerH = document.getElementById("header")?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  });
}

/* =========================================================
   FORMULÁRIO: validação + envio para WhatsApp
   ========================================================= */
function initForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const showError = (field, message) => {
    const wrapper = field.closest(".form__field");
    const error = wrapper?.querySelector(".form__error");
    wrapper?.classList.add("is-invalid");
    if (error) error.textContent = message;
  };

  const clearError = (field) => {
    const wrapper = field.closest(".form__field");
    const error = wrapper?.querySelector(".form__error");
    wrapper?.classList.remove("is-invalid");
    if (error) error.textContent = "";
  };

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => clearError(field));
    field.addEventListener("change", () => clearError(field));
  });

  // Máscara de telefone
  const tel = form.querySelector("#telefone");
  tel?.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    else if (v.length > 0) v = v.replace(/(\d{0,2})/, "($1");
    e.target.value = v;
  });

  const validators = {
    nome: (v) => (v.trim().length >= 2 ? "" : "Informe seu nome completo."),
    telefone: (v) =>
      v.replace(/\D/g, "").length >= 10 ? "" : "Informe um telefone válido com DDD.",
    servico: (v) => (v ? "" : "Selecione o serviço desejado."),
    mensagem: (v) =>
      v.trim().length >= 10 ? "" : "Descreva o serviço com pelo menos 10 caracteres."
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let hasError = false;

    ["nome", "telefone", "servico", "mensagem"].forEach((name) => {
      const field = form.elements[name];
      const msg = validators[name]?.(field.value) ?? "";
      if (msg) {
        showError(field, msg);
        hasError = true;
      } else {
        clearError(field);
      }
    });

    if (hasError) {
      form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea")?.focus();
      return;
    }

    const { nome, telefone, cidade, servico, mensagem } = form.elements;

    const texto =
      "Olá! Vim pelo site e gostaria de solicitar um orçamento.\n\n" +
      "*Nome:* " + nome.value.trim() + "\n" +
      "*Telefone:* " + telefone.value.trim() + "\n" +
      (cidade.value.trim() ? "*Cidade/Bairro:* " + cidade.value.trim() + "\n" : "") +
      "*Serviço:* " + servico.value + "\n" +
      "*Descrição:* " + mensagem.value.trim();

    window.open(buildWhatsAppUrl(texto), "_blank", "noopener,noreferrer");
    form.reset();
  });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  bindWhatsAppLinks();
  initHeader();
  initReveal();
  initSmoothScroll();
  initForm();
});
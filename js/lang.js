let translations = {};
let currentLang = "tr";

async function loadTranslations() {
  const res = await fetch("/chat/lang.json");
  translations = await res.json();

  const savedLang = localStorage.getItem("lang") || "tr";
  setLanguage(savedLang);
}

function setLanguage(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[key] && translations[key][lang]) {
      el.textContent = translations[key][lang];
    }
  });

  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
}

loadTranslations();
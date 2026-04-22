window.translations = {};
window.currentLang = "tr";

function t(key) {
  if (window.translations[key] && window.translations[key][window.currentLang]) {
    return window.translations[key][window.currentLang];
  }
  return key;
}

async function loadTranslations() {
  try {
    const res = await fetch("/chats/lang.json");
    window.translations = await res.json();

    const savedLang = localStorage.getItem("lang") || "tr";
    setLanguage(savedLang);
  } catch (error) {
    console.error("Dil yükleme hatası:", error);
  }
}

function setLanguage(lang) {
  window.currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (window.translations[key] && window.translations[key][lang]) {
      el.textContent = window.translations[key][lang];
    }
  });

  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    const attrMapping = el.dataset.i18nAttr.split(",");
    attrMapping.forEach(mapping => {
      const [attr, key] = mapping.split(":");
      if (window.translations[key] && window.translations[key][lang]) {
        el.setAttribute(attr.trim(), window.translations[key][lang]);
      }
    });
  });

  updateLangButtonUI(lang);

  window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
}

window.setLanguage = setLanguage;

function updateLangButtonUI(lang) {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

loadTranslations();
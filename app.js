const STORAGE_KEY = "manualSite.manuals";

const state = {
  manuals: [],
  keyword: "",
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  manualList: document.getElementById("manualList"),
  manualForm: document.getElementById("manualForm"),
  manualId: document.getElementById("manualId"),
  titleInput: document.getElementById("titleInput"),
  categoryInput: document.getElementById("categoryInput"),
  descriptionInput: document.getElementById("descriptionInput"),
  urlInput: document.getElementById("urlInput"),
  formTitle: document.getElementById("formTitle"),
  saveButton: document.getElementById("saveButton"),
  cancelEditButton: document.getElementById("cancelEditButton"),
};

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.manuals));
}

function normalizeHttpUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch (_) {
    return null;
  }
  return null;
}

function getNextId() {
  return state.manuals.reduce((maxId, manual) => Math.max(maxId, manual.id), 0) + 1;
}

function resetForm() {
  elements.manualForm.reset();
  elements.manualId.value = "";
  elements.formTitle.textContent = "manual 新規追加";
  elements.saveButton.textContent = "追加";
}

function startEdit(id) {
  const manual = state.manuals.find((item) => item.id === id);
  if (!manual) return;

  elements.manualId.value = String(manual.id);
  elements.titleInput.value = manual.title;
  elements.categoryInput.value = manual.category;
  elements.descriptionInput.value = manual.description;
  elements.urlInput.value = manual.sharepointUrl;
  elements.formTitle.textContent = "manual 編集";
  elements.saveButton.textContent = "更新";
}

function deleteManual(id) {
  state.manuals = state.manuals.filter((item) => item.id !== id);
  saveToStorage();
  renderManuals();
}

function createManualItem(manual) {
  const li = document.createElement("li");
  li.className = "manual-item";

  const title = document.createElement("h3");
  title.textContent = manual.title;
  li.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "manual-meta";
  meta.textContent = `カテゴリ: ${manual.category}`;
  li.appendChild(meta);

  const desc = document.createElement("p");
  desc.textContent = manual.description;
  li.appendChild(desc);

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "開く";
  openButton.addEventListener("click", () => {
    const safeUrl = normalizeHttpUrl(manual.sharepointUrl);
    if (!safeUrl) return;
    window.open(safeUrl, "_blank", "noopener,noreferrer");
  });

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "編集";
  editButton.className = "secondary";
  editButton.addEventListener("click", () => startEdit(manual.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "削除";
  deleteButton.className = "secondary";
  deleteButton.addEventListener("click", () => deleteManual(manual.id));

  actions.append(openButton, editButton, deleteButton);
  li.appendChild(actions);

  return li;
}

function renderManuals() {
  const keyword = state.keyword.trim().toLowerCase();
  const filtered = state.manuals.filter((manual) =>
    [manual.title, manual.category, manual.description]
      .join(" ")
      .toLowerCase()
      .includes(keyword)
  );

  elements.manualList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "該当する manual はありません。";
    elements.manualList.appendChild(empty);
    return;
  }

  filtered.forEach((manual) => {
    elements.manualList.appendChild(createManualItem(manual));
  });
}

function submitForm(event) {
  event.preventDefault();

  const id = Number(elements.manualId.value);
  const payload = {
    title: elements.titleInput.value.trim(),
    category: elements.categoryInput.value.trim(),
    description: elements.descriptionInput.value.trim(),
    sharepointUrl: elements.urlInput.value.trim(),
  };

  if (!payload.title || !payload.category || !payload.description || !payload.sharepointUrl) {
    return;
  }

  const safeUrl = normalizeHttpUrl(payload.sharepointUrl);
  if (!safeUrl) {
    return;
  }
  payload.sharepointUrl = safeUrl;

  if (id) {
    state.manuals = state.manuals.map((manual) =>
      manual.id === id ? { ...manual, ...payload } : manual
    );
  } else {
    state.manuals.push({
      id: getNextId(),
      ...payload,
    });
  }

  saveToStorage();
  resetForm();
  renderManuals();
}

async function loadManuals() {
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage) {
    try {
      state.manuals = JSON.parse(fromStorage);
      renderManuals();
      return;
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const response = await fetch("manuals.json");
  state.manuals = await response.json();
  saveToStorage();
  renderManuals();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.keyword = event.target.value;
    renderManuals();
  });
  elements.manualForm.addEventListener("submit", submitForm);
  elements.cancelEditButton.addEventListener("click", resetForm);
}

bindEvents();
loadManuals().catch(() => {
  state.manuals = [];
  renderManuals();
});

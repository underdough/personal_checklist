function checklistApp() {
  return {
    // ===== Estado base =====
    categories: [
      { id: "gen", name: "General" },
      { id: "qa", name: "QA" },
      { id: "dev", name: "Desarrollo" },
    ],
    tasks: [
      {
        id: crypto.randomUUID(),
        title: "Revisar requisitos",
        done: false,
        category: "gen",
      },
      {
        id: crypto.randomUUID(),
        title: "Casos de prueba iniciales",
        done: true,
        category: "qa",
      },
      {
        id: crypto.randomUUID(),
        title: "Configurar entorno local",
        done: false,
        category: "dev",
      },
    ],

    // ===== UI =====
    filter: "all",
    stateFilter: "all",
    selected: new Set(),
    newTask: "",
    newTaskCategory: "",
    showNewCategory: false,
    newCategory: "",
    toasts: [],
    confirm: { show: false, message: "", action: null, payload: null },

    // ===== Init + persistencia =====
    init() {
      const saved = JSON.parse(localStorage.getItem("checklist_glass") || "{}");
      if (saved.categories) this.categories = saved.categories;
      if (saved.tasks) this.tasks = saved.tasks;
      this.$watch("tasks", () => this.persist());
      this.$watch("categories", () => this.persist());
    },
    persist() {
      localStorage.setItem(
        "checklist_glass",
        JSON.stringify({ categories: this.categories, tasks: this.tasks })
      );
    },

    // ===== Helpers =====
    subtitle() {
      const cat =
        this.filter === "all"
          ? "todas las categorías"
          : `“${this.catName(this.filter)}”`;
      return `Filtrando: ${cat}`;
    },
    catName(id) {
      return this.categories.find((c) => c.id === id)?.name || "—";
    },
    countByCategory(id) {
      return this.tasks.filter((t) => t.category === id).length;
    },
    visibleTasks() {
      return this.tasks.filter((t) => {
        const byCat = this.filter === "all" || t.category === this.filter;
        const byState =
          this.stateFilter === "all" ||
          (this.stateFilter === "done" ? t.done : !t.done);
        return byCat && byState;
      });
    },
    leftCount() {
      return this.tasks.filter((t) => !t.done).length;
    },
    doneCount() {
      return this.tasks.filter((t) => t.done).length;
    },
    hasCompleted() {
      return this.tasks.some((t) => t.done);
    },

    // ===== Toast =====
    notify(msg, type = "ok", ms = 2200) {
      const id = crypto.randomUUID();
      this.toasts.push({ id, msg, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, ms);
    },

    // ===== Confirm modal =====
    openConfirm(message, action, payload = null) {
      this.confirm = { show: true, message, action, payload };
    },
    confirmYes() {
      const { action, payload } = this.confirm;
      this.confirm.show = false;
      if (!action) return;
      this[action](payload);
    },

    // ===== Categorías =====
    addCategory() {
      if (!this.newCategory) {
        this.notify("Escribe un nombre de categoría", "error");
        return;
      }
      const id = this.slug(this.newCategory);
      if (this.categories.some((c) => c.id === id)) {
        this.notify("Esa categoría ya existe", "error");
        return;
      }
      this.categories.push({ id, name: this.newCategory });
      this.newCategory = "";
      this.showNewCategory = false;
      this.notify("Categoría creada");
    },
    askDeleteCategory(id) {
      this.openConfirm(
        "Eliminar esta categoría y todas sus tareas asociadas?",
        "removeCategory",
        id
      );
    },
    removeCategory(id) {
      this.tasks = this.tasks.filter((t) => t.category !== id);
      this.categories = this.categories.filter((c) => c.id !== id);
      if (this.filter === id) this.filter = "all";
      this.selected.clear();
      this.notify("Categoría eliminada");
    },
    slug(s) {
      return s
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
    },

    // ===== Tareas =====
    addTask() {
      if (!this.newTask || !this.newTaskCategory) {
        this.notify("Escribe una tarea y elige categoría", "error");
        return;
      }
      this.tasks.unshift({
        id: crypto.randomUUID(),
        title: this.newTask,
        done: false,
        category: this.newTaskCategory,
      });
      this.newTask = "";
      this.newTaskCategory = "";
      this.notify("Tarea agregada");
    },
    toggleDone(id) {
      const t = this.tasks.find((x) => x.id === id);
      if (!t) return;
      t.done = !t.done;
    },
    askDeleteTask(id) {
      this.openConfirm("¿Eliminar esta tarea?", "deleteTask", id);
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.selected.delete(id);
      this.notify("Tarea eliminada");
    },
    askClearCompleted() {
      this.openConfirm(
        "¿Eliminar todas las tareas completadas?",
        "clearCompleted"
      );
    },
    clearCompleted() {
      this.tasks = this.tasks.filter((t) => !t.done);
      this.selected.clear();
      this.notify("Completadas eliminadas");
    },

    // ===== Selección múltiple =====
    toggleSelected(id) {
      this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
    },
    toggleSelectAll() {
      const vis = this.visibleTasks();
      const allSelected = vis.every((t) => this.selected.has(t.id));
      if (allSelected) vis.forEach((t) => this.selected.delete(t.id));
      else vis.forEach((t) => this.selected.add(t.id));
    },
    askDeleteSelected() {
      this.openConfirm(
        "¿Eliminar todas las tareas seleccionadas?",
        "deleteSelected"
      );
    },
    deleteSelected() {
      if (this.selected.size === 0) return;
      this.tasks = this.tasks.filter((t) => !this.selected.has(t.id));
      this.selected.clear();
      this.notify("Seleccionadas eliminadas");
    },

    // ===== Exportar / Importar (merge, sin perder progreso) =====
    doExport() {
      const data = { categories: this.categories, tasks: this.tasks };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checklist_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.notify("JSON exportado");
    },
    doImport(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const incoming = JSON.parse(reader.result);
          const incCats = Array.isArray(incoming.categories)
            ? incoming.categories
            : [];
          const incTasks = Array.isArray(incoming.tasks) ? incoming.tasks : [];
          incCats.forEach((c) => {
            if (!this.categories.some((x) => x.id === c.id))
              this.categories.push({ id: c.id, name: c.name || c.id });
          });
          incTasks.forEach((t) => {
            const id = t.id || crypto.randomUUID();
            if (!this.tasks.some((x) => x.id === id)) {
              this.tasks.push({
                id,
                title: String(t.title || "Sin título"),
                done: !!t.done,
                category: t.category || "gen",
              });
            }
          });
          this.persist();
          this.notify("Importación completada");
        } catch (err) {
          console.error(err);
          this.notify("Archivo JSON inválido", "error");
        }
        e.target.value = "";
      };
      reader.readAsText(file);
    },
  };
}

/* ===== Aurora interactiva (no interfiere con Alpine) ===== */
(function () {
  const bg = document.querySelector(".bg-aurora");
  if (!bg) return;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) return;
  let tx = 50,
    ty = 50,
    cx = 50,
    cy = 50;
  document.addEventListener(
    "mousemove",
    (e) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    },
    { passive: true }
  );
  function step() {
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    bg.style.backgroundPosition = `${cx}% ${cy}%`;
    requestAnimationFrame(step);
  }
  step();
})();

/* ===== Parche seguro una vez que Alpine esté listo ===== */
(function () {
  // Ejecutar cuando el DOM esté listo
  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(() => {
    const MAX_TRIES = 60; // ~6s
    let tries = 0,
      patched = false,
      lastFilter = null,
      visibilityTimer = null;

    function tryPatch() {
      if (patched) return;

      const taskInput = document.querySelector(
        'input[placeholder="Nueva tarea..."]'
      );
      if (!taskInput) {
        retry();
        return;
      }

      const form = taskInput.closest("form");
      const selectCat = form
        ? form.querySelector('select[x-model="newTaskCategory"]')
        : null;
      const compRoot = taskInput.closest("[x-data]");
      if (!form || !selectCat || !compRoot) {
        retry();
        return;
      }

      // Obtener la instancia de datos de Alpine del componente
      let comp = null;
      try {
        comp = window.Alpine && Alpine.$data ? Alpine.$data(compRoot) : null;
      } catch (_) {}

      if (!comp || typeof comp.addTask !== "function") {
        retry();
        return;
      }

      // --- Mostrar/ocultar select según filtro ---
      function applyVisibility() {
        if (comp.filter === "all") {
          selectCat.style.display = "";
          form.dataset.compact = "false";
        } else {
          selectCat.style.display = "none";
          form.dataset.compact = "true";
        }
      }
      applyVisibility();
      // Observa cambios de filtro de forma liviana
      lastFilter = comp.filter;
      visibilityTimer = setInterval(() => {
        if (!comp) return;
        if (comp.filter !== lastFilter) {
          lastFilter = comp.filter;
          applyVisibility();
        }
      }, 150);

      // --- Envolver addTask sin romper tu lógica ---
      const originalAddTask = comp.addTask; // ya existe
      comp.addTask = function () {
        // Si no estamos en "Todas", agrega directo en la categoría actual
        if (this.filter !== "all") {
          if (!this.newTask) {
            this.notify("Escribe una tarea", "error");
            return;
          }
          const cat = this.filter;
          this.tasks.unshift({
            id: crypto.randomUUID(),
            title: this.newTask,
            done: false,
            category: cat,
          });
          this.newTask = "";
          this.newTaskCategory = "";
          this.notify("Tarea agregada");
          return;
        }
        // En "Todas" se exige seleccionar categoría (comportamiento original)
        if (!this.newTask || !this.newTaskCategory) {
          this.notify("Elige una categoría para esta tarea", "error");
          return;
        }
        // Llama a tu implementación original
        return originalAddTask.apply(this, arguments);
      };

      patched = true;
    }

    function retry() {
      if (++tries < MAX_TRIES) setTimeout(tryPatch, 100);
    }

    // Intenta parchar ahora y reintenta si aún no está montado Alpine
    tryPatch();

    // También parcha tras la señal global de Alpine (por si llega más tarde)
    document.addEventListener("alpine:initialized", tryPatch, { once: true });
  });
})();

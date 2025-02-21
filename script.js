// Variable globale pour le planning
let currentPlanningDate = new Date();

// Variable globale pour le mode édition des routines
let editModeRoutines = false;

document.addEventListener("DOMContentLoaded", () => {
  updateStatsCard();
  updateTipCard();
  updateEventsCard();
  setActivePage('home');
  
  // Navigation
  document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
      setActivePage(button.dataset.page);
    });
  });
  
  // Carte Statistiques -> Page stats
  document.getElementById("statsCard").addEventListener("click", () => {
    setActivePage("stats");
  });
  
  // Réinitialisation des données
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser les données ?")) {
      localStorage.clear();
      updateStatsCard();
      updateTipCard();
      updateEventsCard();
      setActivePage('home');
    }
  });
});

/* ----------------- Dashboard : Statistiques / Tip / Events ----------------- */
function updateStatsCard() {
  const statsCard = document.getElementById("statsCard");
  let totalObjectives = JSON.parse(localStorage.getItem("objectives"))?.length || 0;
  let completedRoutines = JSON.parse(localStorage.getItem("routines"))?.filter(r => r.done)?.length || 0;
  statsCard.innerHTML = `<h3>📊 Statistiques</h3>
    <p>Objectifs : ${totalObjectives}</p>
    <p>Routines accomplies : ${completedRoutines}</p>`;
}

function updateTipCard() {
  const tips = ["Bois de l'eau", "Fais une pause", "Planifie ta journée"];
  document.getElementById("tipCard").innerHTML = `<h3>💡 Astuce</h3>
    <p>${tips[Math.floor(Math.random() * tips.length)]}</p>`;
}

function updateEventsCard() {
  document.getElementById("eventsCard").innerHTML = `<h3>📅 Événements</h3>
    <p>Aucun événement prévu</p>`;
}

/* ----------------- Navigation et affichage du contenu ----------------- */
function setActivePage(page) {
  const contentDiv = document.getElementById("content");
  let htmlContent = "";
  
  switch (page) {
    case "objectifs":
      htmlContent = `
        <h2>Objectifs</h2>
        <form id="objectiveForm">
          <label for="objectiveTitle">Titre de l'objectif :</label>
          <input type="text" id="objectiveTitle" required>
          <label for="objectiveDeadline">Deadline :</label>
          <input type="date" id="objectiveDeadline" required>
          <label for="objectiveTasks">Tâches (séparées par des virgules) :</label>
          <textarea id="objectiveTasks" required></textarea>
          <button type="submit">Ajouter l'objectif</button>
        </form>
        <div id="objectivesList"></div>
      `;
      break;
      
    case "planning":
      htmlContent = `
        <h2>Planning</h2>
        <div id="calendarHeader">
          <button id="prevMonth">Précédent</button>
          <span id="monthYear"></span>
          <button id="nextMonth">Suivant</button>
        </div>
        <div id="calendarContainer"></div>
        <div id="dayEventsContainer">
          <h3>Événements du jour</h3>
          <div id="dayEvents"></div>
        </div>
      `;
      break;
      
    case "routines":
      htmlContent = `
        <h2>Routines</h2>
        <button id="toggleEditRoutines" class="routines-btn">Modifier routines</button>
        <div id="routinesContainer"></div>
      `;
      break;
      
    case "sport":
      // Ajout du bandeau de tips + formulaire + liste
      htmlContent = `
        <h2>Sport</h2>
        <div id="sportTipsBanner" class="card" style="margin-bottom: 20px;">
          <h3>🩺 Conseils de récupération</h3>
          <p id="sportTip"></p>
        </div>
        
        <form id="sportForm">
          <label for="sportDate">Date :</label>
          <input type="date" id="sportDate" required>
          
          <label for="sportLaps">Nombre de longueurs :</label>
          <input type="number" id="sportLaps" min="0" required>
          
          <label for="sportTime">Temps de nage (en minutes) :</label>
          <input type="number" id="sportTime" min="0" required>
          
          <label for="sportNotes">Notes :</label>
          <textarea id="sportNotes"></textarea>
          
          <button type="submit">Enregistrer la séance</button>
        </form>
        
        <div id="sportSessionsList"></div>
      `;
      break;
      
    case "todolist":
      htmlContent = `
        <h2>To-Do List</h2>
        <div id="todoListContainer"></div>
      `;
      break;
      
    case "stats":
      const totalObjectives = JSON.parse(localStorage.getItem("objectives"))?.length || 0;
      const completedRoutines = JSON.parse(localStorage.getItem("routines"))?.filter(r => r.done)?.length || 0;
      const totalSport = JSON.parse(localStorage.getItem("sport"))?.length || 0;
      const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || 0;
      htmlContent = `
        <h2>Statistiques détaillées</h2>
        <ul>
          <li>Nombre total d'objectifs : ${totalObjectives}</li>
          <li>Routines accomplies : ${completedRoutines}</li>
          <li>Nombre de séances sport : ${totalSport}</li>
          <li>Nombre de tâches complétées : ${completedTasks}</li>
        </ul>
      `;
      break;
      
    case "home":
    default:
      htmlContent = `
        <h2>Bienvenue sur Second Brain</h2>
        <p>Utilisez le menu ci-dessus pour naviguer dans l'application.</p>
      `;
      break;
  }
  
  contentDiv.innerHTML = htmlContent;
  
  // Initialiser les pages spécifiques
  if (page === "objectifs") {
    initObjectivePage();
  } else if (page === "planning") {
    initPlanningPage();
  } else if (page === "routines") {
    initRoutinesPage();
  } else if (page === "sport") {
    initSportPage();
  } else if (page === "todolist") {
    renderTodoList();
  }
}

/* ----------------- Objectifs ----------------- */
function initObjectivePage() {
  const form = document.getElementById("objectiveForm");
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const title = document.getElementById("objectiveTitle").value;
    const deadline = document.getElementById("objectiveDeadline").value;
    const tasksRaw = document.getElementById("objectiveTasks").value;
    const tasks = tasksRaw.split(",").map(t => t.trim()).filter(t => t !== "");
    
    let objectives = JSON.parse(localStorage.getItem("objectives")) || [];
    objectives.push({ title, deadline, tasks });
    localStorage.setItem("objectives", JSON.stringify(objectives));
    
    // Ajout automatique d'un événement dans le planning
    addPlanningEvent(deadline, "00:00", "Deadline: " + title, "", "Objectif ajouté automatiquement");
    
    form.reset();
    renderObjectivesList();
    updateStatsCard();
  });
  renderObjectivesList();
}

function renderObjectivesList() {
  const container = document.getElementById("objectivesList");
  let objectives = JSON.parse(localStorage.getItem("objectives")) || [];
  if (objectives.length === 0) {
    container.innerHTML = "<p>Aucun objectif pour le moment.</p>";
    return;
  }
  let html = "";
  objectives.forEach((obj, index) => {
    html += `<div class="objective-item">
      <input type="checkbox" class="objective-checkbox" data-index="${index}">
      <div>
        <h3>${obj.title}</h3>
        <p>Deadline : ${obj.deadline}</p>
        <ul>`;
    obj.tasks.forEach(task => {
      html += `<li>${task}</li>`;
    });
    html += `</ul>
      </div>
    </div>`;
  });
  container.innerHTML = html;
  
  document.querySelectorAll(".objective-checkbox").forEach(chk => {
    chk.addEventListener("change", function() {
      if (this.checked && confirm("Objectif réalisé ?")) {
        let objectives = JSON.parse(localStorage.getItem("objectives")) || [];
        const index = parseInt(this.getAttribute("data-index"));
        objectives.splice(index, 1);
        localStorage.setItem("objectives", JSON.stringify(objectives));
        renderObjectivesList();
        renderTodoList();
        updateStatsCard();
      }
    });
  });
}

/* ----------------- To-Do List ----------------- */
function renderTodoList() {
  const container = document.getElementById("todoListContainer");
  let objectives = JSON.parse(localStorage.getItem("objectives")) || [];
  
  let html = "";
  let taskFound = false;
  
  objectives.forEach((obj, objIndex) => {
    obj.tasks.forEach((task, taskIndex) => {
      taskFound = true;
      html += `<div class="todo-item" data-obj-index="${objIndex}" data-task-index="${taskIndex}">
        <input type="checkbox" class="todo-checkbox">
        <span>${task}</span>
      </div>`;
    });
  });
  
  if (!taskFound) {
    container.innerHTML = "<p>Aucune tâche en attente.</p>";
  } else {
    container.innerHTML = html;
    document.querySelectorAll(".todo-checkbox").forEach(chk => {
      chk.addEventListener("change", function() {
        if (this.checked && confirm("Tâche réalisée ?")) {
          const parent = this.parentElement;
          const objIndex = parseInt(parent.getAttribute("data-obj-index"));
          const taskIndex = parseInt(parent.getAttribute("data-task-index"));
          let objectives = JSON.parse(localStorage.getItem("objectives")) || [];
          objectives[objIndex].tasks.splice(taskIndex, 1);
          localStorage.setItem("objectives", JSON.stringify(objectives));
          renderTodoList();
          updateStatsCard();
        }
      });
    });
  }
}

/* ----------------- Planning ----------------- */
function initPlanningPage() {
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentPlanningDate.setMonth(currentPlanningDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    currentPlanningDate.setMonth(currentPlanningDate.getMonth() + 1);
    renderCalendar();
  });
  renderCalendar();
  initEventModal();
}

function renderCalendar() {
  const calendarContainer = document.getElementById("calendarContainer");
  const monthYear = document.getElementById("monthYear");
  const year = currentPlanningDate.getFullYear();
  const month = currentPlanningDate.getMonth();
  
  monthYear.textContent = currentPlanningDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  
  let table = `<table>
    <thead>
      <tr>
        <th>Dim</th>
        <th>Lun</th>
        <th>Mar</th>
        <th>Mer</th>
        <th>Jeu</th>
        <th>Ven</th>
        <th>Sam</th>
      </tr>
    </thead>
    <tbody>`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let date = 1;
  
  for (let i = 0; i < 6; i++) {
    table += "<tr>";
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        table += "<td></td>";
      } else if (date > daysInMonth) {
        table += "<td></td>";
      } else {
        const d = new Date(year, month, date);
        const dStr = d.toISOString().split("T")[0];
        table += `<td data-date="${dStr}" class="calendar-day">${date}</td>`;
        date++;
      }
    }
    table += "</tr>";
  }
  table += "</tbody></table>";
  calendarContainer.innerHTML = table;
  
  document.querySelectorAll(".calendar-day").forEach(cell => {
    cell.addEventListener("click", function() {
      const selectedDate = this.getAttribute("data-date");
      renderDayEvents(selectedDate);
      openEventModal(selectedDate);
    });
  });
}

function renderDayEvents(date) {
  const dayEventsDiv = document.getElementById("dayEvents");
  let events = JSON.parse(localStorage.getItem("planningEvents")) || [];
  const filtered = events.filter(e => e.date === date);
  if (filtered.length === 0) {
    dayEventsDiv.innerHTML = "<p>Aucun événement pour ce jour.</p>";
  } else {
    let html = "";
    filtered.forEach(ev => {
      html += `<div class="event-item">
        <p><strong>${ev.title}</strong> à ${ev.time}</p>
        <p>Lieu : ${ev.place}</p>
        <p>${ev.notes}</p>
      </div>`;
    });
    dayEventsDiv.innerHTML = html;
  }
}

function initEventModal() {
  const modal = document.getElementById("eventModal");
  const closeModal = document.getElementById("closeModal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
  window.addEventListener("click", function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  
  const eventForm = document.getElementById("eventForm");
  if (eventForm) {
    eventForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const date = document.getElementById("eventDate").value;
      const time = document.getElementById("eventTime").value;
      const place = document.getElementById("eventPlace").value;
      const title = document.getElementById("eventTitle").value;
      const notes = document.getElementById("eventNotes").value;
      addPlanningEvent(date, time, title, place, notes);
      modal.style.display = "none";
      renderCalendar();
      renderDayEvents(date);
    });
  }
}

function openEventModal(date) {
  const modal = document.getElementById("eventModal");
  modal.style.display = "block";
  document.getElementById("eventDate").value = date;
  document.getElementById("eventTime").value = "";
  document.getElementById("eventPlace").value = "";
  document.getElementById("eventTitle").value = "";
  document.getElementById("eventNotes").value = "";
}

function addPlanningEvent(date, time, title, place, notes) {
  let events = JSON.parse(localStorage.getItem("planningEvents")) || [];
  events.push({ date, time, title, place, notes });
  localStorage.setItem("planningEvents", JSON.stringify(events));
}

/* ----------------- Sport ----------------- */
function initSportPage() {
  // Bandeau de tips : au hasard parmi un tableau d'astuces
  const sportTips = [
    "Fais des étirements légers après la séance pour éviter les courbatures.",
    "Hydrate-toi suffisamment avant et après ta séance.",
    "Prends un jour de repos si tu ressens une fatigue musculaire importante.",
    "Écoute ton corps : en cas de douleur persistante, consulte un professionnel.",
    "N’oublie pas l’échauffement avant et les étirements après la séance."
  ];
  document.getElementById("sportTip").textContent =
    sportTips[Math.floor(Math.random() * sportTips.length)];
  
  // Gestion du formulaire
  const sportForm = document.getElementById("sportForm");
  sportForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("sportDate").value;
    const laps = parseInt(document.getElementById("sportLaps").value) || 0;
    const time = parseInt(document.getElementById("sportTime").value) || 0;
    const notes = document.getElementById("sportNotes").value;
    
    let sessions = JSON.parse(localStorage.getItem("sport")) || [];
    sessions.push({ date, laps, time, notes });
    localStorage.setItem("sport", JSON.stringify(sessions));
    
    sportForm.reset();
    renderSportSessions();
    updateStatsCard();
  });
  
  renderSportSessions();
}

function renderSportSessions() {
  const container = document.getElementById("sportSessionsList");
  let sessions = JSON.parse(localStorage.getItem("sport")) || [];
  
  if (sessions.length === 0) {
    container.innerHTML = "<p>Aucune séance enregistrée.</p>";
    return;
  }
  
  let html = "<h3>Historique des séances</h3>";
  sessions.forEach((s, index) => {
    html += `
      <div class="objective-item" style="justify-content: space-between;">
        <div>
          <strong>Date :</strong> ${s.date}<br>
          <strong>Longueurs :</strong> ${s.laps}<br>
          <strong>Temps :</strong> ${s.time} min<br>
          <strong>Notes :</strong> ${s.notes || "Aucune"}
        </div>
        <button class="small-btn" data-index="${index}" style="align-self: center;">Supprimer</button>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Suppression de séance
  container.querySelectorAll(".small-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      if (confirm("Supprimer cette séance ?")) {
        let sessions = JSON.parse(localStorage.getItem("sport")) || [];
        const idx = parseInt(this.getAttribute("data-index"));
        sessions.splice(idx, 1);
        localStorage.setItem("sport", JSON.stringify(sessions));
        renderSportSessions();
        updateStatsCard();
      }
    });
  });
}
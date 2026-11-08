const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
}

themeToggle.addEventListener("click", function () {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        themeToggle.textContent = " Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = " Dark Mode";
        localStorage.setItem("theme", "light");
    }
});


const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");

function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;


    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    dateEl.textContent = now.toLocaleDateString("en-US", options);
}

updateClock();
setInterval(updateClock, 1000);

const deadlineInput = document.getElementById("deadline-input");
const setDeadlineBtn = document.getElementById("set-deadline");
const countdownEl = document.getElementById("countdown");

let countdownInterval = null;

setDeadlineBtn.addEventListener("click", function () {
    const deadline = new Date(deadlineInput.value);

    if (isNaN(deadline.getTime())) {
        countdownEl.textContent = "Please pick a valid date.";
        return;
    }

    localStorage.setItem("deadline", deadline.toISOString());

    startCountdown(deadline);
});

function startCountdown(deadline) {
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(function () {
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            countdownEl.textContent = " Deadline reached!";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s left`;
    }, 1000);
}

const savedDeadline = localStorage.getItem("deadline");
if (savedDeadline) {
    const deadline = new Date(savedDeadline);
    deadlineInput.value = deadline.toISOString().slice(0, 16);
    startCountdown(deadline);
}

const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function (task, index) {
        const li = document.createElement("li");
        if (task.done) li.classList.add("done");

        const span = document.createElement("span");
        span.textContent = task.text;
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
            tasks[index].done = !tasks[index].done;
            saveTasks();
            renderTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function () {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

addTaskBtn.addEventListener("click", function () {
    const text = taskInput.value.trim();
    if (text === "") return;

    tasks.push({ text: text, done: false });
    taskInput.value = "";
    saveTasks();
    renderTasks();
});

taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTaskBtn.click();
});

renderTasks();

const cityInput = document.getElementById("city-input");
const getWeatherBtn = document.getElementById("get-weather");
const weatherResult = document.getElementById("weather-result");

getWeatherBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();
    if (city === "") return;

    weatherResult.innerHTML = "<p>Loading...</p>";
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(geoData => {
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found. Please try again.");
            }

            const lat = geoData.results[0].latitude;
            const lon = geoData.results[0].longitude;
            const cityName = geoData.results[0].name;
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

            return fetch(weatherUrl)
                .then(response => response.json())
                .then(weatherData => {
                    const temp = weatherData.current_weather.temperature;
                    const wind = weatherData.current_weather.windspeed;
                    const code = weatherData.current_weather.weathercode;

                    let description = "Clear sky";
                    let icon = "☀️";

                    if (code === 0) { description = "Clear sky"; icon = "☀️"; }
                    else if (code >= 1 && code <= 3) { description = "Partly cloudy"; icon = "⛅"; }
                    else if (code === 45 || code === 48) { description = "Fog"; icon = "🌫️"; }
                    else if (code >= 51 && code <= 67) { description = "Rain"; icon = "🌧️"; }
                    else if (code >= 71 && code <= 77) { description = "Snow"; icon = "❄️"; }
                    else if (code >= 80 && code <= 82) { description = "Rain showers"; icon = "🌦️"; }
                    else if (code >= 95) { description = "Thunderstorm"; icon = "⛈️"; }

                    weatherResult.innerHTML = `
                        <h3>${cityName}</h3>
                        <p style="font-size: 2rem; margin: 5px 0;">${icon}</p>
                        <p><strong>${temp}°C</strong></p>
                        <p>${description}</p>
                        <p style="font-size: 0.9rem; color: gray;">Wind: ${wind} km/h</p>
                    `;
                });
        })
        .catch(error => {
            weatherResult.innerHTML = `<p> ${error.message}</p>`;
        });
});
cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") getWeatherBtn.click();
});
cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") getWeatherBtn.click();
});
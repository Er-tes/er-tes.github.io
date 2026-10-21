let dailyGoals = {
    kcal: 2300,
    protein: 150.0,
    fat: 75.0,
    carbs: 260.0,
    fiber: 35.0
};

// Dni tygodnia
const daysOfWeek = [
    { id: 'pon', name: 'Poniedziałek' },
    { id: 'wt', name: 'Wtorek' },
    { id: 'sr', name: 'Środa' },
    { id: 'czw', name: 'Czwartek' },
    { id: 'pt', name: 'Piątek' },
    { id: 'sob', name: 'Sobota' },
    { id: 'nd', name: 'Niedziela' }
];

let currentDay = 'pon';

// Funkcja wykrywająca bieżący dzień tygodnia w tle (bez wyświetlania godziny/daty)
function getTodayDayId() {
    const jsDay = new Date().getDay(); // 0 = Niedziela, 1 = Poniedziałek, ..., 6 = Sobota
    const dayMap = {
        1: 'pon',
        2: 'wt',
        3: 'sr',
        4: 'czw',
        5: 'pt',
        6: 'sob',
        0: 'nd'
    };
    return dayMap[jsDay] || 'pon';
}

// Baza danych produktów (wartości na 100g)
const productsDatabase = [
    { id: 1, name: "Pierś z kurczaka (surowa)", kcal: 120, protein: 22.5, fat: 2.6, carbs: 0.0, fiber: 0.0 },
    { id: 2, name: "Sałata masłowa", kcal: 14, protein: 1.4, fat: 0.2, carbs: 1.1, fiber: 1.2 },
    { id: 3, name: "Pomidor malinowy", kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
    { id: 4, name: "Papryka czerwona", kcal: 31, protein: 1.0, fat: 0.3, carbs: 6.0, fiber: 2.0 },
    { id: 5, name: "Ogórek zielony", kcal: 15, protein: 0.7, fat: 0.1, carbs: 2.9, fiber: 0.5 },
    { id: 6, name: "Ryż biały (surowy)", kcal: 358, protein: 6.8, fat: 0.6, carbs: 78.9, fiber: 1.4 },
    { id: 7, name: "Oliwa z oliwek", kcal: 884, protein: 0.0, fat: 100.0, carbs: 0.0, fiber: 0.0 },
    { id: 8, name: "Jajko kurze (całe)", kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7, fiber: 0.0 },
    { id: 9, name: "Płatki owsiane", kcal: 366, protein: 11.9, fat: 7.2, carbs: 59.3, fiber: 6.9 },
    { id: 10, name: "Banan", kcal: 89, protein: 1.1, fat: 0.3, carbs: 22.8, fiber: 2.6 }
];

let weeklyLogs = {
    pon: [],
    wt: [],
    sr: [],
    czw: [],
    pt: [],
    sob: [],
    nd: []
};

window.onload = function() {
    currentDay = getTodayDayId(); // Ustawienie aktualnego dnia na podstawie systemu
    loadDataFromStorage();
    renderDayButtons();
    populateProductSelect();
    document.getElementById('grammageInput').addEventListener('input', updateProductPreview);
    renderAll();
};

// --- OBSŁUGA LOCALSTORAGE ---

function saveDataToStorage() {
    localStorage.setItem('fitala_weeklyLogs', JSON.stringify(weeklyLogs));
    localStorage.setItem('fitala_dailyGoals', JSON.stringify(dailyGoals));
}

function loadDataFromStorage() {
    const savedLogs = localStorage.getItem('fitala_weeklyLogs');
    if (savedLogs) {
        try {
            weeklyLogs = JSON.parse(savedLogs);
        } catch (e) {
            console.error("Błąd parsowania historii tygodniowej", e);
        }
    }

    const savedGoals = localStorage.getItem('fitala_dailyGoals');
    if (savedGoals) {
        try {
            dailyGoals = JSON.parse(savedGoals);
        } catch (e) {
            console.error("Błąd parsowania celów", e);
        }
    }
}

// -----------------------------

function renderDayButtons() {
    const container = document.getElementById('daysContainer');
    container.innerHTML = daysOfWeek.map(day => {
        const isActive = day.id === currentDay;
        const btnClass = isActive 
            ? 'bg-emerald-700 text-white shadow-sm' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            
        return `<button onclick="switchDay('${day.id}')" class="px-4 py-2 rounded-lg font-semibold text-sm transition ${btnClass}">${day.name}</button>`;
    }).join('');

    const activeDayObj = daysOfWeek.find(d => d.id === currentDay);
    if (activeDayObj) {
        document.getElementById('currentDayTitle').textContent = activeDayObj.name;
    }
}

function switchDay(dayId) {
    currentDay = dayId;
    renderDayButtons();
    renderAll();
}

function populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '';
    productsDatabase.forEach(prod => {
        const opt = document.createElement('option');
        opt.value = prod.id;
        opt.textContent = `${prod.name} (${prod.kcal} kcal/100g)`;
        select.appendChild(opt);
    });
    updateProductPreview();
}

function updateProductPreview() {
    const prodId = parseInt(document.getElementById('productSelect').value);
    const grams = parseFloat(document.getElementById('grammageInput').value) || 0;
    const product = productsDatabase.find(p => p.id === prodId);

    if (!product) return;

    const factor = grams / 100;
    const previewKcal = (product.kcal * factor).toFixed(1);
    const previewProt = (product.protein * factor).toFixed(1);
    const previewFat = (product.fat * factor).toFixed(1);
    const previewCarbs = (product.carbs * factor).toFixed(1);
    const previewFiber = (product.fiber * factor).toFixed(1);

    document.getElementById('productPreview').innerHTML = `
        <div class="font-bold border-b border-emerald-200 pb-1 mb-1">Podgląd dla ${grams}g:</div>
        <div class="grid grid-cols-2 gap-x-2">
            <span>Kalorie: <strong>${previewKcal} kcal</strong></span>
            <span>Białko: <strong>${previewProt} g</strong></span>
            <span>Tłuszcze: <strong>${previewFat} g</strong></span>
            <span>Węglowodany: <strong>${previewCarbs} g</strong></span>
            <span class="col-span-2">Błonnik: <strong>${previewFiber} g</strong></span>
        </div>
    `;
}

function addMealItem() {
    const prodId = parseInt(document.getElementById('productSelect').value);
    const grams = parseFloat(document.getElementById('grammageInput').value);

    if (!grams || grams <= 0) {
        alert("Wprowadź poprawną gramaturę.");
        return;
    }

    const product = productsDatabase.find(p => p.id === prodId);
    if (!product) return;

    const factor = grams / 100;

    const newItem = {
        id: Date.now(),
        name: product.name,
        grams: grams,
        kcal: product.kcal * factor,
        protein: product.protein * factor,
        fat: product.fat * factor,
        carbs: product.carbs * factor,
        fiber: product.fiber * factor
    };

    weeklyLogs[currentDay].push(newItem);
    saveDataToStorage();
    renderAll();
}

function removeMealItem(id) {
    weeklyLogs[currentDay] = weeklyLogs[currentDay].filter(item => item.id !== id);
    saveDataToStorage();
    renderAll();
}

function clearDailyLog() {
    const activeDayObj = daysOfWeek.find(d => d.id === currentDay);
    if (weeklyLogs[currentDay].length === 0) return;
    
    if (confirm(`Czy na pewno chcesz zresetować posiłki dla dnia: ${activeDayObj.name}?`)) {
        weeklyLogs[currentDay] = [];
        saveDataToStorage();
        renderAll();
    }
}

function renderAll() {
    const currentLog = weeklyLogs[currentDay] || [];

    const totals = currentLog.reduce((acc, item) => {
        acc.kcal += item.kcal;
        acc.protein += item.protein;
        acc.fat += item.fat;
        acc.carbs += item.carbs;
        acc.fiber += item.fiber;
        return acc;
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 });

    renderBalanceTable(totals);
    renderConsumedList();
}

function renderBalanceTable(totals) {
    const tableBody = document.getElementById('balanceTableBody');
    
    const rows = [
        { key: 'kcal', label: 'Kalorie (kcal)', decimals: 0 },
        { key: 'protein', label: 'Białko (g)', decimals: 1 },
        { key: 'fat', label: 'Tłuszcze (g)', decimals: 1 },
        { key: 'carbs', label: 'Węglowodany (g)', decimals: 1 },
        { key: 'fiber', label: 'Błonnik (g)', decimals: 1 }
    ];

    let html = '';

    rows.forEach(row => {
        const goal = dailyGoals[row.key];
        const consumed = totals[row.key];
        
        const missing = Math.max(0, goal - consumed);
        const surplus = Math.max(0, consumed - goal);
        const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
        
        const capPercent = Math.min(100, percentage);
        const isSurplus = surplus > 0;
        const barColor = isSurplus ? 'bg-amber-500' : 'bg-emerald-600';

        html += `
            <tr>
                <td class="font-bold text-gray-800">${row.label}</td>
                <td class="text-right font-semibold">${formatNum(goal, row.decimals)}</td>
                <td class="text-right font-bold text-emerald-800">${formatNum(consumed, row.decimals)}</td>
                <td class="text-right text-gray-600">${formatNum(missing, row.decimals)}</td>
                <td class="text-right ${surplus > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}">${formatNum(surplus, row.decimals)}</td>
                <td class="text-center">
                    <div class="flex items-center justify-between gap-2">
                        <span class="font-bold text-xs w-12 text-right">${percentage.toFixed(1)}%</span>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex-1">
                            <div class="${barColor} h-2.5 rounded-full transition-all duration-300" style="width: ${capPercent}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

function renderConsumedList() {
    const tbody = document.getElementById('consumedList');
    const emptyState = document.getElementById('emptyLogState');
    const counter = document.getElementById('logCounter');
    const currentLog = weeklyLogs[currentDay] || [];

    counter.textContent = `${currentLog.length} pozycji`;

    if (currentLog.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = currentLog.map(item => `
        <tr class="hover:bg-gray-50 text-gray-700">
            <td class="py-2 px-3 font-medium text-gray-800">${item.name}</td>
            <td class="py-2 px-3 text-right font-semibold">${item.grams}g</td>
            <td class="py-2 px-3 text-right font-bold text-emerald-700">${item.kcal.toFixed(0)} kcal</td>
            <td class="py-2 px-3 text-right text-xs text-gray-500">
                ${item.protein.toFixed(1)} / ${item.fat.toFixed(1)} / ${item.carbs.toFixed(1)} / ${item.fiber.toFixed(1)}
            </td>
            <td class="py-2 px-3 text-center">
                <button onclick="removeMealItem(${item.id})" class="text-rose-500 hover:text-rose-700 p-1 rounded transition" title="Usuń">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function formatNum(val, decimals) {
    if (decimals === 0) {
        return Math.round(val).toLocaleString('pl-PL');
    }
    return val.toFixed(1).replace('.', ',');
}

function openGoalsModal() {
    document.getElementById('goalKcal').value = dailyGoals.kcal;
    document.getElementById('goalProtein').value = dailyGoals.protein;
    document.getElementById('goalFat').value = dailyGoals.fat;
    document.getElementById('goalCarbs').value = dailyGoals.carbs;
    document.getElementById('goalFiber').value = dailyGoals.fiber;

    const modal = document.getElementById('goalsModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeGoalsModal() {
    const modal = document.getElementById('goalsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveGoals(e) {
    e.preventDefault();
    
    dailyGoals.kcal = parseFloat(document.getElementById('goalKcal').value) || 0;
    dailyGoals.protein = parseFloat(document.getElementById('goalProtein').value) || 0;
    dailyGoals.fat = parseFloat(document.getElementById('goalFat').value) || 0;
    dailyGoals.carbs = parseFloat(document.getElementById('goalCarbs').value) || 0;
    dailyGoals.fiber = parseFloat(document.getElementById('goalFiber').value) || 0;

    saveDataToStorage();
    closeGoalsModal();
    renderAll();
}
let houses = {};
let addingHouse = false;
let deletingHouse = false;
let selectedHouse = null;

// زر إضافة بيت
document.getElementById("addHouseBtn").addEventListener("click", () => {
  addingHouse = true;
  alert("اضغط على الخريطة لاختيار مكان البيت الجديد 🏠");
});

// زر حذف بيت
document.getElementById("deleteHouseModeBtn").addEventListener("click", () => {
  deletingHouse = true;
  alert("اضغط على البيت الذي تريد حذفه ❌");
  
});

document.getElementById("countFamiliesBtn").addEventListener("click", () => {
    let totalGreen = 0;
    let totalRed = 0;
  
    for (const houseId in houses) {
      const statuses = houses[houseId].families.map(f => f.status);
      totalGreen += statuses.filter(s => s === "green").length;
      totalRed += statuses.filter(s => s === "red").length;
    }
  
    alert(`إجمالي العائلات ✅ صحيحة: ${totalGreen}\nإجمالي العائلات ❌ خاطئة: ${totalRed}`);
  });
  

// لما تدوس على الخريطة
document.getElementById("map").addEventListener("click", (e) => {
  if (addingHouse) {
    const map = document.getElementById("map");
    const rect = map.getBoundingClientRect();
    const topPercent = ((e.clientY - rect.top) / rect.height) * 100;
    const leftPercent = ((e.clientX - rect.left) / rect.width) * 100;

    const newId = "house" + (Object.keys(houses).length + 1);

    const houseDiv = document.createElement("div");
    houseDiv.className = "house";
    houseDiv.dataset.id = newId;
    houseDiv.style.top = topPercent + "%";
    houseDiv.style.left = leftPercent + "%";
    houseDiv.onclick = () => selectHouse(newId);

    map.appendChild(houseDiv);

    houses[newId] = {
      top: topPercent + "%",
      left: leftPercent + "%",
      families: [
        { name: "عائلة 1", status: null },
        { name: "عائلة 2", status: null },
        { name: "عائلة 3", status: null },
        { name: "عائلة 4", status: null }
      ]
    };

    checkHouseAlert(newId);
    addingHouse = false;
  }
});

// اختيار بيت
function selectHouse(houseId) {
  if (deletingHouse) {
    if (confirm("هل أنت متأكد من حذف هذا البيت؟")) {
      document.querySelector(`[data-id="${houseId}"]`).remove();
      delete houses[houseId];
      saveData();
    }
    deletingHouse = false;
    return;
  }

  selectedHouse = houseId;
  const familiesDiv = document.getElementById("families");
  familiesDiv.innerHTML = "";

  houses[houseId].families.forEach((family, index) => {
    const div = document.createElement("div");
    div.className = "family";

    div.innerHTML = `
      <input type="text" value="${family.name}" 
        onchange="updateFamilyName('${houseId}', ${index}, this.value)" />

      <button class="green ${family.status === "green" ? "selected" : ""}" 
        onclick="updateFamily('${houseId}', ${index}, 'green')">✅</button>

      <button class="red ${family.status === "red" ? "selected" : ""}" 
        onclick="updateFamily('${houseId}', ${index}, 'red')">❌</button>

      <button onclick="deleteFamily('${houseId}', ${index})">🗑️</button>
    `;

    familiesDiv.appendChild(div);
  });

// زر إضافة عائلة
const addBtn = document.createElement("button");
addBtn.textContent = "➕ إضافة عائلة";
addBtn.onclick = () => addFamily(houseId);

// زر تم (لإغلاق النافذة)
const doneBtn = document.createElement("button");
doneBtn.textContent = "✔️ تم";
doneBtn.onclick = () => {
  document.getElementById("families").innerHTML = "";
  selectedHouse = null;
};

// نضيف الزرين
familiesDiv.appendChild(addBtn);
familiesDiv.appendChild(doneBtn);
}

// تعديل اسم العائلة
function updateFamilyName(houseId, index, newName) {
  houses[houseId].families[index].name = newName;
  saveData();
}

// إضافة عائلة
function addFamily(houseId) {
  houses[houseId].families.push({ name: "عائلة جديدة", status: null });
  selectHouse(houseId);
  saveData();
}

// حذف عائلة
function deleteFamily(houseId, index) {
  houses[houseId].families.splice(index, 1);
  selectHouse(houseId);
  saveData();
}

// تحديث حالة العائلة
function updateFamily(houseId, index, status) {
  houses[houseId].families[index].status = status;
  checkHouseAlert(houseId);

  const familyDiv = document.getElementById("families").children[index];
  familyDiv.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));

  if (status === "green") {
    familyDiv.querySelector(".green").classList.add("selected");
  } else {
    familyDiv.querySelector(".red").classList.add("selected");
  }

  saveData();
}

// دالة تحديد لون البيت حسب حالة العائلات
function checkHouseAlert(houseId) {
    const houseDiv = document.querySelector(`[data-id="${houseId}"]`);
    const statuses = houses[houseId].families.map(f => f.status);
  
    const greenCount = statuses.filter(s => s === "green").length;
    const redCount = statuses.filter(s => s === "red").length;
    const total = houses[houseId].families.length;
  
    if (greenCount === total && total > 0) {
      houseDiv.className = "house green";
    } else if (redCount === total && total > 0) {
      houseDiv.className = "house red";
    } else if (greenCount > 0 && redCount > 0) {
      houseDiv.className = "house orange";
    } else {
      houseDiv.className = "house gray";
    }
  }

// زر الحفظ
document.getElementById("saveBtn").addEventListener("click", saveData);

function saveData() {
  localStorage.setItem("housesData", JSON.stringify(houses));
  alert("تم حفظ التغييرات ✅");
}

// تحميل البيانات عند فتح الموقع
window.onload = () => {
  const savedData = localStorage.getItem("housesData");
  if (savedData) {
    houses = JSON.parse(savedData);

    for (const houseId in houses) {
      const houseDiv = document.createElement("div");
      houseDiv.className = "house";
      houseDiv.dataset.id = houseId;
      houseDiv.style.top = houses[houseId].top;
      houseDiv.style.left = houses[houseId].left;
      houseDiv.onclick = () => selectHouse(houseId);

      document.getElementById("map").appendChild(houseDiv);
      checkHouseAlert(houseId);
    }
  }
};

// التكبير و التصغير
const map = document.getElementById("map");
let scale = 1; // التكبير الابتدائي
const scaleStep = 0.1; // مقدار التكبير/التصغير لكل خطوة

map.addEventListener("wheel", (e) => {
  e.preventDefault(); // منع السكروول الافتراضي للصفحة

  if (e.deltaY < 0) {
    // تدوير عجلة الماوس للأعلى → تكبير
    scale += scaleStep;
  } else {
    // تدوير عجلة الماوس للأسفل → تصغير
    scale -= scaleStep;
    if (scale < 0.1) scale = 0.1; // الحد الأدنى للتصغير
  }

  map.style.transform = `scale(${scale})`;
});


// منع الكليك يمين على الصور فقط
document.addEventListener("contextmenu", function(e){
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});
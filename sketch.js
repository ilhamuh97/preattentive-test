const canvas = document.getElementById("canvasId");
const startButton = document.getElementById("start");
const itemNumberSelect = document.getElementById("itemNumber");
const notFindButton = document.getElementById("notFind");
const timeDuration = document.getElementById("timeDuration");
const conjunctive = document.getElementById("isConjunctive");
const distractorFormElem = document.getElementById("distractorForm");
const targetFormElem = document.getElementById("targetForm");
const targetColorSectionElem = document.getElementById("targetColorSection");
const targetColorElem = document.getElementById("targetColor");
const distractorFormSectionElem = document.getElementById(
  "distractorFormSection"
);

var itemNumber = parseInt(itemNumberSelect.value);
var duration = timeDuration.value;
var radius = 10;
var items = [];
var isCanvasHide = false;
var userData = [];
var testRunning = false;
var isTestStart = false;
var targetData = {};
var isConjunctive = conjunctive.checked;
var distractorForm = distractorFormElem.value;
var targetForm = targetFormElem.value;
var targetColorSection = targetColorSectionElem.value;
var targetColor = targetColorElem.value;
var distractorFormSection = distractorFormSectionElem.value;
var colors = ["red", "blue", "green"];
var forms = ["circle", "rectangle", "triangle"];
var feature = "";
var attempts = [];
/*
Chart Setup
*/
const data = {};

const config = {
  type: "line",
  data: data,
  options: {},
};

const chart = new Chart(document.getElementById("myChart"), config);

function getRandomIndex(max) {
  return Math.round(Math.random() * max);
}

function setup() {
  const myCanvas = createCanvas(500, 500);
  myCanvas.parent("#canvasId");
  if (isTestStart) {
    while (items.length < itemNumber) {
      let x = positionHandler(random(width), width, radius);
      let y = positionHandler(random(height), height, radius);
      let itemAtt = {};
      itemAtt = {
        x: x,
        y: y,
        w: radius * 2,
        h: radius * 2,
        r: radius,
      };
      let isOverlap = false;
      for (let j = 0; j < items.length; j++) {
        let otherItem = items[j];
        let d = dist(itemAtt.x, itemAtt.y, otherItem.x, otherItem.y);
        if (d < itemAtt.r * Math.sqrt(2) + otherItem.r * Math.sqrt(2)) {
          isOverlap = true;
          break;
        }
      }
      if (!isOverlap) {
        items.push(itemAtt);
      }
    }
    drawItems();
    hideCanvas();
  }
}

function draw() {}

function positionHandler(value, position, radius) {
  if (value < 10) {
    value += 10;
  } else if (value > position - radius) {
    value -= 10;
  }
  return value;
}

function hideCanvas() {
  setTimeout(() => {
    setCanvasHide();
    testRunning = false;
  }, duration);
}

function createForm(formStr, item) {
  if (formStr === "circle") {
    rect(item.x, item.y, item.w, item.h, 100);
  } else if (formStr === "rectangle") {
    rect(item.x, item.y, item.w, item.h, 0);
  } else if (formStr === "triangle") {
    const x = item.x;
    const y = item.y;
    const r = item.r;
    triangle(x, y - r, x - r, y + r, x + r, y + r);
  }
}

function fillColor(color, isTarget) {
  let value = 255;
  if (!isTarget) {
    value = 125;
  }
  if (color === "red") {
    fill(value, 0, 0);
  } else if (color === "green") {
    fill(0, value, 0);
  } else {
    fill(0, 0, value);
  }
}

function drawItems() {
  const colorIndex = getRandomIndex(colors.length - 1);
  items.map((item, i) => {
    noStroke();
    rectMode(CENTER);
    let distracorData = {};
    if (!isConjunctive) {
      if (i === 0) {
        targetData = {
          x: item.x,
          y: item.y,
          color: colors[colorIndex],
          shape:
            targetForm === "random"
              ? forms[getRandomIndex(forms.length - 1)]
              : targetForm,
        };
        fillColor(targetData.color, true);
        createForm(targetData.shape, item);
      } else {
        distracorData = {
          x: item.x,
          y: item.y,
          color: colors[colorIndex],
          shape: distractorForm,
        };
        if (distracorData.shape === "mix") {
          const newForms = forms.filter((v) => v !== targetForm);
          const distractorFormIndex = getRandomIndex(newForms.length - 1);
          newDistractorForm = newForms[distractorFormIndex];
          distracorData.shape = newDistractorForm;
        }

        //Features handler
        if (targetData.shape === distracorData.shape) {
          fillColor(distracorData.color, false);
          feature = "Color";
        } else {
          fillColor(distracorData.color, true);
          if (distractorForm === "mix") {
            feature = "Mix shape";
          } else {
            feature = "Shape";
          }
        }
        createForm(distracorData.shape, item);
      }
    } else {
      //Type of feature
      feature = "Conjunction";
      if (i === 0) {
        targetData = {
          x: item.x,
          y: item.y,
          color: targetColor,
          shape:
            targetForm === "random"
              ? forms[getRandomIndex(forms.length - 1)]
              : targetForm,
        };
        fillColor(targetData.color, true);
        createForm(targetData.shape, item);
      } else {
        const newColorIndex = getRandomIndex(colors.length - 1);
        const distractorColor = colors[newColorIndex];
        let newDistractorForm = "";
        if (targetColor === colors[newColorIndex]) {
          const newForms = forms.filter((v) => v !== targetForm);
          const distractorFormIndex = getRandomIndex(newForms.length - 1);
          newDistractorForm = newForms[distractorFormIndex];
        } else {
          const distractorFormIndex = getRandomIndex(forms.length - 1);
          newDistractorForm = forms[distractorFormIndex];
        }
        distracorData = {
          x: item.x,
          y: item.y,
          color: distractorColor,
          shape: newDistractorForm,
        };
        fillColor(distracorData.color, true);
        createForm(distracorData.shape, item);
      }
    }
  });
}

function mousePressed() {
  // Check if mouse is inside the circle
  if (
    isCanvasHide &&
    mouseX >= 0 &&
    mouseY <= height &&
    mouseX <= width &&
    mouseY >= 0
  ) {
    fill(0, 0, 0, 0);
    stroke("#000");
    strokeWeight(2);
    ellipse(mouseX, mouseY, radius * 2, radius * 2);
    canvas.style.visibility = "unset";
    setCanvasShow();
    clickedCoordinate = {
      found: true,
      x: mouseX,
      y: mouseY,
      diff: {
        x: Math.abs(mouseX - targetData.x),
        y: Math.abs(mouseY - targetData.y),
      },
      testSetup: {
        itemNumber: itemNumber,
        duration: duration,
        feature: feature,
      },
      targetData: targetData,
    };
    userData.push(clickedCoordinate);
    startButton.disabled = false;
    updateChart();
    //console.log(userData);
  }
}

startButton.addEventListener("click", () => {
  items = [];
  colorMode(RGB);
  background(255, 255, 255);
  isTestStart = true;
  setCanvasShow();
  if (!testRunning) {
    testRunning = true;
    startButton.disabled = true;
    setTimeout(() => {
      setup();
    }, 1000);
  }
});

itemNumberSelect.addEventListener("change", (e) => {
  itemNumber = parseInt(e.target.value);
});

timeDuration.addEventListener("change", (e) => {
  duration = e.target.value;
});

conjunctive.addEventListener("change", (e) => {
  isConjunctive = e.target.checked;
  targetColorSectionElem.hidden = !targetColorSectionElem.hidden;
  distractorFormSectionElem.hidden = !distractorFormSectionElem.hidden;
  if (e.target.checked) {
    targetFormElem.options.forEach((opt) => {
      if (opt.value === "random") {
        opt.disabled = true;
      }
    });
  }
});

targetColorElem.addEventListener("change", (e) => {
  targetColor = e.target.value;
});

distractorFormElem.addEventListener("change", (e) => {
  distractorForm = e.target.value;
  if (distractorForm === "mix") {
    targetFormElem.options.forEach((opt) => {
      if (opt.value === "random") {
        opt.disabled = true;
      }
    });
  } else {
    targetFormElem.options.forEach((opt) => {
      if (opt.value === "random") {
        opt.disabled = false;
      }
    });
  }
});

targetFormElem.addEventListener("change", (e) => {
  targetForm = e.target.value;
  if (e.target.value === "random") {
    distractorFormElem.options.forEach((opt) => {
      if (opt.value === "mix") {
        opt.disabled = true;
      }
    });
  } else {
    distractorFormElem.options.forEach((opt) => {
      if (opt.value === "mix") {
        opt.disabled = false;
      }
    });
  }
});

notFindButton.addEventListener("click", (e) => {
  if (isCanvasHide) {
    setCanvasShow();
    clickedCoordinate = {
      found: false,
      testSetup: {
        itemNumber: itemNumber,
        duration: duration,
        feature: feature,
      },
      targetData: targetData,
    };
    userData.push(clickedCoordinate);
    updateChart();
    startButton.disabled = false;
    // console.log(userData);
  }
});

function setCanvasHide() {
  isCanvasHide = true;
  canvas.style.visibility = "hidden";
  notFindButton.disabled = false;
}

function setCanvasShow() {
  isCanvasHide = false;
  canvas.style.visibility = "unset";
  notFindButton.disabled = true;
}

function getResultData(feature, duration, distractorNumber) {
  const filters = {
    itemNumber: distractorNumber,
    duration: duration,
    feature: feature,
  };
  let result = {
    title: feature + ", " + itemNumber + ", " + duration + "ms",
    data: [],
    try: [],
  };
  let foundIndex = 0;
  userData.map((ud) => {
    let found = false;
    //console.log(ud);
    for (let key in filters) {
      // console.log("key: ", key, " ud setup key: ", ud.testSetup[key], " filters key: ", filters[key]);
      if (
        ud.testSetup[key] === undefined ||
        ud.testSetup[key] != filters[key]
      ) {
        found = false;
        break;
      } else {
        found = true;
      }
    }
    if (found) {
      if (ud.found) {
        result.data.push(
          Math.sqrt(Math.pow(ud.diff.x, 2) + Math.pow(ud.diff.y, 2))
        );
      } else {
        result.data.push(null);
      }
      result.try.push("Try " + (foundIndex + 1));
      foundIndex++;
    }
  });
  return result;
}

function updateChart() {
  // console.log(getResultData(feature, duration, itemNumber));
  // console.log(chart.data);
  // console.log(chart.data);
  // console.log(getResultData(feature, duration, itemNumber).title);
  if (
    chart.data.labels.length <
    getResultData(feature, duration, itemNumber).try.length
  ) {
    chart.data.labels = getResultData(feature, duration, itemNumber).try;
  }
  const datasetIndex = chart.data.datasets.findIndex(
    (dataset) =>
      dataset.label === getResultData(feature, duration, itemNumber).title
  );
  if (datasetIndex >= 0) {
    chart.data.datasets[datasetIndex].data = [
      ...getResultData(feature, duration, itemNumber).data,
    ];
  } else {
    r = random(50, 255); // r is a random number between 50 - 255
    g = random(50, 255); // g is a random number betwen 50 - 200
    b = random(50, 255); // b is a random number between 50 - 100
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    chart.data.datasets.push({
      label: getResultData(feature, duration, itemNumber).title,
      backgroundColor: rgbStr,
      borderColor: rgbStr,
      data: getResultData(feature, duration, itemNumber).data,
    });
  }

  chart.update();
}

function navigateToMain() {
  window.location.hash = "#main";
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
}

function goBackToLanding() {
  window.location.hash = "";
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("landingPage").style.display = "flex";
}

// Auto-redirect
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#main") {
    navigateToMain();
  }

  // Load chart data from localStorage
  const storedResults = localStorage.getItem("chartData");
  if (storedResults) {
    const { labels, data } = JSON.parse(storedResults);
    renderChart(labels, data);
  }
});

function saveResultsToLocalStorage(labels, data) {
  localStorage.setItem("chartData", JSON.stringify({ labels, data }));
}

function renderChart(labels, data) {
  const ctx = document.getElementById("myChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Reaction Time (ms)",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateConfigSummary() {
  const isConjunctive = document.getElementById("isConjunctive").checked;
  const targetForm = document.getElementById("targetForm").value;
  const distractorFormElem = document.getElementById("distractorForm");
  const distractorFormSection = document.getElementById(
    "distractorFormSection"
  );
  const distractorForm = distractorFormSection.hidden
    ? "random"
    : distractorFormElem.value;

  const targetColorElem = document.getElementById("targetColor");
  const targetColorSection = document.getElementById("targetColorSection");
  const targetColor = targetColorSection.hidden
    ? "random"
    : targetColorElem.value;

  const itemNumber = document.getElementById("itemNumber").value;
  const duration = document.getElementById("timeDuration").value;

  const summaryList = document.getElementById("summaryList");
  summaryList.innerHTML = `
    <li>Conjunctive: <strong>${
      isConjunctive ? "Enabled" : "Disabled"
    }</strong></li>
    <li>Target Form: <strong>${targetForm}</strong></li>
    <li>Target Color: <strong>${targetColor}</strong></li>
    <li>Distractor Form: <strong>${distractorForm}</strong></li>
    <li>Distraction Number: <strong>${itemNumber}</strong></li>
    <li>Time Duration: <strong>${duration} ms</strong></li>
  `;
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 768) {
    document.getElementById("mobileWarning").classList.remove("d-none");
  }
});

// Attach listeners
document.querySelectorAll("select, #isConjunctive").forEach((elem) => {
  elem.addEventListener("change", () => {
    elem.classList.add("highlight");
    updateConfigSummary();
  });
});

// Initialize summary on load
document.addEventListener("DOMContentLoaded", updateConfigSummary);

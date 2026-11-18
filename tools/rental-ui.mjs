import { FIELDS, calculateRental, compareRentals } from "./rental-math.mjs";
const $ = (id) => document.getElementById(id);
const strings = {
  ru: {
    title: "Посчитать аренду",
    intro: "Все суммы — в батах. Условия берём из договора.",
    compare: "Сравнить",
    comparison: "Сравнение квартир",
    example:
      "Показан пример, не рыночные тарифы. Измените все условия под свою квартиру.",
    result: "Ваш расчёт",
    utilities: "Коммунальные и доплаты",
    unknown: "Не знаете значение — оставьте пустым. Нет платежа — укажите 0.",
    advanceNote:
      "Предоплата — вся аренда, которую платите при въезде, включая первый месяц. Ещё раз аренду к ней не прибавляем.",
    edit: "Изменить условия",
    export: "Сохранить картинкой",
    reset: "Очистить квартиру",
    demo: "Загрузить пример",
    imageHint:
      "Если файл не скачался, удерживайте изображение и сохраните его.",
    download: "Скачать PNG",
    privacy: "Расчёт сохраняется только в этом браузере. Без регистрации.",
    depositNote:
      "Депозит показан отдельно: его возврат зависит от договора и состояния жилья. Коммунальные — оценка по вашему расходу.",
    apartment: "Квартира",
    upfront: "При въезде",
    monthly: "В месяц · примерно",
    deposit: "Возвратный депозит",
    partial: "Неполная сумма. Не указано:",
    invalid:
      "Введите числа от 0 до 1 000 000, максимум 2 знака после запятой.",
    fix: "Исправьте отмеченные поля.",
    equal: "Ежемесячные расходы одинаковые.",
    difference: "Разница за месяц (B − A):",
    entryDifference: "Разница при въезде (B − A):",
    incomplete:
      "Заполните все ежемесячные условия обеих квартир для сравнения.",
    confirm: "Очистить условия этой квартиры?",
    exportError: "Не удалось создать изображение. Попробуйте ещё раз.",
    localOnly:
      "Браузер не разрешил сохранение. Расчёт доступен до закрытия страницы.",
    imageReady: "Изображение готово. Копия доступна ниже.",
    theme: "Сменить тему",
    fields: [
      "Аренда / месяц",
      "Депозит · сумма",
      "Аренда при въезде · включая первый месяц",
      "Разовые платежи при въезде",
      "Электричество · бат за кВт·ч",
      "Расход · кВт·ч в месяц",
      "Вода / месяц",
      "Интернет / месяц",
      "Другие платежи / месяц",
    ],
  },
  en: {
    title: "Calculate rent",
    intro: "All amounts are in Thai baht. Use the terms in your contract.",
    compare: "Compare",
    comparison: "Compare apartments",
    example:
      "Example figures, not market rates. Replace every term with your own.",
    result: "Your estimate",
    utilities: "Utilities and extras",
    unknown: "Unknown? Leave blank. No charge? Enter 0.",
    advanceNote:
      "Rent paid on entry includes the first month and any further advance rent. We do not add the first month again.",
    edit: "Edit terms",
    export: "Save as image",
    reset: "Clear apartment",
    demo: "Load example",
    imageHint:
      "If the download did not start, touch and hold the image to save it.",
    download: "Download PNG",
    privacy: "Saved only in this browser. No registration.",
    depositNote:
      "Deposit is separate. Refund depends on your contract and property condition. Utilities are estimates based on your usage.",
    apartment: "Apartment",
    upfront: "Due on entry",
    monthly: "Per month · estimated",
    deposit: "Refundable deposit",
    partial: "Incomplete subtotal. Missing:",
    invalid: "Enter numbers from 0 to 1,000,000 with up to 2 decimal places.",
    fix: "Correct the highlighted fields.",
    equal: "Monthly costs are equal.",
    difference: "Monthly difference (B − A):",
    entryDifference: "Entry difference (B − A):",
    incomplete: "Complete monthly terms for both apartments to compare.",
    confirm: "Clear this apartment’s terms?",
    exportError: "Could not create the image. Please try again.",
    localOnly:
      "Browser storage is unavailable. Your calculation lasts until this page closes.",
    imageReady: "Image ready. A copy is shown below.",
    theme: "Change theme",
    fields: [
      "Rent / month",
      "Deposit · amount",
      "Rent paid on entry · includes first month",
      "One-off entry charges",
      "Electricity · THB per kWh",
      "Usage · kWh per month",
      "Water / month",
      "Internet / month",
      "Other monthly charges",
    ],
  },
  th: {
    title: "คำนวณค่าเช่า",
    intro: "ทุกจำนวนเป็นเงินบาท ใช้เงื่อนไขจากสัญญา",
    compare: "เปรียบเทียบ",
    comparison: "เปรียบเทียบห้องพัก",
    example: "ตัวเลขตัวอย่าง ไม่ใช่ราคาตลาด โปรดเปลี่ยนตามเงื่อนไขจริง",
    result: "ผลคำนวณ",
    utilities: "ค่าน้ำไฟและค่าใช้จ่ายอื่น",
    unknown: "ไม่ทราบให้เว้นว่าง หากไม่มีค่าใช้จ่ายให้ใส่ 0",
    advanceNote: "ค่าเช่าที่จ่ายวันเข้าอยู่รวมเดือนแรกและค่าเช่าล่วงหน้าแล้ว จะไม่บวกเดือนแรกซ้ำ",
    edit: "แก้ไขเงื่อนไข",
    export: "บันทึกเป็นรูปภาพ",
    reset: "ล้างข้อมูลห้อง",
    demo: "โหลดตัวอย่าง",
    imageHint: "หากดาวน์โหลดไม่สำเร็จ ให้แตะรูปภาพค้างไว้เพื่อบันทึก",
    download: "ดาวน์โหลด PNG",
    privacy: "บันทึกเฉพาะในเบราว์เซอร์นี้ ไม่ต้องสมัครสมาชิก",
    depositNote:
      "แสดงเงินประกันแยกต่างหาก การคืนขึ้นอยู่กับสัญญาและสภาพห้อง ค่าน้ำไฟเป็นประมาณการตามการใช้งาน",
    apartment: "ห้อง",
    upfront: "จ่ายวันเข้าอยู่",
    monthly: "ต่อเดือน · ประมาณ",
    deposit: "เงินประกันที่คืนได้ตามเงื่อนไข",
    partial: "ยอดยังไม่ครบ ขาดข้อมูล:",
    invalid: "ใส่ตัวเลข 0 ถึง 1,000,000 ทศนิยมไม่เกิน 2 ตำแหน่ง",
    fix: "แก้ไขช่องที่ระบุ",
    equal: "ค่าใช้จ่ายต่อเดือนเท่ากัน",
    difference: "ส่วนต่างต่อเดือน (B − A):",
    entryDifference: "ส่วนต่างวันเข้าอยู่ (B − A):",
    incomplete: "กรอกค่าใช้จ่ายรายเดือนของทั้งสองห้องให้ครบเพื่อเปรียบเทียบ",
    confirm: "ล้างข้อมูลห้องนี้หรือไม่?",
    exportError: "สร้างรูปภาพไม่สำเร็จ โปรดลองอีกครั้ง",
    localOnly: "เบราว์เซอร์บันทึกไม่ได้ ข้อมูลจะอยู่จนกว่าจะปิดหน้านี้",
    imageReady: "รูปภาพพร้อมแล้ว ดูสำเนาด้านล่าง",
    theme: "เปลี่ยนธีม",
    fields: [
      "ค่าเช่าต่อเดือน",
      "เงินประกัน",
      "ค่าเช่าจ่ายวันเข้าอยู่ · รวมเดือนแรก",
      "ค่าใช้จ่ายครั้งเดียววันเข้าอยู่",
      "ค่าไฟ · บาทต่อหน่วย kWh",
      "การใช้ไฟ · kWh ต่อเดือน",
      "ค่าน้ำต่อเดือน",
      "อินเทอร์เน็ตต่อเดือน",
      "ค่าใช้จ่ายอื่นต่อเดือน",
    ],
  },
};
const blank = () => Object.fromEntries(FIELDS.map((k) => [k, ""]));
const examples = {
  A: {
    rent: "12000",
    deposit: "24000",
    advance: "12000",
    once: "500",
    powerRate: "7",
    powerUse: "200",
    water: "300",
    internet: "500",
    other: "0",
  },
  B: {
    rent: "13000",
    deposit: "26000",
    advance: "13000",
    once: "0",
    powerRate: "5",
    powerUse: "100",
    water: "0",
    internet: "500",
    other: "0",
  },
};
let state = { A: { ...examples.A }, B: { ...examples.B } },
  sample = { A: true, B: true },
  active = "A",
  lang = "ru",
  theme = "dark",
  example = true,
  comparing = false,
  imageUrl;
try {
  const saved = JSON.parse(localStorage.getItem("okok_rental_v1") || "null");
  if (saved && saved.A && saved.B) {
    for (const key of ["A", "B"])
      for (const f of FIELDS)
        state[key][f] =
          typeof saved[key][f] === "string" ? saved[key][f].slice(0, 32) : "";
    sample = saved.sample || { A: false, B: false };
    example = sample.A;
  }
  const l = localStorage.getItem("okok_lang");
  if (strings[l]) lang = l;
  theme =
    localStorage.getItem("okok_rental_theme") === "light" ? "light" : "dark";
} catch {}
const t = (key) => strings[lang][key];
const money = (n) =>
  new Intl.NumberFormat(
    lang === "th" ? "th-TH" : lang === "ru" ? "ru-RU" : "en-GB",
    { style: "currency", currency: "THB", maximumFractionDigits: 2 },
  ).format(n);
function persist() {
  try {
    localStorage.setItem(
      "okok_rental_v1",
      JSON.stringify({ ...state, sample }),
    );
    localStorage.setItem("okok_lang", lang);
    localStorage.setItem("okok_rental_theme", theme);
  } catch {
    $("status").textContent = t("localOnly");
  }
}
function hideImage() {
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = null;
  $("resultImage").removeAttribute("src");
  $("imageFallback").hidden = true;
}
function lines(result) {
  if (result.invalid.length) return [t("fix")];
  const rows = [t("upfront"), money(result.upfront)];
  if (result.upfrontMissing.length)
    rows.push(
      t("partial") +
        " " +
        result.upfrontMissing
          .map((k) => strings[lang].fields[FIELDS.indexOf(k)])
          .join(", "),
    );
  rows.push(
    t("deposit") +
      ": " +
      (result.deposit === null ? "—" : money(result.deposit)),
    t("monthly"),
    money(result.monthly),
  );
  if (result.monthlyMissing.length)
    rows.push(
      t("partial") +
        " " +
        result.monthlyMissing
          .map((k) => strings[lang].fields[FIELDS.indexOf(k)])
          .join(", "),
    );
  return rows;
}
function appendText(parent, tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.append(node);
  return node;
}
function paintResult(parent, result) {
  const rows = lines(result);
  rows.forEach((s, i) =>
    appendText(
      parent,
      "p",
      s,
      i === 1 ||
        (!result.invalid.length && s === money(result.monthly) && i > 2)
        ? "amount"
        : "",
    ),
  );
}
function comparisonLines() {
  const a = calculateRental(state.A),
    b = calculateRental(state.B),
    diff = compareRentals(a, b);
  const rows = [
    diff === null
      ? t("incomplete")
      : diff === 0
        ? t("equal")
        : t("difference") + " " + money(diff),
  ];
  if (
    !a.invalid.length &&
    !b.invalid.length &&
    !a.upfrontMissing.length &&
    !b.upfrontMissing.length
  )
    rows.push(t("entryDifference") + " " + money(b.upfront - a.upfront));
  return rows;
}
function update() {
  const result = calculateRental(state[active]);
  $("totals").replaceChildren();
  paintResult($("totals"), result);
  $("error").textContent = result.invalid.length ? t("invalid") : "";
  for (const f of FIELDS)
    $("f-" + f).setAttribute(
      "aria-invalid",
      String(result.invalid.includes(f)),
    );
  $("export").disabled =
    Boolean(result.invalid.length) ||
    (comparing &&
      Boolean(
        calculateRental(state.A).invalid.length ||
        calculateRental(state.B).invalid.length,
      ));
  if (comparing) {
    $("comparisonBody").replaceChildren();
    for (const key of ["A", "B"]) {
      const article = document.createElement("article");
      appendText(article, "h3", t("apartment") + " " + key);
      paintResult(article, calculateRental(state[key]));
      $("comparisonBody").append(article);
    }
    for (const row of comparisonLines())
      appendText($("comparisonBody"), "p", row);
  }
}
function render() {
  example = comparing ? sample.A || sample.B : sample[active];
  document.documentElement.lang = lang;
  document.documentElement.dataset.theme = theme;
  document.title = "OK-OK · " + t("title");
  document
    .querySelectorAll("[data-t]")
    .forEach((n) => (n.textContent = t(n.dataset.t)));
  $("theme").setAttribute("aria-label", t("theme"));
  $("lang").textContent = lang === "ru" ? "EN" : lang === "en" ? "TH" : "RU";
  $("baseFields").replaceChildren();
  $("utilityFields").replaceChildren();
  FIELDS.forEach((f, i) => {
    const wrap = document.createElement("div");
    const label = appendText(wrap, "label", strings[lang].fields[i]);
    label.htmlFor = "f-" + f;
    const input = document.createElement("input");
    input.id = "f-" + f;
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.maxLength = 32;
    input.value = state[active][f];
    input.setAttribute("aria-describedby", "error");
    input.addEventListener("input", () => {
      state[active][f] = input.value;
      sample[active] = false;
      example = false;
      $("example").hidden = true;
      hideImage();
      persist();
      update();
    });
    wrap.append(input);
    $(i < 4 ? "baseFields" : "utilityFields").append(wrap);
  });
  $("apartment").textContent = t("apartment") + " " + active;
  $("example").hidden = !example;
  $("editor").hidden = comparing;
  $("comparison").hidden = !comparing;
  $("result-title").textContent = t("result") + " · " + active;
  for (const key of ["A", "B"]) {
    $("tab" + key).textContent = t("apartment") + " " + key;
    $("tab" + key).setAttribute(
      "aria-pressed",
      String(active === key && !comparing),
    );
  }
  $("compare").setAttribute("aria-pressed", String(comparing));
  $("reset").hidden = comparing;
  $("demo").hidden = comparing;
  update();
}
for (const key of ["A", "B"])
  $("tab" + key).onclick = () => {
    active = key;
    comparing = false;
    hideImage();
    render();
  };
$("compare").onclick = () => {
  comparing = true;
  hideImage();
  render();
};
$("edit").onclick = () => {
  comparing = false;
  hideImage();
  render();
};
$("rentalForm").onsubmit = (e) => e.preventDefault();
$("lang").onclick = () => {
  lang = lang === "ru" ? "en" : lang === "en" ? "th" : "ru";
  hideImage();
  persist();
  render();
};
$("theme").onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  persist();
  render();
};
$("reset").onclick = () => {
  if (confirm(t("confirm"))) {
    state[active] = blank();
    sample[active] = false;
    example = false;
    hideImage();
    persist();
    render();
  }
};
$("demo").onclick = () => {
  state[active] = { ...examples[active] };
  sample[active] = true;
  example = true;
  hideImage();
  persist();
  render();
};
$("export").onclick = async () => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    const text = [
      "OK-OK · " + t("title"),
      ...["A", "B"]
        .filter((k) => comparing || k === active)
        .flatMap((k) => [
          t("apartment") + " " + k,
          ...lines(calculateRental(state[k])),
          ...FIELDS.map(
            (f, i) => strings[lang].fields[i] + ": " + (state[k][f] || "—"),
          ),
        ]),
      ...(comparing ? comparisonLines() : []),
      t("depositNote"),
      ...(example ? [t("example")] : []),
    ];
    const ctx = canvas.getContext("2d");
    ctx.font = "28px system-ui";
    const wrapped = [];
    for (const row of text) {
      let line = "";
      for (const char of row) {
        if (ctx.measureText(line + char).width > 880) {
          wrapped.push(line);
          line = "";
        }
        line += char;
      }
      wrapped.push(line, "");
    }
    canvas.height = 100 + wrapped.length * 42;
    ctx.fillStyle = "#0b1b3a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "28px system-ui";
    ctx.fillStyle = "#f4f8fc";
    wrapped.forEach((s, i) => ctx.fillText(s, 60, 65 + i * 42));
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("PNG");
    hideImage();
    imageUrl = URL.createObjectURL(blob);
    $("resultImage").src = imageUrl;
    $("resultImage").alt = t("title");
    $("imageDownload").href = imageUrl;
    $("imageFallback").hidden = false;
    $("imageDownload").click();
    $("status").textContent = t("imageReady");
  } catch {
    $("status").textContent = t("exportError");
  }
};
render();

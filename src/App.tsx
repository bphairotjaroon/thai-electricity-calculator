import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calculator,
  CircleDollarSign,
  Info,
  Leaf,
  Lightbulb,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

type Page = "calculator" | "bill" | "analysis" | "rates";

type ApplianceCategory =
  | "air-conditioner"
  | "refrigerator"
  | "television"
  | "washing-machine"
  | "microwave"
  | "computer"
  | "lighting"
  | "other";

type AirConditionerType = "inverter" | "fixed-speed" | "other";

type Appliance = {
  id: number;
  name: string;
  category: ApplianceCategory;
  icon: string;
  brand: string;
  model: string;
  capacity: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  daysPerMonth: number;
  airConditionerType?: AirConditionerType;
  btu?: number;
  purchaseDate: string;
  installationDate: string;
  warrantyExpiryDate: string;
  nextInspectionDate: string;
  nextServiceDate: string;
  notes: string;
};

type StatusTone = "neutral" | "danger" | "warning" | "success";


// Fix legacy UTF-8/Latin-1 mojibake that can appear when the dev server/browser
// serves a previously mis-decoded bundle. Correct Thai text is left unchanged.
const repairMojibake = (value: string): string => {
  if (!/[àÂÃÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßâð]/.test(value)) return value;
  try {
    const repaired = decodeURIComponent(escape(value));
    return repaired.includes("�") ? value : repaired;
  } catch {
    return value;
  }
};

const makeAppliance = (
  data: Partial<Appliance> & Pick<Appliance, "name" | "category" | "icon" | "watts">,
): Appliance => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  name: repairMojibake(data.name),
  category: data.category,
  icon: data.icon,
  brand: repairMojibake(data.brand ?? ""),
  model: repairMojibake(data.model ?? ""),
  capacity: repairMojibake(data.capacity ?? ""),
  watts: data.watts,
  quantity: data.quantity ?? 1,
  hoursPerDay: data.hoursPerDay ?? 4,
  daysPerMonth: data.daysPerMonth ?? 30,
  airConditionerType: data.airConditionerType,
  btu: data.btu,
  purchaseDate: data.purchaseDate ?? "",
  installationDate: data.installationDate ?? "",
  warrantyExpiryDate: data.warrantyExpiryDate ?? "",
  nextInspectionDate: data.nextInspectionDate ?? "",
  nextServiceDate: data.nextServiceDate ?? "",
  notes: repairMojibake(data.notes ?? ""),
});

const initialAppliances: Appliance[] = [
  makeAppliance({
    id: 1,
    name: "เครื่องปรับอากาศห้องนอน",
    category: "air-conditioner",
    icon: "❄️",
    capacity: "12,000 BTU",
    watts: 1200,
    hoursPerDay: 8,
    daysPerMonth: 30,
    airConditionerType: "inverter",
    btu: 12000,
  }),
  makeAppliance({
    id: 2,
    name: "ตู้เย็น",
    category: "refrigerator",
    icon: "🧊",
    capacity: "ประมาณ 10 คิว",
    watts: 150,
    hoursPerDay: 24,
    daysPerMonth: 30,
  }),
  makeAppliance({
    id: 3,
    name: "โทรทัศน์",
    category: "television",
    icon: "📺",
    capacity: "55 นิ้ว",
    watts: 120,
    hoursPerDay: 5,
    daysPerMonth: 30,
  }),
];

const appliancePresets = [
  { name: "เครื่องปรับอากาศ", category: "air-conditioner" as const, icon: "❄️", watts: 1200, capacity: "12,000 BTU", btu: 12000 },
  { name: "ตู้เย็น", category: "refrigerator" as const, icon: "🧊", watts: 150, capacity: "ประมาณ 10 คิว" },
  { name: "โทรทัศน์", category: "television" as const, icon: "📺", watts: 120, capacity: "55 นิ้ว" },
  { name: "เครื่องซักผ้า", category: "washing-machine" as const, icon: "🧺", watts: 500, capacity: "" },
  { name: "ไมโครเวฟ", category: "microwave" as const, icon: "🍲", watts: 1000, capacity: "" },
  { name: "คอมพิวเตอร์", category: "computer" as const, icon: "💻", watts: 300, capacity: "" },
  { name: "หลอดไฟ", category: "lighting" as const, icon: "💡", watts: 15, capacity: "" },
];

const getWarrantyStatus = (dateString: string): { label: string; tone: StatusTone } => {
  if (!dateString) return { label: "ยังไม่ระบุวันหมดประกัน", tone: "neutral" };
  const expiryDate = new Date(`${dateString}T23:59:59`);
  if (Number.isNaN(expiryDate.getTime())) return { label: "วันที่ไม่ถูกต้อง", tone: "danger" };

  const diffInDays = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
  if (diffInDays < 0) return { label: "หมดประกันแล้ว", tone: "danger" };
  if (diffInDays <= 30) return { label: "ใกล้หมดประกัน", tone: "warning" };
  return { label: "อยู่ในระยะประกัน", tone: "success" };
};

const getMaintenanceStatus = (dateString: string): { label: string; tone: StatusTone } => {
  if (!dateString) return { label: "ยังไม่กำหนดวันบำรุงรักษา", tone: "neutral" };
  const serviceDate = new Date(`${dateString}T23:59:59`);
  if (Number.isNaN(serviceDate.getTime())) return { label: "วันที่ไม่ถูกต้อง", tone: "danger" };

  const diffInDays = Math.ceil((serviceDate.getTime() - Date.now()) / 86400000);
  if (diffInDays < 0) return { label: "เกินกำหนด", tone: "danger" };
  if (diffInDays <= 30) return { label: "ใกล้ถึงกำหนด", tone: "warning" };
  return { label: "ยังไม่ถึงกำหนด", tone: "success" };
};

const categoryLabel: Record<ApplianceCategory, string> = {
  "air-conditioner": "เครื่องปรับอากาศ",
  refrigerator: "ตู้เย็น",
  television: "โทรทัศน์",
  "washing-machine": "เครื่องซักผ้า",
  microwave: "ไมโครเวฟ",
  computer: "คอมพิวเตอร์",
  lighting: "หลอดไฟ",
  other: "อื่น ๆ",
};

type TariffResult = {
  energyCharge: number;
  serviceCharge: number;
  tariffType: "1.1.1" | "1.1.2";
};

const calculatePEAResidentialTariff = (units: number): TariffResult => {
  const kwh = Math.max(0, units);

  // PEA residential tariff 1.1.1: usage not exceeding 150 kWh/month
  if (kwh <= 150) {
    let energyCharge = Math.min(kwh, 15) * 2.3488;

    if (kwh > 15) {
      energyCharge += Math.min(kwh - 15, 10) * 2.9882;
    }

    if (kwh > 25) {
      energyCharge += Math.min(kwh - 25, 175) * 3.0000;
    }

    return {
      energyCharge,
      serviceCharge: 8.19,
      tariffType: "1.1.1",
    };
  }

  // PEA residential tariff 1.1.2: usage over 150 kWh/month
  let energyCharge = Math.min(kwh, 200) * 3.0000;

  if (kwh > 200) {
    energyCharge += Math.min(kwh - 200, 200) * 4.1584;
  }

  if (kwh > 400) {
    energyCharge += (kwh - 400) * 4.3583;
  }

  return {
    energyCharge,
    serviceCharge: 24.62,
    tariffType: "1.1.2",
  };
};

function App() {
  useEffect(() => {
    const root = document.querySelector(".app");
    if (!root) return;

    const repairTextNodes = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeValue) {
          const repaired = repairMojibake(node.nodeValue);
          if (repaired !== node.nodeValue) node.nodeValue = repaired;
        }
      }

      root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((element) => {
        if (element.value) {
          const repaired = repairMojibake(element.value);
          if (repaired !== element.value) element.value = repaired;
        }
      });
    };

    repairTextNodes();
    const observer = new MutationObserver(repairTextNodes);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const [activePage, setActivePage] = useState<Page>("calculator");
  const [appliances, setAppliances] = useState<Appliance[]>(initialAppliances);
  const [selectedApplianceId, setSelectedApplianceId] = useState<number | null>(null);

  const [ftRate, setFtRate] = useState(0.1623);
  const [vatRate, setVatRate] = useState(7);

  const calculations = useMemo(() => {
    const rows = appliances.map((item) => {
      const safeWatts = Math.max(0, Number(item.watts) || 0);
      const safeHours = Math.max(0, Number(item.hoursPerDay) || 0);
      const safeDays = Math.max(0, Number(item.daysPerMonth) || 0);
      const safeQuantity = Math.max(0, Number(item.quantity) || 0);
      const kwh = (safeWatts / 1000) * safeHours * safeDays * safeQuantity;
      return { ...item, kwh };
    });

    const totalKwh = rows.reduce((sum, row) => sum + row.kwh, 0);
    const tariff = calculatePEAResidentialTariff(totalKwh);
    const energyCharge = tariff.energyCharge;
    const ftCharge = totalKwh * Math.max(0, ftRate);
    const serviceCharge = tariff.serviceCharge;
    const beforeVat = energyCharge + ftCharge + serviceCharge;
    const vat = beforeVat * (Math.max(0, vatRate) / 100);
    const totalBill = beforeVat + vat;

    return {
      rows,
      totalKwh,
      energyCharge,
      ftCharge,
      serviceCharge,
      tariffType: tariff.tariffType,
      beforeVat,
      vat,
      totalBill,
    };
  }, [appliances, ftRate, vatRate]);

  const topAppliances = [...calculations.rows].sort((a, b) => b.kwh - a.kwh).slice(0, 5);
  const selectedAppliance = appliances.find((item) => item.id === selectedApplianceId) ?? null;

  const addAppliance = (preset?: (typeof appliancePresets)[number]) => {
    const fallback = appliancePresets[0];
    const source = preset ?? fallback;
    const next = makeAppliance({
      name: source.name,
      category: source.category,
      icon: source.icon,
      watts: source.watts,
      capacity: source.capacity,
      btu: "btu" in source ? source.btu : undefined,
      airConditionerType: source.category === "air-conditioner" ? "inverter" : undefined,
      hoursPerDay: source.category === "air-conditioner" ? 8 : 4,
      daysPerMonth: 30,
    });
    setAppliances((current) => [...current, next]);
    setSelectedApplianceId(next.id);
  };

  const updateAppliance = <K extends keyof Appliance>(id: number, field: K, value: Appliance[K]) => {
    setAppliances((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeAppliance = (id: number) => {
    setAppliances((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
    setSelectedApplianceId((current) => (current === id ? null : current));
  };

  const resetAll = () => {
    setAppliances(initialAppliances);
    setSelectedApplianceId(null);
    setFtRate(0.1623);
    setVatRate(7);
  };

  const money = (value: number) =>
    value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const percent = (value: number) =>
    calculations.totalKwh > 0 ? (value / calculations.totalKwh) * 100 : 0;

  // Bill page uses the same totalKwh and tariff calculation as the main calculator.
  // This prevents the bill page from drifting to a separate/stale unit value.
  const billEnergyCharge = calculations.energyCharge;
  const billServiceCharge = calculations.serviceCharge;
  const billFtCharge = calculations.ftCharge;
  const billVat = calculations.vat;
  const estimatedBill = calculations.totalBill;

  const chartColors = ["#0f9d8a", "#168acb", "#14b879", "#6366f1", "#f59e0b"];
  let chartCursor = 0;
  const donutGradient = topAppliances.length
    ? topAppliances
        .map((item, index) => {
          const start = chartCursor;
          const end = start + percent(item.kwh);
          chartCursor = end;
          return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
        })
        .join(", ")
    : "#dfe7e5 0% 100%";

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Zap size={25} fill="currentColor" /></div>
          <div>
            <h1>คำนวณค่าไฟฟ้า</h1>
            <p>Smart Energy Dashboard</p>
          </div>
        </div>

        <nav className="top-nav">
          <button className={activePage === "calculator" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("calculator")}>
            <Calculator size={17} /> คำนวณเครื่องใช้ไฟฟ้า
          </button>
          <button className={activePage === "bill" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("bill")}>
            <CircleDollarSign size={17} /> คำนวณบิลค่าไฟ <span className="nav-unit-badge">{calculations.totalKwh.toFixed(0)} u.</span>
          </button>
          <button className={activePage === "analysis" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("analysis")}>
            <BarChart3 size={17} /> เปรียบเทียบการใช้ไฟ
          </button>
          <button className={activePage === "rates" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("rates")}>
            <Lightbulb size={17} /> เคล็ดลับ/อัตราค่าไฟ
          </button>
        </nav>
      </header>

      <main className="content">
        <section className="page-heading">
          <div>
            <h2>
              {activePage === "calculator" ? "คำนวณค่าไฟฟ้า" : activePage === "bill" ? "คำนวณบิลค่าไฟ" : activePage === "analysis" ? "เปรียบเทียบการใช้ไฟ" : "เคล็ดลับและอัตราค่าไฟฟ้า"}
            </h2>
            <p>
              {activePage === "calculator"
                ? "เพิ่มเครื่องใช้ไฟฟ้าและดูค่าไฟโดยประมาณแบบเรียลไทม์"
                : activePage === "bill"
                  ? "ใช้หน่วยจากรายการเครื่องใช้ไฟฟ้าเพื่อคำนวณบิลโดยอัตโนมัติ"
                  : activePage === "analysis"
                    ? "ดูสัดส่วนและจัดอันดับเครื่องใช้ไฟฟ้าที่ใช้พลังงานมากที่สุด"
                    : "ดูคำแนะนำประหยัดพลังงานและกำหนดอัตราสำหรับการคำนวณ"}
            </p>
          </div>
          <button className="reset-button" onClick={resetAll}><RefreshCw size={16} /> รีเซ็ต</button>
        </section>

        <section className="summary-grid">
          <div className="summary-card energy-summary">
            <div className="summary-icon blue"><Zap size={21} /></div>
            <div><span>พลังงานรวม</span><strong>{calculations.totalKwh.toFixed(1)} kWh</strong><small>ต่อเดือน</small></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon green"><CircleDollarSign size={21} /></div>
            <div><span>ค่าไฟประมาณ</span><strong>฿{money(calculations.totalBill)}</strong><small>รวม VAT {vatRate}%</small></div>
          </div>
          <div className="summary-card action-card">
            <div className="summary-icon orange"><Calculator size={21} /></div>
            <div><span>คำนวณอัตราใหม่</span><strong>ปรับค่าการคำนวณ</strong><button onClick={() => setActivePage("rates")}>ตั้งค่าอัตราค่าไฟ</button></div>
          </div>
        </section>

        {activePage === "calculator" && (
          <>
            <section className="dashboard-grid">
              <div className="panel appliance-panel">
                <div className="panel-header">
                  <div><h3>รายการเครื่องใช้ไฟฟ้า</h3><p>{calculations.rows.length} รายการ · คลิกปุ่มรายละเอียดเพื่อแก้ข้อมูลเครื่อง</p></div>
                  <button className="add-button" onClick={() => addAppliance()}><Plus size={17} /> เพิ่มเครื่องใช้ไฟฟ้า</button>
                </div>

                <div className="preset-row">
                  {appliancePresets.slice(0, 5).map((preset) => (
                    <button key={preset.name} className="preset-button" onClick={() => addAppliance(preset)}>{preset.icon} {preset.name}</button>
                  ))}
                </div>

                <div className="table-head">
                  <span>เครื่องใช้ไฟฟ้า</span><span>กำลังไฟ (W)</span><span>ชม./วัน</span><span>วัน/เดือน</span><span>จำนวน</span><span>kWh/เดือน</span><span></span>
                </div>

                <div className="appliance-list">
                  {calculations.rows.map((item) => (
                    <div className="appliance-row" key={item.id}>
                      <div className="appliance-name">
                        <div className="appliance-icon">{item.icon}</div>
                        <input value={item.name} onChange={(e) => updateAppliance(item.id, "name", e.target.value)} />
                      </div>
                      <input type="number" min="0" value={item.watts} onChange={(e) => updateAppliance(item.id, "watts", Math.max(0, Number(e.target.value)))} />
                      <input type="number" min="0" max="24" step="0.5" value={item.hoursPerDay} onChange={(e) => updateAppliance(item.id, "hoursPerDay", Math.max(0, Math.min(24, Number(e.target.value))))} />
                      <input type="number" min="0" max="31" value={item.daysPerMonth} onChange={(e) => updateAppliance(item.id, "daysPerMonth", Math.max(0, Math.min(31, Number(e.target.value))))} />
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateAppliance(item.id, "quantity", Math.max(1, Number(e.target.value)))} />
                      <strong className="kwh-value">{item.kwh.toFixed(1)}</strong>
                      <div className="row-actions">
                        <button className="detail-button" onClick={() => setSelectedApplianceId(item.id)} title="รายละเอียด"><Info size={16} /></button>
                        <button className="delete-button" onClick={() => removeAppliance(item.id)} title="ลบรายการ"><Trash2 size={17} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel chart-panel">
                <div className="panel-header"><div><h3>สัดส่วนการกินไฟ</h3><p>แสดงตามพลังงานที่ใช้ต่อเดือน</p></div></div>
                <div className="donut-area"><div className="donut" style={{ background: `conic-gradient(${donutGradient})` }}><div className="donut-center"><strong>{calculations.totalKwh.toFixed(1)}</strong><span>kWh</span></div></div></div>
                <div className="legend-list">
                  {topAppliances.map((item, index) => (
                    <div className="legend-item" key={item.id}>
                      <div className="legend-name"><span className="legend-dot" style={{ backgroundColor: chartColors[index % chartColors.length] }} /><span>{item.icon} {item.name}</span></div>
                      <strong>{percent(item.kwh).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="insight-grid">
              <div className="insight-card saving-card"><div className="insight-icon"><Leaf size={20} /></div><div><strong>เคล็ดลับประหยัดพลังงาน</strong><p>{topAppliances[0] ? `${topAppliances[0].name} เป็นรายการที่ใช้ไฟสูงสุด ${topAppliances[0].kwh.toFixed(1)} kWh/เดือน ลองลดชั่วโมงใช้งานเพื่อประหยัดค่าไฟ` : "เพิ่มเครื่องใช้ไฟฟ้าเพื่อรับคำแนะนำ"}</p></div></div>
              <div className="insight-card formula-card"><div className="insight-icon"><Info size={20} /></div><div><strong>สูตรคำนวณการใช้ไฟ</strong><p>(กำลังไฟ W × ชั่วโมงใช้งาน × วันใช้งาน × จำนวนเครื่อง) ÷ 1,000 = kWh/เดือน</p></div></div>
            </section>

            <section className="cost-panel panel">
              <div className="panel-header"><div><h3>สรุปค่าไฟ</h3><p>ประมาณการค่าไฟฟ้ารายเดือน</p></div></div>
              <div className="cost-grid">
                <div><span>ค่าพลังงาน</span><strong>฿{money(calculations.energyCharge)}</strong></div>
                <div><span>ค่า Ft</span><strong>฿{money(calculations.ftCharge)}</strong></div>
                <div><span>ค่าบริการ</span><strong>฿{money(calculations.serviceCharge)}</strong></div>
                <div><span>ประเภทอัตรา</span><strong>{calculations.tariffType}</strong></div>
                <div><span>VAT {vatRate}%</span><strong>฿{money(calculations.vat)}</strong></div>
                <div className="total-cost"><span>ค่าไฟโดยประมาณ</span><strong>฿{money(calculations.totalBill)}</strong></div>
              </div>
            </section>
          </>
        )}

        {activePage === "bill" && (
          <section className="panel bill-panel">
            <div className="panel-header"><div><h3>คำนวณบิลค่าไฟ</h3><p>ประมาณการจากจำนวนหน่วยและอัตราที่กำหนดในแอป</p></div><span className="bill-badge">ประมาณการ</span></div>
            <div className="bill-content">
              <label className="bill-input-card"><span>จำนวนหน่วยไฟฟ้า (kWh)</span><input type="number" min="0" step="0.1" value={calculations.totalKwh.toFixed(1)} readOnly /><small>ดึงอัตโนมัติจากรายการเครื่องใช้ไฟฟ้า และจะเปลี่ยนทันทีเมื่อแก้กำลังไฟ/ชั่วโมง/วัน/จำนวน</small></label>
              <div className="bill-result-card"><span>ค่าไฟโดยประมาณ</span><strong>฿{money(estimatedBill)}</strong><div className="bill-breakdown"><div><span>ค่าพลังงาน</span><b>฿{money(billEnergyCharge)}</b></div><div><span>ค่า Ft</span><b>฿{money(billFtCharge)}</b></div><div><span>ค่าบริการ</span><b>฿{money(billServiceCharge)}</b></div><div><span>VAT {vatRate}%</span><b>฿{money(billVat)}</b></div></div></div>
            </div>
            <div className="bill-note"><Info size={18} /><span>จำนวนหน่วยและยอดบิลในหน้านี้ใช้ชุดคำนวณเดียวกับหน้าเครื่องใช้ไฟฟ้า อัตราไม่ใช่ใบแจ้งค่าไฟจริง และสามารถแก้ไข Ft/VAT ได้จากหน้าอัตราค่าไฟ</span></div>
          </section>
        )}

        {activePage === "analysis" && (
          <section className="panel analysis-panel">
            <div className="panel-header"><div><h3>วิเคราะห์การใช้ไฟ</h3><p>เรียงจากเครื่องใช้ไฟฟ้าที่ใช้พลังงานมากที่สุด</p></div></div>
            <div className="analysis-list">
              {topAppliances.map((item, index) => (
                <div className="analysis-item" key={item.id}>
                  <div className="rank">{index + 1}</div><div className="analysis-icon">{item.icon}</div>
                  <div className="analysis-info"><strong>{item.name}</strong><div className="progress-track"><div className="progress-bar" style={{ width: `${Math.min(percent(item.kwh), 100)}%` }} /></div></div>
                  <div className="analysis-value"><strong>{item.kwh.toFixed(1)} kWh</strong><span>{percent(item.kwh).toFixed(1)}%</span></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activePage === "rates" && (
          <section className="panel rates-panel">
            <div className="panel-header"><div><h3>อัตราค่าไฟ</h3><p>แก้ไขค่าใช้สำหรับการคำนวณ</p></div></div>
            <div className="rates-grid">
              <div className="rate-info-card">
                <span>การไฟฟ้า</span>
                <strong>PEA</strong>
                <small>การไฟฟ้าส่วนภูมิภาค</small>
              </div>
              <div className="rate-info-card">
                <span>ประเภทอัตรา</span>
                <strong>บ้านอยู่อาศัย 1.1</strong>
                <small>เลือก 1.1.1 หรือ 1.1.2 อัตโนมัติตามหน่วย</small>
              </div>
              <label>
                <span>ค่า Ft (บาท/kWh)</span>
                <input type="number" min="0" step="0.0001" value={ftRate} onChange={(e) => setFtRate(Math.max(0, Number(e.target.value)))} />
                <small>ก.ย. – ธ.ค. 2569</small>
              </label>
              <label>
                <span>VAT (%)</span>
                <input type="number" min="0" step="0.01" value={vatRate} onChange={(e) => setVatRate(Math.max(0, Number(e.target.value)))} />
              </label>
            </div>

            <div className="tariff-table">
              <h4>อัตราค่าไฟบ้านอยู่อาศัย PEA 2569</h4>
              <div className="tariff-row tariff-head">
                <span>ช่วงหน่วย</span>
                <span>ประเภท 1.1.1</span>
                <span>ประเภท 1.1.2</span>
              </div>
              <div className="tariff-row"><span>1–15 หน่วย</span><span>2.3488</span><span>3.0000</span></div>
              <div className="tariff-row"><span>16–25 หน่วย</span><span>2.9882</span><span>3.0000</span></div>
              <div className="tariff-row"><span>26–200 หน่วย</span><span>3.0000</span><span>3.0000</span></div>
              <div className="tariff-row"><span>201–400 หน่วย</span><span>4.1584</span><span>4.1584</span></div>
              <div className="tariff-row"><span>401 หน่วยขึ้นไป</span><span>4.3583</span><span>4.3583</span></div>
            </div>

            <div className="rate-note"><Lightbulb size={19} /><div><strong>หมายเหตุ</strong><p>ค่าไฟฐานคำนวณแบบขั้นบันไดตามประเภทบ้านอยู่อาศัยของ PEA ส่วน Ft และ VAT แยกคำนวณต่างหาก</p></div></div>
          </section>
        )}
      </main>

      <footer><span>⚡ Smart Energy Dashboard · MEA & PEA 2569</span><span>คำนวณค่าไฟฟ้าอย่างง่ายและรวดเร็ว</span></footer>

      {selectedAppliance && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedApplianceId(null)}>
          <div className="appliance-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div><h3>{selectedAppliance.icon} รายละเอียดเครื่องใช้ไฟฟ้า</h3><p>{selectedAppliance.name}</p></div>
              <button className="modal-close" onClick={() => setSelectedApplianceId(null)} title="ปิด"><X size={19} /></button>
            </div>

            <div className="modal-grid">
              <label><span>ชื่อเครื่อง</span><input value={selectedAppliance.name} onChange={(e) => updateAppliance(selectedAppliance.id, "name", e.target.value)} /></label>
              <label><span>ประเภท</span><select value={selectedAppliance.category} onChange={(e) => updateAppliance(selectedAppliance.id, "category", e.target.value as ApplianceCategory)}>{Object.entries(categoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label><span>ยี่ห้อ</span><input value={selectedAppliance.brand} onChange={(e) => updateAppliance(selectedAppliance.id, "brand", e.target.value)} /></label>
              <label><span>รุ่น</span><input value={selectedAppliance.model} onChange={(e) => updateAppliance(selectedAppliance.id, "model", e.target.value)} /></label>
              <label><span>ขนาด/ความจุ</span><input value={selectedAppliance.capacity} onChange={(e) => updateAppliance(selectedAppliance.id, "capacity", e.target.value)} /></label>
              <label><span>กำลังไฟ (W)</span><input type="number" min="0" value={selectedAppliance.watts} onChange={(e) => updateAppliance(selectedAppliance.id, "watts", Math.max(0, Number(e.target.value)))} /></label>
              <label><span>จำนวนเครื่อง</span><input type="number" min="1" value={selectedAppliance.quantity} onChange={(e) => updateAppliance(selectedAppliance.id, "quantity", Math.max(1, Number(e.target.value)))} /></label>
              <label><span>ชั่วโมงใช้งาน/วัน</span><input type="number" min="0" max="24" step="0.5" value={selectedAppliance.hoursPerDay} onChange={(e) => updateAppliance(selectedAppliance.id, "hoursPerDay", Math.max(0, Math.min(24, Number(e.target.value))))} /></label>
              <label><span>วันใช้งาน/เดือน</span><input type="number" min="0" max="31" value={selectedAppliance.daysPerMonth} onChange={(e) => updateAppliance(selectedAppliance.id, "daysPerMonth", Math.max(0, Math.min(31, Number(e.target.value))))} /></label>

              {selectedAppliance.category === "air-conditioner" && (
                <>
                  <label><span>ชนิดแอร์</span><select value={selectedAppliance.airConditionerType ?? "other"} onChange={(e) => updateAppliance(selectedAppliance.id, "airConditionerType", e.target.value as AirConditionerType)}><option value="inverter">Inverter</option><option value="fixed-speed">Fixed Speed</option><option value="other">อื่น ๆ</option></select></label>
                  <label><span>BTU</span><input type="number" min="0" value={selectedAppliance.btu ?? 0} onChange={(e) => updateAppliance(selectedAppliance.id, "btu", Math.max(0, Number(e.target.value)))} /></label>
                </>
              )}

              <label><span>วันที่ซื้อ</span><input type="date" value={selectedAppliance.purchaseDate} onChange={(e) => updateAppliance(selectedAppliance.id, "purchaseDate", e.target.value)} /></label>
              <label><span>วันที่ติดตั้ง</span><input type="date" value={selectedAppliance.installationDate} onChange={(e) => updateAppliance(selectedAppliance.id, "installationDate", e.target.value)} /></label>
              <label><span>วันหมดประกัน</span><input type="date" value={selectedAppliance.warrantyExpiryDate} onChange={(e) => updateAppliance(selectedAppliance.id, "warrantyExpiryDate", e.target.value)} /></label>
              <label><span>ตรวจสอบครั้งถัดไป</span><input type="date" value={selectedAppliance.nextInspectionDate} onChange={(e) => updateAppliance(selectedAppliance.id, "nextInspectionDate", e.target.value)} /></label>
              <label><span>บำรุงรักษาครั้งถัดไป</span><input type="date" value={selectedAppliance.nextServiceDate} onChange={(e) => updateAppliance(selectedAppliance.id, "nextServiceDate", e.target.value)} /></label>
              <label className="modal-full"><span>หมายเหตุ</span><textarea rows={3} value={selectedAppliance.notes} onChange={(e) => updateAppliance(selectedAppliance.id, "notes", e.target.value)} /></label>
            </div>

            <div className="status-row">
              <span className={`status-chip ${getWarrantyStatus(selectedAppliance.warrantyExpiryDate).tone}`}>ประกัน: {getWarrantyStatus(selectedAppliance.warrantyExpiryDate).label}</span>
              <span className={`status-chip ${getMaintenanceStatus(selectedAppliance.nextServiceDate).tone}`}>บำรุงรักษา: {getMaintenanceStatus(selectedAppliance.nextServiceDate).label}</span>
            </div>

            <div className="modal-footer">
              <button className="reset-button" onClick={() => setSelectedApplianceId(null)}>ปิดหน้าต่าง</button>
              <button className="add-button" onClick={() => setSelectedApplianceId(null)}>บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

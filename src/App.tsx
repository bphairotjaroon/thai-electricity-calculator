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
import DashboardPage from "./pages/DashboardPage";

type Page = "dashboard" | "calculator" | "bill" | "analysis" | "rates";

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
  if (!/[���������������������]/.test(value)) return value;
  try {
    const repaired = decodeURIComponent(escape(value));
    return repaired.includes("?") ? value : repaired;
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
    name: "???????????????????????",
    category: "air-conditioner",
    icon: "??",
    capacity: "12,000 BTU",
    watts: 1200,
    hoursPerDay: 8,
    daysPerMonth: 30,
    airConditionerType: "inverter",
    btu: 12000,
  }),
  makeAppliance({
    id: 2,
    name: "???????",
    category: "refrigerator",
    icon: "??",
    capacity: "?????? 10 ???",
    watts: 150,
    hoursPerDay: 24,
    daysPerMonth: 30,
  }),
  makeAppliance({
    id: 3,
    name: "????????",
    category: "television",
    icon: "??",
    capacity: "55 ????",
    watts: 120,
    hoursPerDay: 5,
    daysPerMonth: 30,
  }),
];

const appliancePresets = [
  { name: "????????????????", category: "air-conditioner" as const, icon: "??", watts: 1200, capacity: "12,000 BTU", btu: 12000 },
  { name: "???????", category: "refrigerator" as const, icon: "??", watts: 150, capacity: "?????? 10 ???" },
  { name: "????????", category: "television" as const, icon: "??", watts: 120, capacity: "55 ????" },
  { name: "?????????????", category: "washing-machine" as const, icon: "??", watts: 500, capacity: "" },
  { name: "????????", category: "microwave" as const, icon: "??", watts: 1000, capacity: "" },
  { name: "???????????", category: "computer" as const, icon: "??", watts: 300, capacity: "" },
  { name: "??????", category: "lighting" as const, icon: "??", watts: 15, capacity: "" },
];

const getWarrantyStatus = (dateString: string): { label: string; tone: StatusTone } => {
  if (!dateString) return { label: "??????????????????????", tone: "neutral" };
  const expiryDate = new Date(`${dateString}T23:59:59`);
  if (Number.isNaN(expiryDate.getTime())) return { label: "????????????????", tone: "danger" };

  const diffInDays = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
  if (diffInDays < 0) return { label: "?????????????", tone: "danger" };
  if (diffInDays <= 30) return { label: "?????????????", tone: "warning" };
  return { label: "????????????????", tone: "success" };
};

const getMaintenanceStatus = (dateString: string): { label: string; tone: StatusTone } => {
  if (!dateString) return { label: "????????????????????????", tone: "neutral" };
  const serviceDate = new Date(`${dateString}T23:59:59`);
  if (Number.isNaN(serviceDate.getTime())) return { label: "????????????????", tone: "danger" };

  const diffInDays = Math.ceil((serviceDate.getTime() - Date.now()) / 86400000);
  if (diffInDays < 0) return { label: "?????????", tone: "danger" };
  if (diffInDays <= 30) return { label: "????????????", tone: "warning" };
  return { label: "??????????????", tone: "success" };
};

const categoryLabel: Record<ApplianceCategory, string> = {
  "air-conditioner": "????????????????",
  refrigerator: "???????",
  television: "????????",
  "washing-machine": "?????????????",
  microwave: "????????",
  computer: "???????????",
  lighting: "??????",
  other: "???? ?",
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

  const [activePage, setActivePage] = useState<Page>("dashboard");
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

  const dashboardRows = calculations.rows.map((item) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    kwh: item.kwh,
    cost:
      calculations.totalKwh > 0
        ? (item.kwh / calculations.totalKwh) * calculations.totalBill
        : 0,
  }));

  const dashboardCalculations = {
    totalKwh: calculations.totalKwh,
    energyCharge: calculations.energyCharge,
    ftCharge: calculations.ftCharge,
    serviceCharge: calculations.serviceCharge,
    vat: calculations.vat,
    totalBill: calculations.totalBill,
    tariffType: calculations.tariffType,
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Zap size={25} fill="currentColor" /></div>
          <div>
            <h1>?????????????</h1>
            <p>Smart Energy Dashboard</p>
          </div>
        </div>

        <nav className="top-nav">
          <button className={activePage === "dashboard" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("dashboard")}>
            <BarChart3 size={17} /> Dashboard
          </button>
          <button className={activePage === "calculator" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("calculator")}>
            <Calculator size={17} /> ????????????????????
          </button>
          <button className={activePage === "bill" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("bill")}>
            <CircleDollarSign size={17} /> ????????????? <span className="nav-unit-badge">{calculations.totalKwh.toFixed(0)} u.</span>
          </button>
          <button className={activePage === "analysis" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("analysis")}>
            <BarChart3 size={17} /> ???????????????????
          </button>
          <button className={activePage === "rates" ? "nav-button active" : "nav-button"} onClick={() => setActivePage("rates")}>
            <Lightbulb size={17} /> ????????/??????????
          </button>
        </nav>
      </header>

      <main className="content">
        {activePage === "dashboard" ? (
          <DashboardPage
            calculations={dashboardCalculations}
            rows={dashboardRows}
            appliances={appliances}
            onOpenCalculator={() => setActivePage("calculator")}
            onOpenAnalysis={() => setActivePage("analysis")}
          />
        ) : (
          <>
        <section className="page-heading">
          <div>
            <h2>
              {activePage === "calculator" ? "?????????????" : activePage === "bill" ? "?????????????" : activePage === "analysis" ? "???????????????????" : "????????????????????????"}
            </h2>
            <p>
              {activePage === "calculator"
                ? "???????????????????????????????????????????????????"
                : activePage === "bill"
                  ? "?????????????????????????????????????????????????????????"
                  : activePage === "analysis"
                    ? "??????????????????????????????????????????????????????????"
                    : "??????????????????????????????????????????????????"}
            </p>
          </div>
          <button className="reset-button" onClick={resetAll}><RefreshCw size={16} /> ??????</button>
        </section>

        <section className="summary-grid">
          <div className="summary-card energy-summary">
            <div className="summary-icon blue"><Zap size={21} /></div>
            <div><span>??????????</span><strong>{calculations.totalKwh.toFixed(1)} kWh</strong><small>????????</small></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon green"><CircleDollarSign size={21} /></div>
            <div><span>???????????</span><strong>?{money(calculations.totalBill)}</strong><small>??? VAT {vatRate}%</small></div>
          </div>
          <div className="summary-card action-card">
            <div className="summary-icon orange"><Calculator size={21} /></div>
            <div><span>??????????????</span><strong>???????????????</strong><button onClick={() => setActivePage("rates")}>?????????????????</button></div>
          </div>
        </section>

        {activePage === "calculator" && (
          <>
            <section className="dashboard-grid">
              <div className="panel appliance-panel">
                <div className="panel-header">
                  <div><h3>?????????????????????</h3><p>{calculations.rows.length} ?????? � ???????????????????????????????????????</p></div>
                  <button className="add-button" onClick={() => addAppliance()}><Plus size={17} /> ????????????????????</button>
                </div>

                <div className="preset-row">
                  {appliancePresets.slice(0, 5).map((preset) => (
                    <button key={preset.name} className="preset-button" onClick={() => addAppliance(preset)}>{preset.icon} {preset.name}</button>
                  ))}
                </div>

                <div className="table-head">
                  <span>???????????????</span><span>??????? (W)</span><span>??./???</span><span>???/?????</span><span>?????</span><span>kWh/?????</span><span></span>
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
                        <button className="detail-button" onClick={() => setSelectedApplianceId(item.id)} title="??????????"><Info size={16} /></button>
                        <button className="delete-button" onClick={() => removeAppliance(item.id)} title="????????"><Trash2 size={17} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel chart-panel">
                <div className="panel-header"><div><h3>???????????????</h3><p>????????????????????????????</p></div></div>
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
              <div className="insight-card saving-card"><div className="insight-icon"><Leaf size={20} /></div><div><strong>??????????????????????</strong><p>{topAppliances[0] ? `${topAppliances[0].name} ???????????????????????? ${topAppliances[0].kwh.toFixed(1)} kWh/????? ???????????????????????????????????` : "???????????????????????????????????"}</p></div></div>
              <div className="insight-card formula-card"><div className="insight-icon"><Info size={20} /></div><div><strong>?????????????????</strong><p>(??????? W � ????????????? � ????????? � ????????????) � 1,000 = kWh/?????</p></div></div>
            </section>

            <section className="cost-panel panel">
              <div className="panel-header"><div><h3>?????????</h3><p>?????????????????????????</p></div></div>
              <div className="cost-grid">
                <div><span>??????????</span><strong>?{money(calculations.energyCharge)}</strong></div>
                <div><span>??? Ft</span><strong>?{money(calculations.ftCharge)}</strong></div>
                <div><span>?????????</span><strong>?{money(calculations.serviceCharge)}</strong></div>
                <div><span>???????????</span><strong>{calculations.tariffType}</strong></div>
                <div><span>VAT {vatRate}%</span><strong>?{money(calculations.vat)}</strong></div>
                <div className="total-cost"><span>??????????????</span><strong>?{money(calculations.totalBill)}</strong></div>
              </div>
            </section>
          </>
        )}

        {activePage === "bill" && (
          <section className="panel bill-panel">
            <div className="panel-header"><div><h3>?????????????</h3><p>???????????????????????????????????????????</p></div><span className="bill-badge">?????????</span></div>
            <div className="bill-content">
              <label className="bill-input-card"><span>??????????????? (kWh)</span><input type="number" min="0" step="0.1" value={calculations.totalKwh.toFixed(1)} readOnly /><small>???????????????????????????????????? ????????????????????????????????/???????/???/?????</small></label>
              <div className="bill-result-card"><span>??????????????</span><strong>?{money(estimatedBill)}</strong><div className="bill-breakdown"><div><span>??????????</span><b>?{money(billEnergyCharge)}</b></div><div><span>??? Ft</span><b>?{money(billFtCharge)}</b></div><div><span>?????????</span><b>?{money(billServiceCharge)}</b></div><div><span>VAT {vatRate}%</span><b>?{money(billVat)}</b></div></div></div>
            </div>
            <div className="bill-note"><Info size={18} /><span>?????????????????????????????????????????????????????????????????? ?????????????????????????? ?????????????? Ft/VAT ????????????????????</span></div>
          </section>
        )}

        {activePage === "analysis" && (
          <section className="panel analysis-panel">
            <div className="panel-header"><div><h3>?????????????????</h3><p>?????????????????????????????????????????????</p></div></div>
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
            <div className="panel-header"><div><h3>??????????</h3><p>?????????????????????????</p></div></div>
            <div className="rates-grid">
              <div className="rate-info-card">
                <span>????????</span>
                <strong>PEA</strong>
                <small>???????????????????</small>
              </div>
              <div className="rate-info-card">
                <span>???????????</span>
                <strong>????????????? 1.1</strong>
                <small>????? 1.1.1 ???? 1.1.2 ?????????????????</small>
              </div>
              <label>
                <span>??? Ft (???/kWh)</span>
                <input type="number" min="0" step="0.0001" value={ftRate} onChange={(e) => setFtRate(Math.max(0, Number(e.target.value)))} />
                <small>?.?. � ?.?. 2569</small>
              </label>
              <label>
                <span>VAT (%)</span>
                <input type="number" min="0" step="0.01" value={vatRate} onChange={(e) => setVatRate(Math.max(0, Number(e.target.value)))} />
              </label>
            </div>

            <div className="tariff-table">
              <h4>??????????????????????? PEA 2569</h4>
              <div className="tariff-row tariff-head">
                <span>?????????</span>
                <span>?????? 1.1.1</span>
                <span>?????? 1.1.2</span>
              </div>
              <div className="tariff-row"><span>1�15 ?????</span><span>2.3488</span><span>3.0000</span></div>
              <div className="tariff-row"><span>16�25 ?????</span><span>2.9882</span><span>3.0000</span></div>
              <div className="tariff-row"><span>26�200 ?????</span><span>3.0000</span><span>3.0000</span></div>
              <div className="tariff-row"><span>201�400 ?????</span><span>4.1584</span><span>4.1584</span></div>
              <div className="tariff-row"><span>401 ???????????</span><span>4.3583</span><span>4.3583</span></div>
            </div>

            <div className="rate-note"><Lightbulb size={19} /><div><strong>????????</strong><p>?????????????????????????????????????????????????? PEA ???? Ft ??? VAT ???????????????</p></div></div>
          </section>
        )}
          </>
        )}
      </main>

      <footer><span>? Smart Energy Dashboard � MEA & PEA 2569</span><span>????????????????????????????????</span></footer>

      {selectedAppliance && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedApplianceId(null)}>
          <div className="appliance-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div><h3>{selectedAppliance.icon} ?????????????????????????</h3><p>{selectedAppliance.name}</p></div>
              <button className="modal-close" onClick={() => setSelectedApplianceId(null)} title="???"><X size={19} /></button>
            </div>

            <div className="modal-grid">
              <label><span>???????????</span><input value={selectedAppliance.name} onChange={(e) => updateAppliance(selectedAppliance.id, "name", e.target.value)} /></label>
              <label><span>??????</span><select value={selectedAppliance.category} onChange={(e) => updateAppliance(selectedAppliance.id, "category", e.target.value as ApplianceCategory)}>{Object.entries(categoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label><span>??????</span><input value={selectedAppliance.brand} onChange={(e) => updateAppliance(selectedAppliance.id, "brand", e.target.value)} /></label>
              <label><span>????</span><input value={selectedAppliance.model} onChange={(e) => updateAppliance(selectedAppliance.id, "model", e.target.value)} /></label>
              <label><span>????/??????</span><input value={selectedAppliance.capacity} onChange={(e) => updateAppliance(selectedAppliance.id, "capacity", e.target.value)} /></label>
              <label><span>??????? (W)</span><input type="number" min="0" value={selectedAppliance.watts} onChange={(e) => updateAppliance(selectedAppliance.id, "watts", Math.max(0, Number(e.target.value)))} /></label>
              <label><span>????????????</span><input type="number" min="1" value={selectedAppliance.quantity} onChange={(e) => updateAppliance(selectedAppliance.id, "quantity", Math.max(1, Number(e.target.value)))} /></label>
              <label><span>?????????????/???</span><input type="number" min="0" max="24" step="0.5" value={selectedAppliance.hoursPerDay} onChange={(e) => updateAppliance(selectedAppliance.id, "hoursPerDay", Math.max(0, Math.min(24, Number(e.target.value))))} /></label>
              <label><span>?????????/?????</span><input type="number" min="0" max="31" value={selectedAppliance.daysPerMonth} onChange={(e) => updateAppliance(selectedAppliance.id, "daysPerMonth", Math.max(0, Math.min(31, Number(e.target.value))))} /></label>

              {selectedAppliance.category === "air-conditioner" && (
                <>
                  <label><span>????????</span><select value={selectedAppliance.airConditionerType ?? "other"} onChange={(e) => updateAppliance(selectedAppliance.id, "airConditionerType", e.target.value as AirConditionerType)}><option value="inverter">Inverter</option><option value="fixed-speed">Fixed Speed</option><option value="other">???? ?</option></select></label>
                  <label><span>BTU</span><input type="number" min="0" value={selectedAppliance.btu ?? 0} onChange={(e) => updateAppliance(selectedAppliance.id, "btu", Math.max(0, Number(e.target.value)))} /></label>
                </>
              )}

              <label><span>??????????</span><input type="date" value={selectedAppliance.purchaseDate} onChange={(e) => updateAppliance(selectedAppliance.id, "purchaseDate", e.target.value)} /></label>
              <label><span>?????????????</span><input type="date" value={selectedAppliance.installationDate} onChange={(e) => updateAppliance(selectedAppliance.id, "installationDate", e.target.value)} /></label>
              <label><span>????????????</span><input type="date" value={selectedAppliance.warrantyExpiryDate} onChange={(e) => updateAppliance(selectedAppliance.id, "warrantyExpiryDate", e.target.value)} /></label>
              <label><span>?????????????????</span><input type="date" value={selectedAppliance.nextInspectionDate} onChange={(e) => updateAppliance(selectedAppliance.id, "nextInspectionDate", e.target.value)} /></label>
              <label><span>????????????????????</span><input type="date" value={selectedAppliance.nextServiceDate} onChange={(e) => updateAppliance(selectedAppliance.id, "nextServiceDate", e.target.value)} /></label>
              <label className="modal-full"><span>????????</span><textarea rows={3} value={selectedAppliance.notes} onChange={(e) => updateAppliance(selectedAppliance.id, "notes", e.target.value)} /></label>
            </div>

            <div className="status-row">
              <span className={`status-chip ${getWarrantyStatus(selectedAppliance.warrantyExpiryDate).tone}`}>??????: {getWarrantyStatus(selectedAppliance.warrantyExpiryDate).label}</span>
              <span className={`status-chip ${getMaintenanceStatus(selectedAppliance.nextServiceDate).tone}`}>??????????: {getMaintenanceStatus(selectedAppliance.nextServiceDate).label}</span>
            </div>

            <div className="modal-footer">
              <button className="reset-button" onClick={() => setSelectedApplianceId(null)}>???????????</button>
              <button className="add-button" onClick={() => setSelectedApplianceId(null)}>????????????</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


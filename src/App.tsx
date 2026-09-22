import { useMemo, useState, type ReactNode } from "react";import {
  Activity,
  BarChart3,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Home,
  Lightbulb,
  MoreVertical,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
  TrendingDown,
  Zap,
} from "lucide-react";

type Appliance = {
  id: number;
  name: string;
  icon: string;
  watts: number;
  hoursPerDay: number;
  daysPerMonth: number;
  quantity: number;
};

const appliancePresets = [
  { name: "เครื่องปรับอากาศ", icon: "❄️", watts: 1200 },
  { name: "ตู้เย็น", icon: "🧊", watts: 150 },
  { name: "โทรทัศน์", icon: "📺", watts: 120 },
  { name: "พัดลม", icon: "🌀", watts: 60 },
  { name: "หลอดไฟ", icon: "💡", watts: 18 },
  { name: "เครื่องทำน้ำอุ่น", icon: "🚿", watts: 3500 },
  { name: "คอมพิวเตอร์", icon: "💻", watts: 300 },
  { name: "เครื่องซักผ้า", icon: "🧺", watts: 500 },
];

const initialAppliances: Appliance[] = [
  {
    id: 1,
    name: "เครื่องปรับอากาศ",
    icon: "❄️",
    watts: 1200,
    hoursPerDay: 8,
    daysPerMonth: 30,
    quantity: 1,
  },
  {
    id: 2,
    name: "ตู้เย็น",
    icon: "🧊",
    watts: 150,
    hoursPerDay: 10,
    daysPerMonth: 30,
    quantity: 1,
  },
  {
    id: 3,
    name: "โทรทัศน์",
    icon: "📺",
    watts: 120,
    hoursPerDay: 5,
    daysPerMonth: 30,
    quantity: 1,
  },
  {
    id: 4,
    name: "พัดลม",
    icon: "🌀",
    watts: 60,
    hoursPerDay: 8,
    daysPerMonth: 30,
    quantity: 2,
  },
  {
    id: 5,
    name: "หลอดไฟ",
    icon: "💡",
    watts: 18,
    hoursPerDay: 6,
    daysPerMonth: 30,
    quantity: 6,
  },
];

const money = (value: number) =>
  value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const number = (value: number) =>
  value.toLocaleString("th-TH", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [appliances, setAppliances] = useState<Appliance[]>(initialAppliances);

  const [energyRate, setEnergyRate] = useState(4.2);
  const [ftRate, setFtRate] = useState(0.3972);
  const [serviceCharge, setServiceCharge] = useState(24.62);
  const [vatRate, setVatRate] = useState(7);

  const calculations = useMemo(() => {
    const rows = appliances.map((item) => {
      const kwh =
        (item.watts / 1000) *
        item.hoursPerDay *
        item.daysPerMonth *
        item.quantity;

      return {
        ...item,
        kwh,
      };
    });

    const totalKwh = rows.reduce((sum, row) => sum + row.kwh, 0);
    const energyCharge = totalKwh * energyRate;
    const ftCharge = totalKwh * ftRate;
    const beforeVat = energyCharge + ftCharge + serviceCharge;
    const vat = beforeVat * (vatRate / 100);
    const totalBill = beforeVat + vat;

    return {
      rows,
      totalKwh,
      energyCharge,
      ftCharge,
      serviceCharge,
      vat,
      totalBill,
    };
  }, [
    appliances,
    energyRate,
    ftRate,
    serviceCharge,
    vatRate,
  ]);

  const topAppliances = [...calculations.rows]
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, 5);

  const addAppliance = (preset?: (typeof appliancePresets)[number]) => {
    const fallback = appliancePresets[0];

    const next: Appliance = {
      id: Date.now(),
      name: preset?.name ?? fallback.name,
      icon: preset?.icon ?? fallback.icon,
      watts: preset?.watts ?? fallback.watts,
      hoursPerDay: 4,
      daysPerMonth: 30,
      quantity: 1,
    };

    setAppliances((current) => [...current, next]);
    setActivePage("appliances");
  };

  const updateAppliance = (
    id: number,
    field: keyof Appliance,
    value: string
  ) => {
    setAppliances((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        if (field === "name" || field === "icon") {
          return {
            ...item,
            [field]: value,
          };
        }

        return {
          ...item,
          [field]: Number(value),
        };
      })
    );
  };

  const removeAppliance = (id: number) => {
    setAppliances((current) =>
      current.length > 1
        ? current.filter((item) => item.id !== id)
        : current
    );
  };

  const resetAll = () => {
    setAppliances(initialAppliances);
    setEnergyRate(4.2);
    setFtRate(0.3972);
    setServiceCharge(24.62);
    setVatRate(7);
    setActivePage("dashboard");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Zap size={24} fill="currentColor" />
          </div>

          <div>
            <div className="brand-title">ค่าไฟฟ้า</div>
            <div className="brand-subtitle">Smart Energy Dashboard</div>
          </div>
        </div>

        <div className="sidebar-section-title">เมนูหลัก</div>

        <nav className="sidebar-nav">
          <NavItem
            icon={<Home size={18} />}
            label="ภาพรวม"
            active={activePage === "dashboard"}
            onClick={() => setActivePage("dashboard")}
          />

          <NavItem
            icon={<Calculator size={18} />}
            label="คำนวณค่าไฟ"
            active={activePage === "appliances"}
            onClick={() => setActivePage("appliances")}
          />

          <NavItem
            icon={<BarChart3 size={18} />}
            label="วิเคราะห์การใช้ไฟ"
            active={activePage === "analysis"}
            onClick={() => setActivePage("analysis")}
          />

          <NavItem
            icon={<CircleDollarSign size={18} />}
            label="อัตราค่าไฟ"
            active={activePage === "rates"}
            onClick={() => setActivePage("rates")}
          />

          <NavItem
            icon={<Lightbulb size={18} />}
            label="เคล็ดลับประหยัดไฟ"
            active={activePage === "tips"}
            onClick={() => setActivePage("tips")}
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="side-tip">
            <div className="side-tip-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <div className="side-tip-title">เคล็ดลับวันนี้</div>
              <div className="side-tip-text">
                ลดการใช้แอร์วันละ 1 ชั่วโมง
                ช่วยลดหน่วยไฟได้อย่างต่อเนื่อง
              </div>
            </div>
          </div>

          <button className="reset-side-btn" onClick={resetAll}>
            <RefreshCw size={16} />
            รีเซ็ตข้อมูล
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="eyebrow">SMART ELECTRICITY</div>
            <h1>
              {activePage === "dashboard" && "ภาพรวมค่าไฟฟ้า"}
              {activePage === "appliances" && "เครื่องใช้ไฟฟ้า"}
              {activePage === "analysis" && "วิเคราะห์การใช้ไฟ"}
              {activePage === "rates" && "อัตราค่าไฟ"}
              {activePage === "tips" && "เคล็ดลับประหยัดไฟ"}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="online-badge">
              <span />
              พร้อมคำนวณ
            </div>

            <button className="icon-btn" title="ตั้งค่า">
              <Settings2 size={18} />
            </button>

            <button className="avatar-btn">บ</button>
          </div>
        </header>

        {activePage === "dashboard" && (
          <Dashboard
            totalKwh={calculations.totalKwh}
            totalBill={calculations.totalBill}
            applianceCount={appliances.length}
            topAppliances={topAppliances}
            rows={calculations.rows}
            onAdd={() => addAppliance()}
            onOpenAppliances={() => setActivePage("appliances")}
          />
        )}

        {activePage === "appliances" && (
          <AppliancesPage
            appliances={appliances}
            rows={calculations.rows}
            onAdd={addAppliance}
            onUpdate={updateAppliance}
            onRemove={removeAppliance}
          />
        )}

        {activePage === "analysis" && (
          <AnalysisPage rows={calculations.rows} />
        )}

        {activePage === "rates" && (
          <RatesPage
            energyRate={energyRate}
            ftRate={ftRate}
            serviceCharge={serviceCharge}
            vatRate={vatRate}
            setEnergyRate={setEnergyRate}
            setFtRate={setFtRate}
            setServiceCharge={setServiceCharge}
            setVatRate={setVatRate}
            totalKwh={calculations.totalKwh}
            totalBill={calculations.totalBill}
          />
        )}

        {activePage === "tips" && <TipsPage />}

        <footer className="footer">
          <span>
            ประมาณการจากข้อมูลที่ผู้ใช้กรอก
            ไม่ใช่ใบแจ้งค่าไฟจริงจากการไฟฟ้า
          </span>

          <span className="footer-dot">•</span>

          <span>Smart Electricity Dashboard</span>
        </footer>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {active && <ChevronRight size={16} className="nav-arrow" />}
    </button>
  );
}

function Dashboard({
  totalKwh,
  totalBill,
  applianceCount,
  topAppliances,
  rows,
  onAdd,
  onOpenAppliances,
}: {
  totalKwh: number;
  totalBill: number;
  applianceCount: number;
  topAppliances: (Appliance & { kwh: number })[];
  rows: (Appliance & { kwh: number })[];
  onAdd: () => void;
  onOpenAppliances: () => void;
}) {
  const biggest = topAppliances[0];

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <div className="muted-label">สรุปการใช้งานเดือนนี้</div>
          <h2 className="page-title">
            ค่าไฟของคุณอยู่ที่ประมาณ{" "}
            <span>{money(totalBill)} บาท</span>
          </h2>
          <p className="page-description">
            ระบบคำนวณจากจำนวนเครื่องใช้ไฟฟ้าและเวลาที่ใช้งาน
            สามารถปรับข้อมูลได้ตลอดเวลา
          </p>
        </div>

        <button className="primary-btn" onClick={onOpenAppliances}>
          <Calculator size={17} />
          คำนวณค่าไฟใหม่
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={<Activity size={19} />}
          iconClass="green"
          label="ใช้ไฟทั้งหมด"
          value={`${number(totalKwh)} kWh`}
          detail="ต่อเดือน"
        />

        <StatCard
          icon={<CircleDollarSign size={19} />}
          iconClass="blue"
          label="ค่าไฟประมาณ"
          value={`฿${money(totalBill)}`}
          detail="รวม VAT"
        />

        <StatCard
          icon={<Zap size={19} />}
          iconClass="orange"
          label="อุปกรณ์ทั้งหมด"
          value={String(applianceCount)}
          detail="รายการ"
        />

        <StatCard
          icon={<TrendingDown size={19} />}
          iconClass="purple"
          label="เครื่องใช้ไฟสูงสุด"
          value={biggest?.name ?? "-"}
          detail={
            biggest ? `${number(biggest.kwh)} kWh/เดือน` : "ไม่มีข้อมูล"
          }
        />
      </section>

      <section className="content-grid">
        <div className="panel chart-panel">
          <PanelHeader
            title="สัดส่วนการใช้ไฟ"
            subtitle="ตามเครื่องใช้ไฟฟ้า"
          />

          <div className="chart-layout">
            <DonutChart rows={rows} />

            <div className="legend">
              {rows.slice(0, 5).map((item, index) => {
                const total = rows.reduce((sum, row) => sum + row.kwh, 0);
                const percent = total ? (item.kwh / total) * 100 : 0;

                return (
                  <div className="legend-row" key={item.id}>
                    <div className="legend-left">
                      <span
                        className="legend-dot"
                        style={{
                          background:
                            donutColors[index % donutColors.length],
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <strong>{percent.toFixed(0)}%</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel monthly-panel">
          <PanelHeader
            title="แนวโน้มค่าไฟ"
            subtitle="ตัวอย่าง 6 เดือนล่าสุด"
            action={<MoreVertical size={18} />}
          />

          <div className="mini-chart">
            <div className="mini-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="bar-chart">
              {[
                ["เม.ย.", 44],
                ["พ.ค.", 52],
                ["มิ.ย.", 61],
                ["ก.ค.", 49],
                ["ส.ค.", 70],
                ["ก.ย.", 82],
              ].map(([label, height]) => (
                <div className="bar-item" key={label}>
                  <div
                    className="bar"
                    style={{ height: `${height}px` }}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <PanelHeader
          title="เครื่องใช้ไฟฟ้าที่ใช้ไฟสูง"
          subtitle="เรียงจากการใช้พลังงานมากไปน้อย"
          action={
            <button className="text-btn" onClick={onOpenAppliances}>
              ดูทั้งหมด
              <ChevronRight size={15} />
            </button>
          }
        />

        <div className="appliance-table">
          {topAppliances.map((item, index) => (
            <div className="appliance-row" key={item.id}>
              <div className="rank">{index + 1}</div>

              <div className="appliance-icon">
                {item.icon}
              </div>

              <div className="appliance-info">
                <strong>{item.name}</strong>
                <span>
                  {item.watts.toLocaleString("th-TH")} W ×{" "}
                  {item.hoursPerDay} ชม./วัน
                </span>
              </div>

              <div className="usage-value">
                <strong>{number(item.kwh)} kWh</strong>
                <span>/เดือน</span>
              </div>

              <div className="progress-wrap">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        biggest?.kwh
                          ? Math.min(
                              100,
                              (item.kwh / biggest.kwh) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="add-card-btn" onClick={onAdd}>
          <Plus size={17} />
          เพิ่มเครื่องใช้ไฟฟ้า
        </button>
      </section>
    </div>
  );
}

function AppliancesPage({
  appliances,
  rows,
  onAdd,
  onUpdate,
  onRemove,
}: {
  appliances: Appliance[];
  rows: (Appliance & { kwh: number })[];
  onAdd: (preset?: (typeof appliancePresets)[number]) => void;
  onUpdate: (
    id: number,
    field: keyof Appliance,
    value: string
  ) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <div className="muted-label">รายการอุปกรณ์</div>
          <h2 className="page-title">จัดการเครื่องใช้ไฟฟ้า</h2>
          <p className="page-description">
            เพิ่ม แก้ไข และกำหนดพฤติกรรมการใช้งานของแต่ละอุปกรณ์
          </p>
        </div>

        <button className="primary-btn" onClick={() => onAdd()}>
          <Plus size={17} />
          เพิ่มอุปกรณ์
        </button>
      </section>

      <section className="preset-grid">
        {appliancePresets.map((preset) => (
          <button
            key={preset.name}
            className="preset-card"
            onClick={() => onAdd(preset)}
          >
            <div className="preset-icon">{preset.icon}</div>
            <div>
              <strong>{preset.name}</strong>
              <span>{preset.watts.toLocaleString("th-TH")} W</span>
            </div>
            <Plus size={17} />
          </button>
        ))}
      </section>

      <section className="panel">
        <PanelHeader
          title="รายการเครื่องใช้ไฟฟ้าปัจจุบัน"
          subtitle={`${appliances.length} รายการ`}
        />

        <div className="editor-list">
          {rows.map((item) => (
            <div className="editor-card" key={item.id}>
              <div className="editor-top">
                <div className="appliance-icon large">
                  {item.icon}
                </div>

                <div className="editor-title-wrap">
                  <input
                    className="name-input"
                    value={item.name}
                    onChange={(e) =>
                      onUpdate(item.id, "name", e.target.value)
                    }
                  />
                  <span>
                    ใช้ไฟประมาณ{" "}
                    <strong>{number(item.kwh)} kWh/เดือน</strong>
                  </span>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => onRemove(item.id)}
                  title="ลบรายการ"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="editor-fields">
                <Field
                  label="กำลังไฟ (W)"
                  value={item.watts}
                  onChange={(value) =>
                    onUpdate(item.id, "watts", value)
                  }
                />

                <Field
                  label="ชั่วโมง/วัน"
                  value={item.hoursPerDay}
                  onChange={(value) =>
                    onUpdate(item.id, "hoursPerDay", value)
                  }
                />

                <Field
                  label="วัน/เดือน"
                  value={item.daysPerMonth}
                  onChange={(value) =>
                    onUpdate(item.id, "daysPerMonth", value)
                  }
                />

                <Field
                  label="จำนวนเครื่อง"
                  value={item.quantity}
                  onChange={(value) =>
                    onUpdate(item.id, "quantity", value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnalysisPage({
  rows,
}: {
  rows: (Appliance & { kwh: number })[];
}) {
  const total = rows.reduce((sum, row) => sum + row.kwh, 0);
  const biggest = [...rows].sort((a, b) => b.kwh - a.kwh)[0];

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <div className="muted-label">Energy Analytics</div>
          <h2 className="page-title">วิเคราะห์การใช้ไฟ</h2>
          <p className="page-description">
            ดูว่าเครื่องใช้ไฟฟ้าแต่ละรายการมีผลต่อค่าไฟมากเพียงใด
          </p>
        </div>
      </section>

      <section className="analysis-grid">
        <div className="panel analysis-highlight">
          <div className="analysis-icon">
            <Zap size={22} />
          </div>

          <div className="muted-label">ผู้ใช้ไฟสูงสุด</div>

          <h3>{biggest?.name ?? "-"}</h3>

          <strong>{number(biggest?.kwh ?? 0)} kWh/เดือน</strong>

          <p>
            คิดเป็น{" "}
            {total
              ? ((biggest.kwh / total) * 100).toFixed(1)
              : "0.0"}
            % ของการใช้ไฟทั้งหมด
          </p>
        </div>

        <div className="panel">
          <PanelHeader
            title="อันดับการใช้พลังงาน"
            subtitle="kWh ต่อเดือน"
          />

          <div className="ranking-list">
            {[...rows]
              .sort((a, b) => b.kwh - a.kwh)
              .map((item, index) => (
                <div className="ranking-row" key={item.id}>
                  <span className="ranking-number">{index + 1}</span>
                  <span className="ranking-icon">
                    {item.icon}
                  </span>
                  <div className="ranking-name">
                    <strong>{item.name}</strong>
                    <span>{number(item.kwh)} kWh</span>
                  </div>

                  <div className="ranking-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          biggest?.kwh
                            ? (item.kwh / biggest.kwh) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RatesPage({
  energyRate,
  ftRate,
  serviceCharge,
  vatRate,
  setEnergyRate,
  setFtRate,
  setServiceCharge,
  setVatRate,
  totalKwh,
  totalBill,
}: {
  energyRate: number;
  ftRate: number;
  serviceCharge: number;
  vatRate: number;
  setEnergyRate: (value: number) => void;
  setFtRate: (value: number) => void;
  setServiceCharge: (value: number) => void;
  setVatRate: (value: number) => void;
  totalKwh: number;
  totalBill: number;
}) {
  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <div className="muted-label">Billing Settings</div>
          <h2 className="page-title">ตั้งค่าอัตราค่าไฟ</h2>
          <p className="page-description">
            ปรับตัวเลขให้ตรงกับช่วงอัตราที่ต้องการใช้ในการประมาณการ
          </p>
        </div>
      </section>

      <section className="rates-grid">
        <div className="panel">
          <PanelHeader
            title="อัตราที่ใช้คำนวณ"
            subtitle="แก้ไขได้ทันที"
          />

          <div className="rate-form">
            <Field
              label="ค่าไฟพลังงาน (บาท/kWh)"
              value={energyRate}
              step="0.01"
              onChange={(value) =>
                setEnergyRate(Number(value))
              }
            />

            <Field
              label="Ft (บาท/kWh)"
              value={ftRate}
              step="0.0001"
              onChange={(value) => setFtRate(Number(value))}
            />

            <Field
              label="ค่าบริการ (บาท/เดือน)"
              value={serviceCharge}
              step="0.01"
              onChange={(value) =>
                setServiceCharge(Number(value))
              }
            />

            <Field
              label="VAT (%)"
              value={vatRate}
              step="0.01"
              onChange={(value) =>
                setVatRate(Number(value))
              }
            />
          </div>
        </div>

        <div className="panel rate-summary-card">
          <div className="muted-label">ผลประมาณการ</div>

          <div className="rate-summary-value">
            ฿{money(totalBill)}
          </div>

          <div className="rate-summary-row">
            <span>การใช้ไฟ</span>
            <strong>{number(totalKwh)} kWh</strong>
          </div>

          <div className="rate-summary-row">
            <span>หน่วยราคาเฉลี่ย</span>
            <strong>
              ฿
              {totalKwh
                ? (totalBill / totalKwh).toFixed(2)
                : "0.00"}
              /kWh
            </strong>
          </div>

          <div className="rate-note">
            ตัวเลขนี้เป็นการประมาณเพื่อช่วยวางแผนค่าใช้จ่าย
          </div>
        </div>
      </section>
    </div>
  );
}

function TipsPage() {
  const tips = [
    {
      icon: "❄️",
      title: "ตั้งแอร์ประมาณ 25°C",
      text: "ช่วยลดภาระการทำงานของเครื่องปรับอากาศเมื่อเทียบกับการตั้งอุณหภูมิต่ำมาก",
    },
    {
      icon: "💡",
      title: "ปิดไฟเมื่อไม่ใช้งาน",
      text: "ลดการใช้ไฟสะสมจากพื้นที่ที่ไม่ได้ใช้งานเป็นเวลานาน",
    },
    {
      icon: "🧊",
      title: "ตรวจประตูตู้เย็น",
      text: "ยางขอบประตูที่ปิดสนิทช่วยลดการสูญเสียความเย็นและการทำงานเกินความจำเป็น",
    },
    {
      icon: "🔌",
      title: "ลด Standby ที่ไม่จำเป็น",
      text: "ถอดปลั๊กอุปกรณ์ที่ไม่ได้ใช้งานเป็นเวลานานเมื่อเหมาะสม",
    },
  ];

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <div className="muted-label">Energy Saving</div>
          <h2 className="page-title">เคล็ดลับประหยัดไฟ</h2>
          <p className="page-description">
            แนวทางทั่วไปที่ช่วยลดการใช้ไฟในบ้าน
          </p>
        </div>
      </section>

      <section className="tips-grid">
        {tips.map((tip) => (
          <div className="tip-card" key={tip.title}>
            <div className="tip-icon">{tip.icon}</div>
            <h3>{tip.title}</h3>
            <p>{tip.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>

      <div className="stat-label">{label}</div>

      <div className="stat-value">{value}</div>

      <div className="stat-detail">{detail}</div>
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

const donutColors = [
  "#0f9f8f",
  "#59c27d",
  "#f3b35d",
  "#6d7bf5",
  "#df7b93",
];

function DonutChart({
  rows,
}: {
  rows: (Appliance & { kwh: number })[];
}) {
  const total = rows.reduce((sum, item) => sum + item.kwh, 0);

  let current = 0;

  const gradient = rows
    .slice(0, 5)
    .map((item, index) => {
      const start = total ? (current / total) * 360 : 0;
      current += item.kwh;
      const end = total ? (current / total) * 360 : 0;

      return `${donutColors[index % donutColors.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div
      className="donut"
      style={{
        background: `conic-gradient(${gradient || "#dce9e7 0deg 360deg"})`,
      }}
    >
      <div className="donut-hole">
        <span>ใช้ไฟ</span>
        <strong>{number(total)}</strong>
        <small>kWh</small>
      </div>
    </div>
  );
}

export default App;
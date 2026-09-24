import {
  AlertTriangle,
  CircleDollarSign,
  Gauge,
  TrendingUp,
  Zap,
} from "lucide-react";
import "./DashboardStep1.css";

type DashboardRow = {
  id: number;
  name: string;
  icon: string;
  kwh: number;
  cost: number;
};

type DashboardCalculations = {
  totalKwh: number;
  energyCharge: number;
  ftCharge: number;
  serviceCharge: number;
  vat: number;
  totalBill: number;
  tariffType: "1.1.1" | "1.1.2";
};

type DashboardPageProps = {
  calculations: DashboardCalculations;
  rows: DashboardRow[];
  appliances: unknown[];
  onOpenCalculator: () => void;
  onOpenAnalysis: () => void;
};

const money = (value: number) =>
  value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function DashboardPage({
  calculations,
  rows,
  appliances,
  onOpenCalculator,
  onOpenAnalysis,
}: DashboardPageProps) {
  const {
    totalKwh,
    energyCharge,
    ftCharge,
    serviceCharge,
    vat,
    totalBill,
    tariffType,
  } = calculations;

  const averageKwhPerDay = totalKwh / 30;
  const averageBillPerDay = totalBill / 30;

  const topAppliances = [...rows]
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, 5);

  const top = topAppliances[0];

  const topShare =
    totalKwh > 0 && top
      ? (top.kwh / totalKwh) * 100
      : 0;

  const highUsageAlerts = topAppliances.filter(
    (item) =>
      totalKwh > 0 &&
      item.kwh / totalKwh >= 0.3,
  );

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            <Zap size={15} />
            Smart Energy Overview
          </span>

          <h3>????????????????????</h3>

          <p>
            ??????????????????????????????????????????????
            ???????????????????????????
          </p>
        </div>

        <div className="dashboard-period">
          <span>????????????</span>
          <strong>30 ???</strong>
        </div>
      </section>

      {/* Summary */}
      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card stat-energy">
          <div className="dashboard-stat-icon">
            <Zap size={21} />
          </div>

          <span>??????????</span>

          <strong>
            {totalKwh.toFixed(1)} <small>kWh</small>
          </strong>

          <em>
            ?????? {averageKwhPerDay.toFixed(1)} kWh/???
          </em>
        </article>

        <article className="dashboard-stat-card stat-money">
          <div className="dashboard-stat-icon">
            <CircleDollarSign size={21} />
          </div>

          <span>???????????</span>

          <strong>
            ?{money(totalBill)}
          </strong>

          <em>
            ?????? ?{money(averageBillPerDay)}/???
          </em>
        </article>

        <article className="dashboard-stat-card stat-top">
          <div className="dashboard-stat-icon">
            <TrendingUp size={21} />
          </div>

          <span>???????????</span>

          <strong>
            {top ? top.icon : "�"}{" "}
            {top ? top.name : "??????????????"}
          </strong>

          <em>
            {top
              ? `${top.kwh.toFixed(
                  1,
                )} kWh/????? � ${topShare.toFixed(1)}%`
              : "?????????????????????????????????"}
          </em>
        </article>

        <article className="dashboard-stat-card stat-average">
          <div className="dashboard-stat-icon">
            <Gauge size={21} />
          </div>

          <span>????????????</span>

          <strong>
            {appliances.length} <small>??????</small>
          </strong>

          <em>
            ???????????????????????????????
          </em>
        </article>
      </section>

      {/* Main */}
      <section className="dashboard-main-grid">
        <div className="panel dashboard-usage-panel">
          <div className="panel-header">
            <div>
              <h3>??????????????</h3>

              <p>
                ???????????????????????????????????????
              </p>
            </div>
          </div>

          <div className="dashboard-ranking">
            {topAppliances.length > 0 ? (
              topAppliances.map((item, index) => {
                const share =
                  totalKwh > 0
                    ? (item.kwh / totalKwh) * 100
                    : 0;

                return (
                  <div
                    className="dashboard-ranking-item"
                    key={item.id}
                  >
                    <span className="dashboard-rank">
                      {index + 1}
                    </span>

                    <span className="dashboard-appliance-icon">
                      {item.icon}
                    </span>

                    <div className="dashboard-ranking-info">
                      <div className="dashboard-ranking-title">
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.kwh.toFixed(1)} kWh
                        </span>
                      </div>

                      <div className="dashboard-progress">
                        <span
                          style={{
                            width: `${Math.min(
                              share,
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <small>
                        {share.toFixed(1)}%
                        ??????????????????
                      </small>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dashboard-empty">
                ?????????????????????????????
              </div>
            )}
          </div>
        </div>

        {/* Cost */}
        <div className="panel dashboard-cost-panel">
          <div className="panel-header">
            <div>
              <h3>??????????????</h3>

              <p>
                ???????????????? {tariffType}
              </p>
            </div>
          </div>

          <div className="dashboard-cost-list">
            <div>
              <span>??????????</span>
              <strong>
                ?{money(energyCharge)}
              </strong>
            </div>

            <div>
              <span>??? Ft</span>
              <strong>
                ?{money(ftCharge)}
              </strong>
            </div>

            <div>
              <span>?????????</span>
              <strong>
                ?{money(serviceCharge)}
              </strong>
            </div>

            <div>
              <span>VAT</span>
              <strong>
                ?{money(vat)}
              </strong>
            </div>
          </div>

          <div className="dashboard-cost-total">
            <span>???????????????</span>

            <strong>
              ?{money(totalBill)}
            </strong>
          </div>
        </div>
      </section>

      {/* Alerts + monthly */}
      <section className="dashboard-bottom-grid">
        <div className="panel dashboard-alert-panel">
          <div className="panel-header">
            <div>
              <h3>?????????????????</h3>

              <p>
                ????????????????????????????????????????
              </p>
            </div>

            <span className="dashboard-alert-count">
              {highUsageAlerts.length}
            </span>
          </div>

          {highUsageAlerts.length > 0 ? (
            <div className="dashboard-alert-list">
              {highUsageAlerts.map((item) => {
                const share =
                  totalKwh > 0
                    ? (item.kwh / totalKwh) * 100
                    : 0;

                return (
                  <div
                    className="dashboard-alert energy"
                    key={item.id}
                  >
                    <div className="dashboard-alert-icon">
                      <AlertTriangle size={18} />
                    </div>

                    <div>
                      <strong>
                        {item.icon} {item.name} ????????
                      </strong>

                      <p>
                        ?????????{" "}
                        {item.kwh.toFixed(1)} kWh/?????
                        ???? {share.toFixed(1)}%
                        ??????????????????
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-no-alert">
              <span>?</span>

              <div>
                <strong>
                  ???????????????????????
                </strong>

                <p>
                  ?????????????????????????????????????
                  ???????????????????????
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="panel dashboard-month-panel">
          <div className="panel-header">
            <div>
              <h3>??????????????</h3>

              <p>
                ?????????????????????????
                ??????????????
              </p>
            </div>
          </div>

          <div className="dashboard-placeholder-chart">
            <div className="placeholder-line">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="placeholder-axis">
              <span>??????? 1</span>
              <span>??????? 2</span>
              <span>??????? 3</span>
              <span>??????? 4</span>
            </div>
          </div>

          <div className="dashboard-month-note">
            <TrendingUp size={17} />

            <span>
              Step ????????????????????????/????????
              ???????????
            </span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="dashboard-actions">
        <button
          type="button"
          onClick={onOpenCalculator}
        >
          <Zap size={17} />
          ??????????????????????????
        </button>

        <button
          type="button"
          onClick={onOpenAnalysis}
        >
          <TrendingUp size={17} />
          ??????????????????????
        </button>
      </section>
    </div>
  );
}

export default DashboardPage;

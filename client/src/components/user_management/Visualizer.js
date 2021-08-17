import React from "react";

export default function Visualizer({
  details,
  successRate,
  avgPoints,
  time,
  isSame,
  group,
  isGlobal,
}) {
  const completionPercent = (completion) => (
    <div className="progress w-50 m-auto">
      <div
        className="progress-bar bg-primary"
        role="progressbar"
        style={{ width: `${completion}%` }}
        aria-valuenow={completion}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {`${completion}`}%
      </div>
      <div
        className="progress-bar bg-secondary"
        role="progressbar"
        style={{ width: `${100 - completion}%` }}
        aria-valuenow={100 - completion}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {`${100 - completion}`}%
      </div>
    </div>
  );

  const timeDisplay = (time) => (
    <svg
      className="m-auto border border-primary rounded-circle border-bottom-0 shadow"
      width="100"
      height="100"
    >
      <circle cx="50" cy="50" r="50" fill="#ffffff" />
      <text
        x="50%"
        y="50%"
        alignmentBaseline="central"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="16"
        fill="#000"
      >
        {time}
      </text>
    </svg>
  );

  const avgSuccess = (successRate) => {
    let fillColor = "#009c34";
    if (successRate) {
      fillColor =
        Number.parseInt(successRate.replace("%", "")) > 50
          ? "#009c34"
          : "#9c0000";
    }

    return (
      <svg
        className="m-auto border rounded-circle shadow"
        width="100"
        height="100"
      >
        <circle cx="50" cy="50" r="50" fill={fillColor} />
        <text
          x="50%"
          y="50%"
          alignmentBaseline="central"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontSize="20"
          fill="#fff"
        >
          {successRate}
        </text>
      </svg>
    );
  };

  const scoreDisplay = (avgPoints) => (
    <svg
      className="m-auto border border-secondary rounded-circle border-bottom-0 shadow"
      width="100"
      height="100"
    >
      <circle cx="50" cy="50" r="50" fill="#ffffff" />
      <text
        x="50%"
        y="50%"
        alignmentBaseline="central"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="16"
        fill="#000"
      >
        {avgPoints}
      </text>
    </svg>
  );

  if (isSame && ["admin", "Adminisztrátor"].includes(group) && isGlobal) {
    return (
      <div className="container shadow rounded text-center bg-light mb-3 py-3">
        <h2>Összesített statisztika</h2>
        <hr />
        <div className="my-2">
          <h5>
            Az Ön vizsgáit {details.completion}%-ban teljesítették azok, akik
            számára elérhetőek a vizsgái.
          </h5>
          {completionPercent(details.completion)}
        </div>

        <div className="my-2">
          <h5>
            Összesen {details.global.completion}%-ban teljesítették a
            képzettségi mátrix vizsgáit.
          </h5>
          {completionPercent(details.global.completion)}
        </div>

        <div className="row my-2">
          <div className="col-6">
            <h5>Átlagos teljesítési idő</h5>
            {timeDisplay(time)}
          </div>

          <div className="col-6">
            <h5>Globális átlag teljesítési idő</h5>
            {timeDisplay(details.global.avgTime)}
          </div>
        </div>

        <div className="row my-2">
          <div className="col-6">
            <h5>Sikerességi arány</h5>
            {avgSuccess(successRate)}
          </div>

          <div className="col-6">
            <h5>Globális sikerességi arány</h5>
            {avgSuccess(details.global.successRate)}
          </div>
        </div>

        <div className="my-2">
          <h5>Átlag pontszám</h5>
          {scoreDisplay(avgPoints)}
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={
          isGlobal
            ? "container shadow rounded text-center bg-light mb-3 py-3"
            : "container text-center bg-light mb-3 py-3"
        }
      >
        <h2>
          {isGlobal ? "Összesített statisztika" : "A vizsga statisztikája"}
        </h2>
        <hr />
        <div className="my-2">
          <h5>{details.completion}%-os teljesítettség</h5>
          {completionPercent(details.completion)}
        </div>

        <div className="row my-2">
          <div className="col-6">
            <h5>Átlagos teljesítési idő</h5>
            {timeDisplay(time)}
          </div>

          <div className="col-6">
            <h5>Átlag pontszám</h5>
            {scoreDisplay(avgPoints)}
          </div>
        </div>

        <div className="my-2">
          <h5>Sikerességi arány</h5>
          {avgSuccess(successRate)}
        </div>
      </div>
    );
  }
}

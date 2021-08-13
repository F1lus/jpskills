import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router";

import Learn from "../exams/learn/Learn";
import DetailTable from "./DataTable";

import useGlobalStats from "./models/ExamStatistics";
import Visualizer from "./Visualizer";

import { SocketContext } from "../GlobalSocket";
import { NavLink } from "react-router-dom";

export default function Profile() {
  //Adatok + szűrések
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  //Felhasználói adatok
  const [nev, setNev] = useState("");
  const [csoport, setCsoport] = useState("");
  const [isSame, setSame] = useState(false);

  //Egyéb statek
  const [incomingStats, setIncomingStats] = useState(null);
  const [details, setDetails] = useState({
    completion: 0,
    global: {
      successRate: 0,
      avgTime: "0 p 0 mp",
      completion: 0,
    },
  });

  //Konstans változók
  const cardNum = useParams().profile;

  const socket = useContext(SocketContext);

  const stats = useGlobalStats(incomingStats);

  const handleStatistics = useCallback((stats) => {
    setIncomingStats(stats);
  }, []);

  const handleUsers = useCallback((users) => {
    setData(users);
    setFiltered(users);
  }, []);

  const handleInfo = useCallback((user) => {
    setNev(user[0].name);
    setCsoport(user[0].group);
  }, []);

  const handleSameUser = useCallback((result) => {
    setSame(result);
  }, []);

  const handleDetails = useCallback((details) => {
    setDetails({
      completion: details.completion,
      global: {
        successRate: (details.global && details.global.successRate) || 0,
        avgTime: (details.global && details.global.avgTime) || '0 p 0 mp',
        completion: (details.global && details.global.completion) || 0
      }
    });
  }, []);

  useEffect(() => {
    socket
      .emit("requesting-statistics", cardNum)
      .emit("get-user-list", cardNum)
      .emit("get-userinfo", cardNum)
      .emit("get-sameUser", cardNum)
      .emit("get-details", cardNum);

    socket
      .on("sending-statistics", handleStatistics)
      .on("user-list", handleUsers)
      .on("userinfo", handleInfo)
      .on("sameUser", handleSameUser)
      .on("detailStat", handleDetails);

    return () => {
      socket
        .off("sending-statistics", handleStatistics)
        .off("user-list", handleUsers)
        .off("userinfo", handleInfo)
        .off("sameUser", handleSameUser)
        .off("detailStat", handleDetails);
    };
  }, [
    cardNum,
    handleStatistics,
    handleUsers,
    handleInfo,
    handleSameUser,
    handleDetails,
    socket,
  ]);

  const renderStatsObject = useCallback(
    (entry) => {
      if (stats) {
        switch (entry) {
          case "time":
            return (
              stats.avgTime.avgMins + " p " + stats.avgTime.avgSecs + " mp"
            );
          case "score":
            return stats.avgScore;
          case "completion":
            return stats.completionRate + "%";
          case "skills":
            return stats.skills;
          default:
            return null;
        }
      }
    },
    [stats]
  );

  const renderGlobalStats = useCallback(
    () => (
      <div className="text-justify">
        <div>
          Átlagos vizsgaidő: {renderStatsObject("time") || "Nincs adat"}
        </div>
        <div>Átlagos pontszám: {renderStatsObject("score")}</div>
        <div>
          Sikerességi arány: {renderStatsObject("completion") || "Nincs adat"}
        </div>
      </div>
    ),
    [renderStatsObject]
  );

  const search = useCallback(
    (event) => {
      if (event.target.value.length > 0) {
        const filteredBy = data.filter((item) => {
          const search = event.target.value.toLowerCase().trim();
          return (
            item.worker_name.includes(search) ||
            item.worker_name.toLowerCase().includes(search) ||
            item.worker_cardcode.toString().includes(search)
          );
        });
        setFiltered(filteredBy);
      } else {
        setFiltered(data);
      }
    },
    [data]
  );

  //Render

  const canDisplayLearn = useCallback(() => {
    if (isSame) {
      return (
        <div className="container shadow rounded text-center bg-light mb-3">
          <Learn superuser={false}/>
        </div>
      );
    }else{
      return null
    }
  }, [isSame])

  return (
    <div className="container-fluid text-center page">
      <div className="row">
        <div className="col-lg-3 mt-3">
          <form className="bg-light shadow rounded p-2">
            <div className="form-group m-auto ">
              <input
                type="text"
                name="search"
                autoComplete="off"
                onChange={search}
                required
              />
              <label htmlFor="examName" className="label-name">
                <span className="content-name">Vizsgázó keresése</span>
              </label>
            </div>
            {
              <ul className="list-group w-75 mx-auto" id="users">
                {filtered.map((elem, index) => {
                  return (
                    <NavLink
                      to={`/profile/${elem.worker_cardcode}`}
                      key={index}
                    >
                      <li className="list-group-item">{elem.worker_name}</li>
                    </NavLink>
                  );
                })}
              </ul>
            }
          </form>

          <ProfileCard
            className="mt-3 shadow"
            nev={nev}
            csoport={csoport}
            stats={renderGlobalStats()}
          />
        </div>

        <div className="mt-3 col-lg-9">
          <Visualizer
            details={details}
            time={renderStatsObject("time") || "Nincs adat"}
            successRate={renderStatsObject("completion")}
            avgPoints={renderStatsObject("score")}
            isSame={isSame}
            group={csoport}
            isGlobal={true}
          />

          {canDisplayLearn()}

          <div className="container shadow rounded text-center bg-light mb-3 py-3">
            <DetailTable //TODO Vizsgánkénti statisztika megvalósítása
              user={nev}
              permission={csoport}
              results={renderStatsObject("skills")}
              socket={socket}
              isSame={isSame}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileCard = ({ nev, csoport, stats, className }) => (
  <div className={`card ${className}`}>
    <br />
    <svg className="m-auto" width="100" height="100">
      <circle cx="50" cy="50" r="50" fill="#ffc107" />
      <text
        x="50%"
        y="50%"
        alignmentBaseline="central"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="50"
        fill="#fff"
      >{`${nev ? nev.split(" ")[0].charAt(0) : "J"}${
        nev ? nev.split(" ")[1].charAt(0) : "D"
      }`}</text>
    </svg>

    <div className="card-body">
      <h5 className="card-title">{nev}</h5>
      <h6 className="card-subtitle mb-2 text-muted">Besorolás: {csoport}</h6>
      <hr />
      <p className="card-text">Rövid jellemzés</p>
      <div className="card-text">{stats}</div>
    </div>
  </div>
);

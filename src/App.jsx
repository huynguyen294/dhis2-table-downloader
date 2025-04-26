import { useEffect, useState } from "react";
import style from "./App.css?raw";

function App() {
  const [tableName, setTableName] = useState(null);
  // const [selected, setSelected] = useState([]);

  const handleDownload = async () => {
    try {
      await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true }, (tabs) => {
          const currentTab = tabs[0];
          chrome.tabs.sendMessage(currentTab.id, { action: "download", style }, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await new Promise((resolve, reject) => {
          chrome.tabs.query({ active: true }, (tabs) => {
            const currentTab = tabs[0];
            chrome.tabs.sendMessage(currentTab.id, { action: "detect" }, (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                if (response) {
                  setTableName(response);
                } else {
                  setTableName(null);
                }
              }
            });
          });
        });
      } catch (e) {
        console.log(e);
        setTableName(null);
      }
    })();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p>Table : {tableName || "No table found!"}</p>
        <br />
      </div>
      <button style={{ width: 200 }} onClick={handleDownload}>
        Download
      </button>
    </div>
  );
}

export default App;

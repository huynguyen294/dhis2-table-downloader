chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    const { action, style = "" } = message;

    const getTableName = (table = document) => {
      const tr = table.querySelector("table tr:first-child");
      return tr.innerText;
    };

    const getTable = () => {
      const tablePivot = document.querySelector("table.pivot");
      if (tablePivot) {
        return { mode: "event-report", table: tablePivot };
      }

      const tableDataVisualizer = document.querySelector("div[data-test='visualization-container'] table");
      if (tableDataVisualizer) {
        return { mode: "data-visualizer", table: tableDataVisualizer };
      }

      return { table: null };
    };

    if (action === "detect") {
      const { table } = getTable();
      sendResponse(table ? getTableName(table) : null);
      return;
    }

    const downloadExcel = (html, fileName = "Table downloaded") => {
      const blob = new Blob([html], { type: "application/vnd.ms-excel" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName + ".xls";
      a.click();
      a.remove();
    };

    // remove all td class, just keep 1
    const cleanElement = (td, mode) => {
      const classList = td.classList[mode === "event-report" ? 0 : 1] || "";
      td.classList = classList;
      const text = td.textContent;
      td.innerHTML = text;
      td.style = "";
    };

    if (action === "download") {
      const { mode, table } = getTable();

      if (!table) {
        sendResponse(null);
        return;
      }

      const tableName = getTableName(table);

      const clonedTable = table.cloneNode(true);
      clonedTable.classList = mode === "event-report" ? ["pivot"] : ["data-visualizer"];

      const tds = clonedTable.querySelectorAll("table td");
      [...tds].forEach((td) => cleanElement(td, mode));
      const ths = clonedTable.querySelectorAll("table th");
      [...ths].forEach((th) => cleanElement(th, mode));

      const html = `<style>${style}</style>${clonedTable.outerHTML || ""}`;
      downloadExcel(html, tableName);
      sendResponse("Download successfully!");
      return;
    }
  } catch (error) {
    console.log(error);
    // đảm bảo luôn phản hồi để không đóng cổng bất ngờ
    sendResponse(null);
    return;
  }
});

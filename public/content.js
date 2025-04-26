console.log("event-report-download-extension start...");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, style = "" } = message;

  const getTableName = (table = document) => {
    const tr = table.querySelector("table tr:first-child");
    return tr.innerText;
  };

  const getTable = () => {
    const tablePivot = document.querySelector("table.pivot");
    if (tablePivot) {
      tablePivot.classList = ["pivot"];
      return { mode: "event-report", table: tablePivot };
    }

    const tableDataVisualizer = document.querySelector("div[data-test='visualization-container'] table");
    if (tableDataVisualizer) {
      tableDataVisualizer.classList = ["data-visualizer"];
      return { mode: "data-visualizer", table: tableDataVisualizer };
    }

    return { table: null };
  };

  if (action === "detect") {
    const { table } = getTable();
    if (table) {
      sendResponse(getTableName(table));
    } else {
      sendResponse(null);
    }
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

    if (table) {
      const tableName = getTableName(table);

      const clonedTable = table.cloneNode(true);
      clonedTable.classList = clonedTable.classList[0] || "";

      const tds = clonedTable.querySelectorAll("table td");
      [...tds].forEach((td) => cleanElement(td, mode));
      const ths = clonedTable.querySelectorAll("table th");
      [...ths].forEach((th) => cleanElement(th, mode));

      const html = `<style>${style}</style>${clonedTable.outerHTML || ""}`;
      console.log(html);
      downloadExcel(html, tableName);
      sendResponse("Download successfully!");
    } else {
      sendResponse(null);
    }
  }

  // Nếu cần giữ kết nối mở để gửi phản hồi sau, trả lại true
  return true;
});

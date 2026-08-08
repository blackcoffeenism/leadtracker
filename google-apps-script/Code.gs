/**
 * Google Apps Script Web App API & Dropdown Automator for LeadFlow CRM / JAD Tracker
 * Spreadsheet ID: 1qTmp6AdRoqdOxYS4LwTb1zg9T1gRapDCyqfU5i42ZFY
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

/**
 * Trigger: Automatically updates Agent dropdown options whenever the spreadsheet is opened
 */
function onOpen() {
  updateAgentDropdown();
}

/**
 * Trigger: Automatically updates Agent dropdown options whenever permissions or content change
 */
function onChange(e) {
  updateAgentDropdown();
}

/**
 * Core function to automate 'Agent' column dropdown options with Google Account Emails
 */
function updateAgentDropdown() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var file = DriveApp.getFileById(ss.getId());

    var shareListEmails = [];

    // 1. Get Owner Email
    var owner = file.getOwner();
    if (owner && owner.getEmail()) {
      var ownerEmail = owner.getEmail().toLowerCase().trim();
      if (shareListEmails.indexOf(ownerEmail) === -1) shareListEmails.push(ownerEmail);
    }

    // 2. Get Editors Emails
    file.getEditors().forEach(function(u) {
      if (u && u.getEmail()) {
        var email = u.getEmail().toLowerCase().trim();
        if (shareListEmails.indexOf(email) === -1) shareListEmails.push(email);
      }
    });

    // 3. Get Viewers Emails
    file.getViewers().forEach(function(u) {
      if (u && u.getEmail()) {
        var email = u.getEmail().toLowerCase().trim();
        if (shareListEmails.indexOf(email) === -1) shareListEmails.push(email);
      }
    });

    if (shareListEmails.length === 0) return { shareListEmails: [] };

    // 4. Locate 'Agent' column header in row 1
    var lastCol = Math.max(sheet.getLastColumn(), 10);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var targetColIdx = 7; // Default Column G (7th column)

    for (var c = 0; c < headers.length; c++) {
      var headerText = String(headers[c]).trim().toLowerCase();
      if (headerText.indexOf("agent") !== -1) {
        targetColIdx = c + 1;
        break;
      }
    }

    // 5. Build Data Validation rule for Dropdown with Google Account Emails
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(shareListEmails, true)
      .setAllowInvalid(true)
      .setHelpText("Select an authorized agent Google email address.")
      .build();

    // 6. Clear old validation and apply fresh Email Dropdown rule to Agent column
    var numRowsToApply = Math.max(sheet.getMaxRows() - 1, 100);
    var agentColumnRange = sheet.getRange(2, targetColIdx, numRowsToApply, 1);
    
    agentColumnRange.clearDataValidations();
    agentColumnRange.setDataValidation(rule);

    Logger.log("Successfully Applied Agent Email Dropdown to Column " + targetColIdx + ": " + shareListEmails.join(", "));
    return { shareListEmails: shareListEmails };

  } catch (error) {
    Logger.log("Error in updateAgentDropdown: " + error.toString());
    return { shareListEmails: [] };
  }
}

/**
 * Handle incoming API requests (Permission check, Leads sync, Add Lead, & Agent filtering)
 */
function handleRequest(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = (params.action || "checkPermission").trim();
    var targetEmail = (params.email || params.agent || "").trim().toLowerCase();

    var postObj = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postObj = JSON.parse(e.postData.contents);
      } catch (jsonErr) {}
    }

    // 1. ADD NEW LEAD ACTION (Save Lead directly into Google Sheet row)
    if (action === "addLead" || postObj.action === "addLead" || (postObj.name && postObj.name.trim() !== "")) {
      var leadName = (params.name || postObj.name || "").trim();
      var leadMobile = (params.mobileNumber || params.phone || postObj.mobileNumber || postObj.phone || "").trim();
      var leadEmail = (params.email || postObj.email || "").trim();
      var leadLocation = (params.location || params.address || postObj.location || postObj.address || "").trim();
      var leadStatus = (params.status || postObj.status || "Warm Lead").trim();
      var leadRemarks = (params.remarks || params.notes || postObj.remarks || postObj.notes || "").trim();
      var leadAgent = (params.agent || postObj.agent || targetEmail || "").trim();

      if (leadName !== "") {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getActiveSheet();

        // Append 7-column row: [Name, Mobile Number, Email, Location, Lead Status, Remarks, Agent]
        sheet.appendRow([
          leadName,
          leadMobile,
          leadEmail,
          leadLocation,
          leadStatus,
          leadRemarks,
          leadAgent
        ]);

        updateAgentDropdown();

        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Lead successfully saved to Google Sheet!",
          lead: {
            name: leadName,
            mobileNumber: leadMobile,
            email: leadEmail,
            location: leadLocation,
            status: leadStatus,
            remarks: leadRemarks,
            agent: leadAgent
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var agentInfo = updateAgentDropdown();
    var shareList = agentInfo.shareListEmails || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var fileId = ss.getId();

    // Read Sheet Rows (Name, Mobile Number, Email, Location, Lead Status, Remarks, Agent)
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var allLeads = [];

    if (data && data.length > 1) {
      var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
      
      var findIdx = function(keywords) {
        return headers.findIndex(function(h) {
          return keywords.some(function(k) { return h.indexOf(k) !== -1; });
        });
      };

      var nameIdx = findIdx(["name", "client", "lead"]);
      var mobileIdx = findIdx(["mobile", "phone", "number", "contact"]);
      var emailIdx = findIdx(["email", "mail"]);
      var locationIdx = findIdx(["location", "address", "city"]);
      var statusIdx = findIdx(["status", "stage", "lead status"]);
      var remarksIdx = findIdx(["remarks", "remark", "notes", "comment"]);
      var agentIdx = findIdx(["agent", "assigned", "rep", "owner"]);

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row || row.length === 0) continue;

        var nameVal = row[nameIdx !== -1 ? nameIdx : 0];
        if (!nameVal || String(nameVal).trim() === "") continue;

        var mobileVal = row[mobileIdx !== -1 ? mobileIdx : 1] || "";
        var emailVal = row[emailIdx !== -1 ? emailIdx : 2] || "";
        var locationVal = row[locationIdx !== -1 ? locationIdx : 3] || "";
        var statusVal = row[statusIdx !== -1 ? statusIdx : 4] || "Warm Lead";
        var remarksVal = row[remarksIdx !== -1 ? remarksIdx : 5] || "";
        var agentVal = row[agentIdx !== -1 ? agentIdx : 6] || "";

        allLeads.push({
          id: "gs_" + i,
          name: String(nameVal).trim(),
          mobileNumber: String(mobileVal).trim(),
          phone: String(mobileVal).trim(),
          email: String(emailVal).trim(),
          location: String(locationVal).trim(),
          address: String(locationVal).trim(),
          status: String(statusVal).trim(),
          remarks: String(remarksVal).trim(),
          notes: String(remarksVal).trim(),
          agent: String(agentVal).trim(),
          source: "Google Sheet",
          assignedDate: "Synced",
          dealValue: "$0"
        });

        if (emailVal) {
          var em = String(emailVal).trim().toLowerCase();
          if (em.indexOf("@") !== -1 && shareList.indexOf(em) === -1) shareList.push(em);
        }
      }
    }

    var isAllowed = false;
    if (targetEmail) {
      isAllowed = shareList.indexOf(targetEmail) !== -1;
    }

    // Filter leads associated with logged-in targetEmail
    var userLeads = allLeads;
    if (targetEmail) {
      var usernamePrefix = targetEmail.split("@")[0].toLowerCase();
      userLeads = allLeads.filter(function(lead) {
        if (!lead.agent) return false;
        var ag = lead.agent.toLowerCase().trim();
        return ag === targetEmail || ag === usernamePrefix || ag.indexOf(usernamePrefix) !== -1 || targetEmail.indexOf(ag) !== -1;
      });
    }

    var responseObj = {
      status: "success",
      targetEmail: targetEmail,
      isAllowed: isAllowed,
      shareList: shareList,
      authorizedAgents: shareList,
      totalLeads: userLeads.length,
      allSheetLeadsCount: allLeads.length,
      leads: userLeads
    };

    return ContentService.createTextOutput(JSON.stringify(responseObj))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errObj = {
      status: "error",
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

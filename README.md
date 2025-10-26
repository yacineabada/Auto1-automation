# Auto1-Task
This is a test assignment for the junior javascript interview at auto 1 group
# Google Sheets & Gmail Automation Script

## Overview

This project automates expense tracking and monthly financial reporting by integrating Google Sheets, Gmail, and Google Calendar. It helps teams manage expenses efficiently by validating input data, generating monthly reports, notifying the finance team via email, and scheduling calendar reminders.

## 📁 Repository Structure

### 1. `data-validation/`

This folder contains scripts responsible for validating entries in the Google Sheet in real-time.

#### Key Features:

* Ensures that all required fields (e.g., Date, Category, Amount, Description) are filled before submission.
* Displays an alert message if a user tries to enter incomplete data.
* Prevents blank spaces between rows

**Example:** When a user edits a row, the script automatically checks for missing fields and alerts the user if something is missing highlighting it in red.

### 2. `monthly-report-and-notification/`

This folder contains scripts for generating reports, sending notifications, and creating calendar invites.

#### Key Features:

##### 1. Generate Monthly Reports

* At the end of each month, it compiles all expenses per team.
* Creates a new sheet named `TeamName_YYYY_MM`.
* Calculates:
  * Total expenses per category
  * Overall total for each team

##### 2. Email Notifications

* Sends an automated email to the finance team (`venkat.aluri@auto1.com`) with:
  * A summary of total expenses
  * A direct link to the generated report

##### 3. Calendar Invite

* On the first working day of each month, automatically sends a Google Calendar invite to the finance team.
* The report is attached to the invite for quick access.

## ⚙️ How It Works

1. **Data Validation** runs every time a user edits a row.
2. **Monthly Report & Notification** scripts are triggered automatically:
   * At the end of each month → generate reports
   * On the first working day of the next month → send emails and calendar invites
  
## How to make it work

### Prerequisites

- Google Workspace account with access to:
  - Google Sheets
  - Gmail
  - Google Calendar
- Required permissions for Apps Script execution

### Installation

1. Clone this repository
2. Open your Google Sheet
3. Navigate to **Extensions → Apps Script**
4. Copy the scripts from each folder into your Apps Script project
5. Configure triggers according to your requirements

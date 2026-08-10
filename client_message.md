# AP Maintenance - Quote & Contact Management Requirements

**Date:** August 6, 2026

---

# Overview

The client requested improvements to the Quote Management workflow, Contact Management system, and Job Assignment process.

---

# 1. Mandatory Fields

The following fields must be **required (mandatory)** when creating a new quote or work order:

- Person/Manager who sent the work order
- Full Address
- Contact
- Work Description

Validation should prevent submission until all mandatory fields are completed.

---

# 2. Contact Management

A dedicated Contacts module should store resident/customer information.

## Contact Fields

| Field | Required |
|--------|----------|
| Full Name | ✅ Yes |
| Email Address | ❌ No |
| Phone Number | ✅ Yes |
| Address | ✅ Yes |

---

# 3. Auto-Fill Contact Information

When creating a Quote:

1. Search for an existing contact by name.
2. Selecting the contact should automatically populate:
   - Full Name
   - Email Address
   - Phone Number
   - Address
3. Users should only manually enter:
   - Work Description
   - Estimated Hours Required

This reduces duplicate data entry and speeds up quote creation.

---

# 4. Quote Sent Workflow

Add a button at the bottom of the Quote form:

## Button

**Quote Sent**

### Functionality

When clicked:

- Mark the quote as completed.
- Automatically move the job into the **Completed Quotes** section.
- No manual transfer should be required.

---

# 5. Request Photos & Information

Add another action button:

## Button

**Request Photos and Information**

### Functionality

When clicked:

- Send a message/SMS to the resident's phone number.
- Request:
  - Supporting photos
  - Additional information
  - Description of the issue/work required

This should use the phone number stored in the selected contact.

---

# 6. Staff Assignment

At the bottom of the Quote form, add a dropdown field.

## Field

**Assign Staff**

### Functionality

- Display a dropdown list of staff members.
- Allow the user to assign the job to a specific staff member.

### Purpose

Some jobs require specialists.

Only the assigned staff member's calendar should display the job, allowing residents to book only into the appropriate staff calendar rather than every staff member's calendar.

---

# Workflow Summary

1. Add or select an existing contact.
2. Contact information auto-fills.
3. Enter:
   - Work Description
   - Estimated Hours
4. Assign the job to the appropriate staff member.
5. Choose one of the available actions:
   - **Quote Sent** → Move job to Completed Quotes.
   - **Request Photos and Information** → Send SMS requesting photos and additional details.

---

# Expected Benefits

- Faster quote creation
- Reduced duplicate data entry
- Improved contact management
- Automated quote completion workflow
- Better communication with residents
- Staff-specific scheduling
- Cleaner job allocation process
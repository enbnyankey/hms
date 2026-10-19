# AuraHealth HMS — Demo Accounts

Every demo account uses the same password:

```
Passw0rd!
```

These accounts are created by the backend migration `V4__seed_users.sql`
(hms-backend). If you reset the database (`reset-db-and-run.bat`), they are
recreated automatically.

> Demo use only. Change or remove these accounts before the system holds real
> patient data.

## Accounts

| Role | Email | Name | Lands on after login | Screens they can open |
| --- | --- | --- | --- | --- |
| Administrator | `admin@aurahealth.demo` | Nana Adjei | Dashboard | Everything |
| Doctor | `doctor@aurahealth.demo` | Dr. Ama Boateng | Doctor Workspace | Doctor Workspace, Ward & Bed Manager, Patient Registry, Pharmacy, Laboratory |
| Student Doctor | `student.doctor@aurahealth.demo` | Kwame Mensah | Doctor Workspace | Doctor Workspace (read-only), Patient Registry |
| Nurse | `nurse@aurahealth.demo` | Efua Owusu | Ward & Bed Manager | Ward & Bed Manager, Nursing & eMAR, Patient Registry |
| Pharmacist | `pharmacist@aurahealth.demo` | Yaw Darko | Pharmacy & Inventory | Pharmacy & Inventory |
| Lab Technician | `labtech@aurahealth.demo` | Abena Sarpong | Laboratory & Diagnostics | Laboratory & Diagnostics |
| Billing Clerk | `billing@aurahealth.demo` | Kojo Antwi | Billing & Claims | Billing & Claims, Patient Registry |
| Front Desk / Registrar | `frontdesk@aurahealth.demo` | Akosua Frimpong | Patient Registry | Patient Registry |
| Compliance / Auditor | `compliance@aurahealth.demo` | Esi Appiah | Reports & Analytics | Reports & Analytics, Audit Trail, Staff Credentialing |

Access is enforced twice: the frontend hides screens a role can't use
(`hms/lib/auth.tsx` → `ROUTE_ACCESS`), and the backend rejects API calls from
the wrong role with **403 Forbidden** (`@PreAuthorize` on each controller).

## What each role can do (connected modules)

| Action | Who |
| --- | --- |
| Register / edit patients | Admin, Front Desk, Nurse |
| Verify NHIS | Admin, Front Desk, Billing Clerk |
| Deactivate a patient record | Admin, Front Desk (reactivate: Admin only) |
| Admit, transfer, discharge, edit bed details | Admin, Doctor, Nurse |
| Mark beds clean, reserve, out of service, nurses on duty | Admin, Nurse |
| Give / hold doses, record vitals, handover notes (eMAR) | Admin, Nurse |
| Prescribe / stop medication | Admin, Doctor |
| Order lab tests | Admin, Doctor, Lab Technician |
| Receive specimens, enter results, validate, QC | Admin, Lab Technician |
| Consultation notes, diagnoses, problems, imaging requests | Admin, Doctor |

## Good records to try

| Try this | Log in as | Where |
| --- | --- | --- |
| Outpatient with a full consultation (allergies, BP trend, diagnoses, prescriptions, labs, imaging) — **Kwame Boateng** | doctor | Doctor Workspace |
| Prescribe Amoxicillin to Kwame Boateng → blocked by his penicillin allergy | doctor | Doctor Workspace → Prescriptions |
| Critical potassium (6.8) waiting for a phone call before release — **Bernard Appiah** | labtech | Laboratory |
| Sepsis patient in ICU bed E-02 — **Akua Darko** | nurse | Ward & Bed Manager / Nursing & eMAR |
| PRN morphine (controlled drug, needs a witness) — **Yaa Amah**, Ward B | nurse | Nursing & eMAR |
| Patients waiting for a bed (Emmanuel Quaye, Patricia Mensah, Yaw Ofori) | nurse | Ward & Bed Manager → Admissions Queue |

## Logging in from the command line

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nurse@aurahealth.demo","password":"Passw0rd!"}'
# -> { "token": "...", "name": "Efua Owusu", "role": "nurse", ... }
```

Send the token on later calls as `Authorization: Bearer <token>`. Tokens last
8 hours; after that the frontend sends you back to the login page.

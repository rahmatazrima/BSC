# Booking Page Integration - Master Data Implementation

## Overview
This document describes the implementation of master data integration on the booking page for Bukhari Service Center.

## Completed Features

### 1. ✅ Fetch Handphone (Dropdown Selection)
**Implementation:**
- Fetches all handphone data from `/api/handphone`
- Displays unique brands in first dropdown
- Shows models/types for selected brand in second dropdown
- Automatically resets model selection when brand changes
- Resets kendala selection when handphone changes

**Step 1 - Device Information:**
```typescript
- Brand Dropdown: Displays unique brands from database
- Model Dropdown: Shows models filtered by selected brand
- Data stored as: serviceData.handphoneId
```

### 2. ✅ Fetch Kendala (Problem Selection)
**Implementation:**
- Fetches all kendala from `/api/kendala-handphone`
- Filters kendala based on selected handphone
- Displays kendala as selectable buttons (can select multiple)
- Shows associated sparepart name and price below each kendala
- Displays warning if no handphone selected

**Step 2 - Problem Description:**
```typescript
- Kendala Buttons: Shows topikMasalah with pricing info
- Multiple selection supported
- Data stored as: serviceData.kendalaIds (array)
- Displays: "X masalah dipilih"
```

### 3. ✅ Fetch Jadwalkan (Schedule Selection)
**Implementation:**
- Fetches all shifts from `/api/waktu`
- Date picker for selecting service date
- Shift dropdown showing:
  - Shift name (e.g., Shift 1, Shift 2, Shift 3)
  - Time range (jamMulai - jamSelesai)
- All shifts available for selection (availability managed by API during booking)

**Step 3 - Schedule:**
```typescript
- Date Input: Select service date
- Shift Dropdown: Shows namaShift with time range
- Data stored as:
  - serviceData.schedule.date
  - serviceData.schedule.waktuId
```

### 4. ✅ Fetch Post Create Service (Booking Submission)
**Implementation:**
- Submits booking via POST to `/api/service`
- Sends data:
  - tempat: Service type (location/visit)
  - tanggalPesan: Selected date
  - handphoneId: Selected phone ID
  - waktuId: Selected shift ID
  - statusService: "PENDING"
- Shows loading state during submission
- Success: Redirects to `/history`
- Error: Displays error message

**Confirm Button:**
```typescript
- Disabled during loading
- Shows "Memproses..." when loading
- Calls handleSubmit() function
```

### 5. ✅ Fetch Logic - Price Calculation
**Implementation:**
- Calculates total price based on:
  - Selected kendalas (multiple)
  - Associated pergantianBarang prices
  - Service type (adds +50,000 for visit service)
- Shows price breakdown in Step 5
- Updates in real-time based on selections

**Price Logic:**
```typescript
calculatePrice():
  - For each selected kendala:
    - Get pergantianBarang[0].harga
    - If "Mekanik datang ke lokasi": harga + 50,000
    - Else: harga only
  - Sum all prices
  - Display in Step 5 confirmation
```

## Data Flow

### State Management
```typescript
interface ServiceData {
  handphoneId: string;           // Selected phone ID
  kendalaIds: string[];          // Selected problem IDs (multiple)
  schedule: {
    date: string;                // Service date
    waktuId: string;             // Selected shift ID
  };
  serviceType: string;           // Service location type
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
}
```

### Master Data States
```typescript
- handphones: Handphone[]      // All phones
- kendalas: KendalaHandphone[] // Filtered by handphoneId
- waktuList: Waktu[]           // All shifts
```

### API Integration

#### 1. GET /api/handphone
```json
Response:
{
  "status": true,
  "content": [
    {
      "id": "uuid",
      "brand": "Samsung",
      "tipe": "Galaxy S24"
    }
  ]
}
```

#### 2. GET /api/kendala-handphone
```json
Response:
{
  "status": true,
  "content": [
    {
      "id": "uuid",
      "topikMasalah": "Ganti LCD",
      "handphoneId": "uuid",
      "pergantianBarang": [
        {
          "id": "uuid",
          "namaBarang": "LCD Original",
          "harga": 500000
        }
      ]
    }
  ]
}
```

#### 3. GET /api/waktu
```json
Response:
{
  "status": true,
  "content": [
    {
      "id": "uuid",
      "namaShift": "Shift 1",
      "jamMulai": "08:00",
      "jamSelesai": "12:00",
      "isAvailable": true
    }
  ]
}
```

#### 4. POST /api/service
```json
Request:
{
  "tempat": "Datang ke Bukhari Service Center",
  "tanggalPesan": "2025-11-10",
  "handphoneId": "uuid",
  "waktuId": "uuid",
  "statusService": "PENDING"
}

Response:
{
  "message": "Service created successfully",
  "data": { ... }
}
```

## UI/UX Features

### Step 1 - Device Information
- Brand dropdown appears first
- Model dropdown only shows after brand selection
- Clean dropdown design with arrow indicator
- Dark theme compatible

### Step 2 - Problem Description
- Card-based button layout (2 columns on desktop)
- Selected state: Blue border and background
- Hover effects on unselected
- Price preview below each problem
- Counter showing number of selected problems
- Warning message if no phone selected

### Step 3 - Schedule
- Date picker with minimum date = today
- Shift dropdown with formatted time ranges
- Helper text: "Tersedia Shift 1, 2, dan 3 setiap harinya"
- Dark theme for inputs

### Step 4 - Service Type
- Unchanged from original
- Two options: Visit center or home service
- Address field appears for home service

### Step 5 - Confirmation
- Two-column layout (device details | schedule)
- Shows full device name: Brand + Type
- Lists all selected problems with sparepart details
- Formatted date display (Indonesian locale)
- Shift name with time range
- Price breakdown:
  - Base price from spareparts
  - Visit service surcharge indicator
  - Total price prominently displayed
  - Disclaimer about price changes after diagnosis

## Technical Details

### Type Definitions
```typescript
interface Handphone {
  id: string;
  brand: string;
  tipe: string;
}

interface KendalaHandphone {
  id: string;
  topikMasalah: string;
  handphoneId: string;
  pergantianBarang: PergantianBarang[];
}

interface PergantianBarang {
  id: string;
  namaBarang: string;
  harga: number;
  kendalaHandphoneId: string;
}

interface Waktu {
  id: string;
  namaShift: string;
  jamMulai: string;
  jamSelesai: string;
  isAvailable: boolean;
}
```

### useEffect Hooks
1. `fetchHandphones()` - On component mount
2. `fetchKendalas(handphoneId)` - When handphoneId changes
3. `fetchWaktu()` - On component mount

### Error Handling
- Fetch errors logged to console
- User-friendly error messages
- Loading states during submission
- Validation handled by API

## Database Relations
```
Handphone (1) -> (N) KendalaHandphone
KendalaHandphone (1) -> (N) PergantianBarang
Service -> Handphone (N:1)
Service -> Waktu (N:1)
Service -> User (N:1)
```

## Price Calculation Example

**Scenario:**
- Handphone: Samsung Galaxy S24
- Problems selected:
  1. Ganti LCD - Rp 500,000
  2. Ganti Baterai - Rp 150,000
- Service: Mekanik datang ke lokasi

**Calculation:**
```
LCD: 500,000 + 50,000 (visit) = 550,000
Baterai: 150,000 + 50,000 (visit) = 200,000
Total: 750,000
```

## Notes

1. **Original Display Preserved:**
   - Kendala display unchanged (as requested)
   - Schedule display unchanged (as requested)
   - Step 5 display unchanged (as requested)

2. **New Features:**
   - Dropdown for phone selection (NEW)
   - Dynamic kendala filtering (NEW)
   - Shift-based scheduling (NEW)
   - Database-driven pricing (NEW)

3. **Data Validation:**
   - All validations handled by API
   - Client-side checks for empty selections
   - API returns appropriate error messages

4. **User Flow:**
   1. Select brand → Select model
   2. Select problems (multiple allowed)
   3. Select date → Select shift
   4. Select service type (± address)
   5. Review & confirm → Submit

## Testing Checklist

- [ ] Handphone dropdown loads correctly
- [ ] Brand selection shows correct models
- [ ] Kendala displays for selected phone
- [ ] Multiple kendala selection works
- [ ] Price calculates correctly
- [ ] Shift dropdown shows all shifts
- [ ] Date picker works with minimum date
- [ ] Service submission succeeds
- [ ] Error handling displays properly
- [ ] Loading states work correctly
- [ ] Redirect to history after success

## Future Improvements

1. Add loading skeleton during data fetch
2. Implement optimistic UI updates
3. Add form validation before step navigation
4. Cache fetched data to reduce API calls
5. Add ability to select specific sparepart if multiple available
6. Show availability indicator for shifts on selected date
7. Add price history/comparison feature


# Admin Master Data Management - Feature Documentation

## 🎯 Overview
Halaman Admin Master Data adalah fitur baru untuk mengelola semua data master yang dibutuhkan dalam sistem Bukhari Service Center. Halaman ini memungkinkan admin untuk menambah, mengubah, dan menghapus data:
- Sparepart/Komponen Pengganti
- Kendala Handphone
- Brand & Tipe Handphone
- Waktu/Shift Service

## 📁 File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                    (Updated - Added navigation button)
│   │   └── master-data/
│   │       └── page.tsx                (NEW - Main master data page)
│   ├── api/
│   │   ├── handphone/
│   │   │   └── route.ts               (Existing - Already has CRUD)
│   │   ├── kendala-handphone/
│   │   │   └── route.ts               (Existing - Already has CRUD)
│   │   ├── pergantian-barang/
│   │   │   └── route.ts               (Existing - Already has CRUD)
│   │   └── waktu/
│   │       └── route.ts               (Existing - Already has CRUD)
│   └── middleware.ts                   (Existing - Protects admin routes)
│
├── MASTER_DATA_GUIDE.md               (NEW - User guide)
├── DATABASE_SCHEMA_GUIDE.md           (NEW - Technical documentation)
└── ADMIN_MASTER_DATA_README.md        (NEW - This file)
```

## ✨ Features Implemented

### 1. Master Data Page (`/admin/master-data`)

#### 🔧 Sparepart Management
- ✅ View all spareparts in table format
- ✅ Add new sparepart with validation
- ✅ Edit existing sparepart
- ✅ Delete sparepart (with dependency check)
- ✅ Display price in Indonesian Rupiah format
- ✅ Prevent duplicate sparepart names

**Form Fields:**
- Nama Sparepart (text, required)
- Harga (number, required, min: 0)

---

#### ⚠️ Kendala Handphone Management
- ✅ View all kendala with related sparepart info
- ✅ Add new kendala with sparepart selection
- ✅ Edit existing kendala
- ✅ Delete kendala (with dependency check)
- ✅ Show sparepart name and price in table
- ✅ Dropdown auto-populated with available spareparts

**Form Fields:**
- Topik Masalah (text, required)
- Sparepart Pengganti (dropdown, required)

**Validation:**
- One sparepart can only be used by one kendala (one-to-one relationship)
- Kendala name must be unique

---

#### 📱 Handphone Management
- ✅ View all handphone entries with full details
- ✅ Add new handphone entry
- ✅ Edit existing handphone
- ✅ Delete handphone (with dependency check)
- ✅ Show brand, tipe, kendala, and sparepart in table
- ✅ Dropdown auto-populated with available kendala

**Form Fields:**
- Brand HP (text, required)
- Tipe HP (text, required)
- Kendala Handphone (dropdown, required)

**Validation:**
- Combination of brand + tipe + kendala must be unique
- Same HP can have multiple entries with different kendala

---

#### ⏰ Waktu/Shift Management
- ✅ View all time slots with availability status
- ✅ Add new shift with time validation
- ✅ Edit existing shift
- ✅ Delete shift (with dependency check)
- ✅ Toggle shift availability
- ✅ Color-coded availability status (green/red)

**Form Fields:**
- Nama Shift (text, required)
- Jam Mulai (time picker, required)
- Jam Selesai (time picker, required)
- Tersedia untuk booking (checkbox, default: true)

**Validation:**
- Start time must be before end time
- No time overlap between shifts
- Shift name must be unique
- Time format: HH:MM (24-hour)

---

### 2. UI/UX Features

#### Design System
- 🎨 Consistent glassmorphism design matching existing admin dashboard
- 🌙 Dark theme with gradient background (gray-900, blue-900, black)
- ✨ Smooth transitions and hover effects
- 📱 Fully responsive layout

#### Interactive Elements
- Tab navigation for switching between data types
- Modal forms for create/edit operations
- Confirmation dialogs for delete operations
- Loading states with spinner animations
- Toast/Alert messages for user feedback

#### Table Features
- Clean table layout with hover effects
- Action buttons (Edit & Delete) for each row
- Color-coded status indicators
- Formatted data display (currency, time)
- Empty state handling

---

### 3. API Integration

All CRUD operations use existing API endpoints:

#### Sparepart APIs:
```typescript
GET    /api/pergantian-barang          // Fetch all
POST   /api/pergantian-barang          // Create new
PUT    /api/pergantian-barang          // Update existing
DELETE /api/pergantian-barang?id={id}  // Delete by ID
```

#### Kendala APIs:
```typescript
GET    /api/kendala-handphone           // Fetch all
POST   /api/kendala-handphone           // Create new
PUT    /api/kendala-handphone           // Update existing
DELETE /api/kendala-handphone?id={id}   // Delete by ID
```

#### Handphone APIs:
```typescript
GET    /api/handphone                   // Fetch all
POST   /api/handphone                   // Create new
PUT    /api/handphone                   // Update existing
DELETE /api/handphone?id={id}           // Delete by ID
```

#### Waktu APIs:
```typescript
GET    /api/waktu                       // Fetch all
POST   /api/waktu                       // Create new
PUT    /api/waktu                       // Update existing
DELETE /api/waktu?id={id}               // Delete by ID
```

---

### 4. Security & Validation

#### Authentication & Authorization
- ✅ JWT-based authentication via cookies
- ✅ Admin-only access (role check in middleware)
- ✅ Automatic redirect for non-admin users
- ✅ Token validation on every API call

#### Input Validation
- ✅ Required field validation
- ✅ Data type validation (string, number, time)
- ✅ Format validation (time format HH:MM)
- ✅ Business logic validation (no overlap, unique constraints)
- ✅ Relationship validation (check if related data exists)

#### Dependency Checks
- ✅ Prevent deletion of data in use
- ✅ Show meaningful error messages
- ✅ Cascade relationship validation

---

## 🚀 Usage

### Access the Page
1. Login as ADMIN user
2. Navigate to `/admin` (Admin Dashboard)
3. Click "📊 Master Data" button in header
4. Or directly access `/admin/master-data`

### Add New Data
1. Select the appropriate tab (Sparepart/Kendala/Handphone/Waktu)
2. Click "Tambah Data Baru" button
3. Fill in the form
4. Click "Simpan"

### Edit Existing Data
1. Find the item in the table
2. Click "Edit" button
3. Modify the fields
4. Click "Simpan"

### Delete Data
1. Find the item in the table
2. Click "Hapus" button
3. Confirm deletion in popup
4. Data will be deleted if not in use

---

## 📊 Data Relationships

```
PergantianBarang (Sparepart)
    ↓ (one-to-one)
KendalaHandphone
    ↓ (one-to-many)
Handphone
    ↓ (many-to-one)
Service

Waktu (Shift)
    ↓ (one-to-many)
Service

User
    ↓ (one-to-many)
Service
```

### Setup Order (New Installation):
1. Add Sparepart first
2. Add Kendala (requires Sparepart)
3. Add Handphone (requires Kendala)
4. Add Waktu
5. Users can start booking services

---

## 🔧 Technical Details

### Technologies Used
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **API**: REST API with fetch
- **Database**: PostgreSQL + Prisma ORM

### Component Structure
```typescript
MasterDataPage (Main Component)
├── Modal (Reusable modal component)
├── Form Components:
│   ├── SparepartForm
│   ├── KendalaForm
│   ├── HandphoneForm
│   └── WaktuForm
└── Table Components:
    ├── SparepartTable
    ├── KendalaTable
    ├── HandphoneTable
    └── WaktuTable
```

### State Management
```typescript
// Main states
const [selectedTab, setSelectedTab] = useState<'sparepart' | 'kendala' | 'handphone' | 'waktu'>('sparepart');
const [loading, setLoading] = useState(false);

// Data states
const [sparepartList, setSparepartList] = useState<PergantianBarang[]>([]);
const [kendalaList, setKendalaList] = useState<KendalaHandphone[]>([]);
const [handphoneList, setHandphoneList] = useState<Handphone[]>([]);
const [waktuList, setWaktuList] = useState<Waktu[]>([]);

// Modal states
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
const [formData, setFormData] = useState<any>({});
```

---

## ⚠️ Known Limitations

1. **No Bulk Operations**: Delete/Edit one item at a time
2. **No Search/Filter**: Future enhancement needed
3. **No Pagination**: All data loaded at once (might be slow with large datasets)
4. **No Export/Import**: Cannot export data to CSV/Excel
5. **No Audit Log**: No tracking of who changed what and when

---

## 🎯 Future Enhancements

### High Priority
- [ ] Add search functionality per table
- [ ] Add pagination for large datasets
- [ ] Add data export (CSV/Excel)
- [ ] Add bulk operations (delete multiple items)
- [ ] Add confirmation before closing modal with unsaved changes

### Medium Priority
- [ ] Add sorting by columns
- [ ] Add filtering options
- [ ] Add audit log (track changes)
- [ ] Add data validation preview before save
- [ ] Add duplicate detection with "Similar items" warning

### Low Priority
- [ ] Add drag-and-drop reordering for shifts
- [ ] Add color picker for custom shift colors
- [ ] Add data visualization (charts/graphs)
- [ ] Add batch import from CSV/Excel
- [ ] Add data backup/restore functionality

---

## 🐛 Troubleshooting

### Issue: Modal not opening
**Solution**: Check browser console for errors. Ensure all dependencies are loaded.

### Issue: Data not loading
**Solution**: 
1. Check if APIs are running
2. Verify authentication token
3. Check network tab in browser DevTools
4. Verify database connection

### Issue: Cannot delete item
**Solution**: Check if item is being used by other records. Delete dependent records first.

### Issue: Form validation errors
**Solution**: Ensure all required fields are filled and data formats are correct.

---

## 📞 Support & Documentation

- **User Guide**: See `MASTER_DATA_GUIDE.md`
- **Database Schema**: See `DATABASE_SCHEMA_GUIDE.md`
- **API Documentation**: See individual route files in `/api` folder
- **Middleware Documentation**: See `src/middleware.ts`

---

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- ✅ Created master data management page
- ✅ Implemented CRUD for all 4 entities
- ✅ Added form validation
- ✅ Added dependency checking
- ✅ Created comprehensive documentation
- ✅ Added navigation from admin dashboard

---

**Created for**: Bukhari Service Center
**Developed by**: AI Assistant (Claude)
**Date**: November 2024
**License**: Private/Proprietary


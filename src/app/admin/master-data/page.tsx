"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { 
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@/components/icons';

// Types - Updated to match new schema
interface Handphone {
  id: string;
  brand: string;
  tipe: string;
  createdAt: string;
  updatedAt: string;
  kendalaHandphone?: KendalaHandphone[];
}

interface KendalaHandphone {
  id: string;
  topikMasalah: string;
  handphoneId: string;
  handphone?: Handphone;
  pergantianBarang?: PergantianBarang[];
  createdAt: string;
  updatedAt: string;
}

interface GroupedHandphone {
  id: string;
  brand: string;
  tipe: string;
  kendalaCount: number;
}

interface PergantianBarang {
  id: string;
  namaBarang: string;
  harga: number;
  jumlahStok: number;
  kendalaHandphoneId: string;
  kendalaHandphone?: KendalaHandphone;
  createdAt: string;
  updatedAt: string;
}

interface Waktu {
  id: string;
  namaShift: string;
  jamMulai: string;
  jamSelesai: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

function MasterDataContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get tab from URL or default to handphone
  const tabFromUrl = (searchParams.get('tab') as 'handphone' | 'kendala' | 'sparepart' | 'waktu') || 'handphone';
  
  const [selectedTab, setSelectedTab] = useState<'handphone' | 'kendala' | 'sparepart' | 'waktu'>(tabFromUrl);
  const [loading, setLoading] = useState(false);
  
  // States for each entity
  const [handphoneList, setHandphoneList] = useState<Handphone[]>([]);
  const [kendalaList, setKendalaList] = useState<KendalaHandphone[]>([]);
  const [groupedHandphones, setGroupedHandphones] = useState<GroupedHandphone[]>([]);
  const [sparepartList, setSparepartList] = useState<PergantianBarang[]>([]);
  const [waktuList, setWaktuList] = useState<Waktu[]>([]);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<any>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Sync selectedTab with URL
  useEffect(() => {
    const tabFromUrl = (searchParams.get('tab') as 'handphone' | 'kendala' | 'sparepart' | 'waktu') || 'handphone';
    setSelectedTab(tabFromUrl);
  }, [searchParams]);

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (selectedTab) {
        case 'handphone':
          const handphoneRes = await fetch('/api/handphone');
          const handphoneData = await handphoneRes.json();
          if (handphoneData.status) setHandphoneList(handphoneData.content);
          break;
        case 'kendala':
          const groupedRes = await fetch('/api/kendala-handphone/grouped');
          const groupedData = await groupedRes.json();
          if (groupedData.status) setGroupedHandphones(groupedData.content);
          break;
        case 'sparepart':
          const sparepartRes = await fetch('/api/pergantian-barang');
          const sparepartData = await sparepartRes.json();
          if (sparepartData.status) setSparepartList(sparepartData.content);
          break;
        case 'waktu':
          const waktuRes = await fetch('/api/waktu');
          const waktuData = await waktuRes.json();
          if (waktuData.status) setWaktuList(waktuData.content);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({});
    await loadRelatedData();
    setIsModalOpen(true);
  };

  const openEditModal = async (item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData(item);
    await loadRelatedData();
    setIsModalOpen(true);
  };

  const loadRelatedData = async () => {
    try {
      // Load handphone list for kendala form
      if (selectedTab === 'kendala' && handphoneList.length === 0) {
        const res = await fetch('/api/handphone');
        const data = await res.json();
        if (data.status) setHandphoneList(data.content);
      }
      
      // Load kendala list for sparepart form
      if (selectedTab === 'sparepart' && kendalaList.length === 0) {
        const res = await fetch('/api/kendala-handphone');
        const data = await res.json();
        if (data.status) setKendalaList(data.content);
      }
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = '';
      let method = modalMode === 'create' ? 'POST' : 'PUT';
      let body: any = {};

      switch (selectedTab) {
        case 'handphone':
          url = '/api/handphone';
          body = {
            id: modalMode === 'edit' ? selectedItem.id : undefined,
            brand: formData.brand,
            tipe: formData.tipe
          };
          break;
        case 'kendala':
          url = '/api/kendala-handphone';
          body = {
            id: modalMode === 'edit' ? selectedItem.id : undefined,
            topikMasalah: formData.topikMasalah,
            handphoneId: formData.handphoneId
          };
          break;
        case 'sparepart':
          url = '/api/pergantian-barang';
          body = {
            id: modalMode === 'edit' ? selectedItem.id : undefined,
            namaBarang: formData.namaBarang,
            harga: parseFloat(formData.harga),
            jumlahStok: parseInt(formData.jumlahStok) || 0,
            kendalaHandphoneId: formData.kendalaHandphoneId
          };
          break;
        case 'waktu':
          url = '/api/waktu';
          body = {
            id: modalMode === 'edit' ? selectedItem.id : undefined,
            namaShift: formData.namaShift,
            jamMulai: formData.jamMulai,
            jamSelesai: formData.jamSelesai,
            isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true
          };
          break;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok) {
        alert(modalMode === 'create' ? 'Data berhasil ditambahkan!' : 'Data berhasil diupdate!');
        closeModal();
        fetchData();
      } else {
        alert(result.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Untuk handphone, tampilkan modal konfirmasi dengan info cascade delete
    if (selectedTab === 'handphone') {
      setIsLoadingDelete(true);
      try {
        const res = await fetch(`/api/handphone/delete-info/${id}`);
        const data = await res.json();
        
        if (data.status) {
          setDeleteInfo(data.content);
          setIsDeleteModalOpen(true);
        } else {
          alert(data.message || 'Gagal mendapatkan informasi handphone');
        }
      } catch (error) {
        console.error('Error fetching delete info:', error);
        alert('Gagal mendapatkan informasi handphone');
      } finally {
        setIsLoadingDelete(false);
      }
      return;
    }

    // Untuk tab lain, langsung konfirmasi biasa
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    setLoading(true);
    try {
      let url = '';
      switch (selectedTab) {
        case 'kendala':
          url = `/api/kendala-handphone?id=${id}`;
          break;
        case 'sparepart':
          url = `/api/pergantian-barang?id=${id}`;
          break;
        case 'waktu':
          url = `/api/waktu?id=${id}`;
          break;
      }

      const response = await fetch(url, { method: 'DELETE' });
      const result = await response.json();

      if (response.ok) {
        alert('Data berhasil dihapus!');
        fetchData();
      } else {
        alert(result.message || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteInfo) return;

    if (!deleteInfo.canDelete) {
      alert(`Tidak dapat menghapus handphone. Masih ada ${deleteInfo.activeServicesCount} service aktif yang menggunakan handphone ini.`);
      setIsDeleteModalOpen(false);
      return;
    }

    setIsLoadingDelete(true);
    try {
      const response = await fetch(`/api/handphone?id=${deleteInfo.id}`, { 
        method: 'DELETE' 
      });
      const result = await response.json();

      if (response.ok) {
        alert('Handphone dan semua data terkait berhasil dihapus!');
        setIsDeleteModalOpen(false);
        setDeleteInfo(null);
        fetchData();
      } else {
        alert(result.message || 'Gagal menghapus handphone');
      }
    } catch (error) {
      console.error('Error deleting handphone:', error);
      alert('Gagal menghapus handphone');
    } finally {
      setIsLoadingDelete(false);
    }
  };

  // Handler untuk tab change dengan update URL
  const handleTabChange = (tab: 'handphone' | 'kendala' | 'sparepart' | 'waktu') => {
    setSelectedTab(tab);
    // Update URL without reload
    router.push(`/admin/master-data?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    { id: 'handphone' as const, label: 'Handphone', icon: DevicePhoneMobileIcon },
    { id: 'kendala' as const, label: 'Kendala HP', icon: ExclamationTriangleIcon },
    { id: 'sparepart' as const, label: 'Sparepart', icon: WrenchScrewdriverIcon },
    { id: 'waktu' as const, label: 'Waktu/Shift', icon: ClockIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex">
      {/* Sidebar */}
      <AdminSidebar selectedTab="master-data" onTabChange={() => {}} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="mb-6">
            {/* Mobile: Dropdown */}
            <div className="sm:hidden mb-4">
              <select
                value={selectedTab}
                onChange={(e) => handleTabChange(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id} className="bg-gray-800">
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop/Tablet: Tabs */}
            <div className="hidden sm:flex space-x-1 bg-white/10 p-1 rounded-xl overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center space-x-2 flex-1 py-3 px-6 rounded-lg text-center transition-all duration-300 whitespace-nowrap ${
                      selectedTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Tambah Data Baru</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                <p className="text-white mt-4">Loading...</p>
              </div>
            ) : (
              <>
                {/* Handphone Tab */}
                {selectedTab === 'handphone' && (
                  <HandphoneTable 
                    data={handphoneList} 
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                )}

                {/* Kendala Tab */}
                {selectedTab === 'kendala' && (
                  <KendalaTable 
                    groupedData={groupedHandphones}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    fetchData={fetchData}
                  />
                )}

                {/* Sparepart Tab */}
                {selectedTab === 'sparepart' && (
                  <SparepartTable 
                    data={sparepartList}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                )}

                {/* Waktu Tab */}
                {selectedTab === 'waktu' && (
                  <WaktuTable 
                    data={waktuList}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalMode === 'create' ? 'Tambah Data Baru' : 'Edit Data'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedTab === 'handphone' && (
              <HandphoneForm formData={formData} setFormData={setFormData} />
            )}
            {selectedTab === 'kendala' && (
              <KendalaForm 
                formData={formData} 
                setFormData={setFormData}
                handphoneList={handphoneList}
              />
            )}
            {selectedTab === 'sparepart' && (
              <SparepartForm 
                formData={formData} 
                setFormData={setFormData}
                kendalaList={kendalaList}
              />
            )}
            {selectedTab === 'waktu' && (
              <WaktuForm formData={formData} setFormData={setFormData} />
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteInfo && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteInfo(null);
          }}
          title="Konfirmasi Hapus Handphone"
        >
          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-red-400 font-bold text-lg mb-2">Peringatan!</h3>
                  <p className="text-white">
                    Anda akan menghapus handphone <span className="font-bold">{deleteInfo.brand} {deleteInfo.tipe}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Info yang akan dihapus */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h4 className="text-white font-semibold mb-3">Data yang akan terhapus:</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-yellow-400 text-sm">Kendala HP</div>
                  <div className="text-white text-2xl font-bold">{deleteInfo.kendalaCount}</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="text-purple-400 text-sm">Sparepart</div>
                  <div className="text-white text-2xl font-bold">{deleteInfo.sparepartCount}</div>
                </div>
              </div>

              {deleteInfo.kendalaList && deleteInfo.kendalaList.length > 0 && (
                <div className="mt-4">
                  <div className="text-gray-400 text-sm mb-2">Daftar Kendala:</div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {deleteInfo.kendalaList.map((kendala: any, idx: number) => (
                      <div key={kendala.id} className="text-white text-sm bg-white/5 rounded px-3 py-2">
                        {idx + 1}. {kendala.topikMasalah} ({kendala.sparepartCount} sparepart)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cannot Delete Message */}
            {!deleteInfo.canDelete && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <div className="text-red-400 font-semibold mb-1">Tidak dapat dihapus!</div>
                    <div className="text-white text-sm">
                      Handphone ini masih digunakan oleh {deleteInfo.activeServicesCount} service aktif. 
                      Selesaikan atau batalkan service terlebih dahulu.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {deleteInfo.canDelete ? (
                <>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isLoadingDelete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isLoadingDelete ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-5 h-5" />
                        <span>Ya, Hapus Semua</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeleteInfo(null);
                    }}
                    disabled={isLoadingDelete}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteInfo(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Form Components
function HandphoneForm({ formData, setFormData }: any) {
  return (
    <>
      <div>
        <label className="block text-white mb-2 font-medium">Brand HP</label>
        <input
          type="text"
          value={formData.brand || ''}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder="Contoh: iPhone, Samsung, Xiaomi"
          required
        />
      </div>
      <div>
        <label className="block text-white mb-2 font-medium">Tipe HP</label>
        <input
          type="text"
          value={formData.tipe || ''}
          onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder="Contoh: 14 Pro, Galaxy S23"
          required
        />
      </div>
    </>
  );
}

function KendalaForm({ formData, setFormData, handphoneList }: any) {
  return (
    <>
      <div>
        <label className="block text-white mb-2 font-medium">Pilih Handphone</label>
        <select
          value={formData.handphoneId || ''}
          onChange={(e) => setFormData({ ...formData, handphoneId: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          required
        >
          <option value="" className="bg-gray-800">Pilih Handphone</option>
          {handphoneList.map((hp: Handphone) => (
            <option key={hp.id} value={hp.id} className="bg-gray-800">
              {hp.brand} {hp.tipe}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-white mb-2 font-medium">Topik Masalah</label>
        <input
          type="text"
          value={formData.topikMasalah || ''}
          onChange={(e) => setFormData({ ...formData, topikMasalah: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder="Contoh: LCD Rusak, Baterai Lemah"
          required
        />
      </div>
    </>
  );
}

function SparepartForm({ formData, setFormData, kendalaList }: any) {
  return (
    <>
      <div>
        <label className="block text-white mb-2 font-medium">Pilih Kendala</label>
        <select
          value={formData.kendalaHandphoneId || ''}
          onChange={(e) => setFormData({ ...formData, kendalaHandphoneId: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          required
        >
          <option value="" className="bg-gray-800">Pilih Kendala</option>
          {kendalaList.map((k: KendalaHandphone) => (
            <option key={k.id} value={k.id} className="bg-gray-800">
              {k.topikMasalah} - {k.handphone?.brand} {k.handphone?.tipe}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-white mb-2 font-medium">Nama Sparepart</label>
        <input
          type="text"
          value={formData.namaBarang || ''}
          onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder="Contoh: LCD iPhone 14 Pro Original"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-2 font-medium">Harga (Rp)</label>
          <input
            type="number"
            value={formData.harga || ''}
            onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="2500000"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-white mb-2 font-medium">Jumlah Stok</label>
          <input
            type="number"
            value={formData.jumlahStok !== undefined ? formData.jumlahStok : ''}
            onChange={(e) => setFormData({ ...formData, jumlahStok: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="10"
            required
            min="0"
          />
        </div>
      </div>
    </>
  );
}

function WaktuForm({ formData, setFormData }: any) {
  return (
    <>
      <div>
        <label className="block text-white mb-2 font-medium">Nama Shift</label>
        <input
          type="text"
          value={formData.namaShift || ''}
          onChange={(e) => setFormData({ ...formData, namaShift: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder="Contoh: Shift 1"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-2 font-medium">Jam Mulai</label>
          <input
            type="time"
            value={formData.jamMulai || ''}
            onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-white mb-2 font-medium">Jam Selesai</label>
          <input
            type="time"
            value={formData.jamSelesai || ''}
            onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
            required
          />
        </div>
      </div>
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.isAvailable !== undefined ? formData.isAvailable : true}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            className="w-5 h-5 rounded"
          />
          <span className="text-white">Tersedia untuk booking</span>
        </label>
      </div>
    </>
  );
}

// Table Components
function HandphoneTable({ data, onEdit, onDelete }: any) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Belum ada data handphone. Klik tombol "Tambah Data Baru" untuk menambahkan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="sm:hidden p-4 space-y-4">
        {data.map((item: Handphone) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="mb-3">
              <div className="text-white font-bold text-lg">{item.brand}</div>
              <div className="text-gray-300 text-sm">{item.tipe}</div>
              <div className="text-blue-400 text-xs mt-1">{item.kendalaHandphone?.length || 0} kendala terdaftar</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="px-6 py-4 text-left text-white font-semibold">Brand</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Tipe</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Jumlah Kendala</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Handphone) => (
              <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-semibold">{item.brand}</td>
                <td className="px-6 py-4 text-gray-300">{item.tipe}</td>
                <td className="px-6 py-4 text-blue-400">{item.kendalaHandphone?.length || 0} kendala</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function KendalaTable({ groupedData, onEdit, onDelete, fetchData }: any) {
  const [expandedHandphones, setExpandedHandphones] = useState<Set<string>>(new Set());
  const [kendalaByHandphone, setKendalaByHandphone] = useState<Record<string, KendalaHandphone[]>>({});
  const [loadingHandphone, setLoadingHandphone] = useState<string | null>(null);

  if (!groupedData || groupedData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Belum ada data kendala. Tambahkan handphone terlebih dahulu, lalu buat kendala.</p>
      </div>
    );
  }

  const toggleHandphone = async (handphoneId: string) => {
    const newExpanded = new Set(expandedHandphones);
    
    if (newExpanded.has(handphoneId)) {
      // Collapse
      newExpanded.delete(handphoneId);
      setExpandedHandphones(newExpanded);
    } else {
      // Expand - fetch kendala if not already loaded
      newExpanded.add(handphoneId);
      setExpandedHandphones(newExpanded);
      
      if (!kendalaByHandphone[handphoneId]) {
        setLoadingHandphone(handphoneId);
        try {
          const res = await fetch(`/api/kendala-handphone/by-handphone?handphoneId=${handphoneId}`);
          const data = await res.json();
          if (data.status) {
            setKendalaByHandphone(prev => ({
              ...prev,
              [handphoneId]: data.content
            }));
          }
        } catch (error) {
          console.error('Error fetching kendala:', error);
        } finally {
          setLoadingHandphone(null);
        }
      }
    }
  };

  const handleDeleteKendala = async (kendalaId: string, handphoneId: string) => {
    await onDelete(kendalaId);
    // Refresh kendala for this handphone after delete
    try {
      const res = await fetch(`/api/kendala-handphone/by-handphone?handphoneId=${handphoneId}`);
      const data = await res.json();
      if (data.status) {
        setKendalaByHandphone(prev => ({
          ...prev,
          [handphoneId]: data.content
        }));
      }
      // Refresh grouped data to update counts
      fetchData();
    } catch (error) {
      console.error('Error refreshing kendala:', error);
    }
  };

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="sm:hidden p-4 space-y-3">
        {groupedData.map((hp: GroupedHandphone) => {
          const isExpanded = expandedHandphones.has(hp.id);
          const kendalaList = kendalaByHandphone[hp.id] || [];
          const isLoading = loadingHandphone === hp.id;

          return (
            <div key={hp.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              {/* Header - Handphone */}
              <button
                onClick={() => toggleHandphone(hp.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="text-blue-400 font-bold text-base">
                    {hp.brand} {hp.tipe}
                  </div>
                  <div className="text-yellow-400 text-xs mt-1">
                    {hp.kendalaCount} kendala terdaftar
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content - Kendala List */}
              {isExpanded && (
                <div className="border-t border-white/10">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    </div>
                  ) : kendalaList.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      Tidak ada kendala untuk handphone ini
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {kendalaList.map((kendala: KendalaHandphone) => (
                        <div key={kendala.id} className="p-4 bg-white/3">
                          <div className="mb-3">
                            <div className="text-white font-semibold">{kendala.topikMasalah}</div>
                            <div className="text-green-400 text-xs mt-1">
                              {kendala.pergantianBarang?.length || 0} sparepart tersedia
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEdit(kendala)}
                              className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteKendala(kendala.id, hp.id)}
                              className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: Accordion Layout */}
      <div className="hidden sm:block">
        {groupedData.map((hp: GroupedHandphone) => {
          const isExpanded = expandedHandphones.has(hp.id);
          const kendalaList = kendalaByHandphone[hp.id] || [];
          const isLoading = loadingHandphone === hp.id;

          return (
            <div key={hp.id} className="border-b border-white/10 last:border-b-0">
              {/* Header - Handphone */}
              <button
                onClick={() => toggleHandphone(hp.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <svg 
                    className={`w-5 h-5 text-gray-400 group-hover:text-white transition-all ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div>
                    <div className="text-blue-400 font-bold text-lg text-left">
                      {hp.brand} {hp.tipe}
                    </div>
                    <div className="text-yellow-400 text-sm text-left">
                      {hp.kendalaCount} kendala terdaftar
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {isExpanded ? 'Klik untuk collapse' : 'Klik untuk expand'}
                </div>
              </button>

              {/* Expanded Content - Kendala Table */}
              {isExpanded && (
                <div className="bg-white/3">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                      <p className="text-white mt-3">Memuat kendala...</p>
                    </div>
                  ) : kendalaList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      Tidak ada kendala untuk handphone ini
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20 bg-white/5">
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Topik Masalah</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Jumlah Sparepart</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kendalaList.map((kendala: KendalaHandphone) => (
                          <tr key={kendala.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white">{kendala.topikMasalah}</td>
                            <td className="px-6 py-4 text-green-400">{kendala.pergantianBarang?.length || 0} opsi</td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => onEdit(kendala)}
                                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteKendala(kendala.id, hp.id)}
                                  className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function SparepartTable({ data, onEdit, onDelete }: any) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Belum ada data sparepart. Tambahkan kendala terlebih dahulu, lalu buat sparepart.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="sm:hidden p-4 space-y-4">
        {data.map((item: PergantianBarang) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="mb-3">
              <div className="text-white font-bold text-lg">{item.namaBarang}</div>
              <div className="flex items-center space-x-3 mt-2">
                <div className="text-green-400 font-semibold text-xl">
                  Rp {item.harga.toLocaleString('id-ID')}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.jumlahStok > 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  Stok: {item.jumlahStok}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-yellow-400 text-sm">
                  {item.kendalaHandphone?.topikMasalah}
                </div>
                <div className="text-blue-400 text-xs">
                  {item.kendalaHandphone?.handphone?.brand} {item.kendalaHandphone?.handphone?.tipe}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="px-6 py-4 text-left text-white font-semibold">Nama Sparepart</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Untuk Kendala</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Handphone</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Harga</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Stok</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: PergantianBarang) => (
              <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white">{item.namaBarang}</td>
                <td className="px-6 py-4 text-yellow-400">{item.kendalaHandphone?.topikMasalah}</td>
                <td className="px-6 py-4 text-blue-400">
                  {item.kendalaHandphone?.handphone?.brand} {item.kendalaHandphone?.handphone?.tipe}
                </td>
                <td className="px-6 py-4 text-green-400 font-semibold">Rp {item.harga.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.jumlahStok > 0 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {item.jumlahStok} unit
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function WaktuTable({ data, onEdit, onDelete }: any) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Belum ada data waktu/shift. Klik tombol "Tambah Data Baru" untuk menambahkan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="sm:hidden p-4 space-y-4">
        {data.map((item: Waktu) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-bold text-lg">{item.namaShift}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  item.isAvailable 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {item.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
              </div>
              <div className="text-blue-400 text-sm">
                {item.jamMulai} - {item.jamSelesai}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center space-x-2 flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="px-6 py-4 text-left text-white font-semibold">Nama Shift</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Jam Mulai</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Jam Selesai</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Waktu) => (
              <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-semibold">{item.namaShift}</td>
                <td className="px-6 py-4 text-blue-400">{item.jamMulai}</td>
                <td className="px-6 py-4 text-blue-400">{item.jamSelesai}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    item.isAvailable 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {item.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}


export default function MasterDataPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    }>
      <MasterDataContent />
    </Suspense>
  );
}

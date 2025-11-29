"use client";

import React, { useState, useEffect } from 'react';
import { EnvelopeIcon } from '@/components/icons';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface EmailSenderProps {
  onEmailSent?: () => void;
}

export default function EmailSender({ onEmailSent }: EmailSenderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  
  const [formData, setFormData] = useState({
    recipientType: 'user', // 'user' or 'manual'
    userId: '',
    email: '',
    subject: '',
    message: '',
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });
        const json = await response.json();
        if (json.status && json.content) {
          setUsers(json.content);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess(false);

    try {
      // Validasi
      if (!formData.subject.trim()) {
        setError('Subject wajib diisi');
        setSending(false);
        return;
      }

      if (!formData.message.trim()) {
        setError('Message wajib diisi');
        setSending(false);
        return;
      }

      if (formData.recipientType === 'user' && !formData.userId) {
        setError('Pilih user terlebih dahulu');
        setSending(false);
        return;
      }

      if (formData.recipientType === 'manual' && !formData.email.trim()) {
        setError('Email wajib diisi');
        setSending(false);
        return;
      }

      // Validasi format email jika manual
      if (formData.recipientType === 'manual') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Format email tidak valid');
          setSending(false);
          return;
        }
      }

      // Kirim email
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          to: formData.recipientType === 'user' ? undefined : formData.email,
          userId: formData.recipientType === 'user' ? formData.userId : undefined,
          subject: formData.subject,
          message: formData.message,
          userName: formData.recipientType === 'user' 
            ? users.find(u => u.id === formData.userId)?.name 
            : undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.status) {
        throw new Error(json.message || 'Gagal mengirim email');
      }

      setSuccess(true);
      setFormData({
        recipientType: 'user',
        userId: '',
        email: '',
        subject: '',
        message: '',
      });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      if (onEmailSent) {
        onEmailSent();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <EnvelopeIcon className="w-6 h-6 text-blue-400" />
        Kirim Notifikasi Email
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pilih Penerima
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="recipientType"
                value="user"
                checked={formData.recipientType === 'user'}
                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as 'user', userId: '', email: '' })}
                className="mr-2"
              />
              <span className="text-white">Pilih dari User</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="recipientType"
                value="manual"
                checked={formData.recipientType === 'manual'}
                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as 'manual', userId: '', email: '' })}
                className="mr-2"
              />
              <span className="text-white">Input Email Manual</span>
            </label>
          </div>
        </div>

        {/* User Selection or Email Input */}
        {formData.recipientType === 'user' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pilih User
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.recipientType === 'user'}
            >
              <option value="">-- Pilih User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} className="bg-gray-800">
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Penerima
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contoh@email.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.recipientType === 'manual'}
            />
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subject Email
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Contoh: Notifikasi Service Selesai"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Isi Pesan
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tulis pesan yang ingin dikirim..."
            rows={8}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-2 text-xs text-gray-400">
            Tip: Gunakan baris baru untuk membuat paragraf yang lebih rapi
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-300 text-sm">✅ Email berhasil dikirim!</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengirim...
            </>
          ) : (
            <>
              <EnvelopeIcon className="w-5 h-5" />
              Kirim Email
            </>
          )}
        </button>
      </form>
    </div>
  );
}


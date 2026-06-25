'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { HiPhotograph, HiUpload, HiTrash, HiCheck, HiLink } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ImgbbUploader({ value, onChange, label = 'Panel Image' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error('Image must be under 32MB');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await axios.post(`${API_URL}/upload/image`, { image: base64 }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 60000,
      });

      if (res.data.success) {
        const imgUrl = res.data.data.url;
        onChange(imgUrl);
        setPreview(imgUrl);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(res.data.message || 'Upload failed');
        setPreview('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      toast.error(msg);
      setPreview('');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = () => {
    onChange('');
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteUrl = () => {
    const url = window.prompt('Paste image URL:');
    if (url && url.trim()) {
      setPreview(url.trim());
      onChange(url.trim());
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Current Preview */}
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Preview"
              fill
              className={`object-contain ${uploading ? 'opacity-50' : ''}`}
              unoptimized
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center">
                  <div className="loading-spinner w-8 h-8 border-2 border-white/30 border-t-white mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Uploading to ImgBB...</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-colors">
              <HiUpload className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
          {value && (
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs flex items-center space-x-1">
              <HiCheck className="w-3 h-3 text-green-400" />
              <span>URL saved</span>
            </div>
          )}
        </div>
      ) : (
        /* Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            disabled={uploading}
          />
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <HiPhotograph className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop an image or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF, WebP up to 32MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePasteUrl();
              }}
              className="inline-flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              <HiLink className="w-3.5 h-3.5" />
              <span>Or paste a URL instead</span>
            </button>
          </div>
        </div>
      )}

      {/* Image URL Input (always shown) */}
      <div className="relative">
        <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value !== preview) setPreview(e.target.value);
          }}
          className="input-field pl-10 pr-4 text-sm"
          placeholder="https://i.ibb.co/..."
        />
      </div>
    </div>
  );
}

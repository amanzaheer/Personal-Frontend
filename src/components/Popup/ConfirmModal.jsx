// ConfirmModal.js
import React from 'react'
import { Button } from '../../components/ui/button'
import { X } from 'lucide-react'

export default function ConfirmModal({
  title = 'Confirm Action',
  message = 'Are you sure?',
  isOpen = false,
  onCancel,
  onConfirm,
  loading = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-700">
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-primary text-white flex items-center gap-2"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

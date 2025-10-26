import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: () => void;
};

export default function FirstTimeUploadModal({ open, onClose, onUpload }: Props) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-1">Share. Earn. Help.</h2>
        <p className="text-sm font-medium text-primary-foreground/90 mb-4">Contribute course materials and earn recognition</p>

        <p className="text-sm text-gray-700 mb-6">
          Upload notes or past papers to help your peers — contributors get profile badges and visibility.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              // navigate to upload and call onUpload to close + mark shown
              navigate('/upload');
              onUpload();
            }}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Upload &amp; earn badge
          </button>

          <button
            onClick={onClose}
            className="rounded border px-4 py-2 text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

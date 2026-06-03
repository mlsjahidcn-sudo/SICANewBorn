'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';

export default function ImportLeadsPage() {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/leads">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Import Leads</h1>
          <p className="text-gray-500 mt-1">Import leads from CSV file with field mapping</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-[#9B1B30]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'upload' ? 'bg-[#9B1B30] text-white' : 'bg-gray-200'}`}>1</div>
          <span className="font-medium">Upload File</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-[#9B1B30]' : step === 'preview' ? 'text-[#1B2A4A]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'mapping' || step === 'preview' ? 'bg-[#9B1B30] text-white' : 'bg-gray-200'}`}>2</div>
          <span className="font-medium">Map Fields</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-[#9B1B30]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'preview' ? 'bg-[#9B1B30] text-white' : 'bg-gray-200'}`}>3</div>
          <span className="font-medium">Preview & Import</span>
        </div>
      </div>

      {step === 'upload' && (
        <div className="bg-white border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300">
            <FileText size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-[#1B2A4A] mb-2">Upload CSV File</h3>
            <p className="text-gray-500 mb-6 text-center">Drag and drop your CSV file here, or click to browse</p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="csv-upload">
              <Button className="bg-[#9B1B30] hover:bg-[#7a1526] flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                Select File
              </Button>
            </label>
            {file && (
              <div className="mt-4 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-none">
                <FileText size={16} className="text-[#9B1B30]" />
                <span className="text-sm">{file.name}</span>
                <button onClick={() => setFile(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          {file && (
            <div className="mt-6 flex justify-end">
              <Button className="bg-[#9B1B30] hover:bg-[#7a1526]" onClick={() => setStep('mapping')}>
                Continue to Mapping
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'mapping' && (
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Field Mapping</h2>
          <p className="text-gray-500 mb-6">Map your CSV columns to the system fields</p>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">Field mapping interface will appear here</div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
            <Button className="bg-[#9B1B30] hover:bg-[#7a1526]" onClick={() => setStep('preview')}>
              Continue to Preview
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Preview & Import</h2>
          <p className="text-gray-500 mb-6">Review your data before importing</p>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">Data preview will appear here</div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
            <Button className="bg-[#9B1B30] hover:bg-[#7a1526]">
              Import Leads
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

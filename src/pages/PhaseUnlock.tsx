import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';

export default function PhaseUnlock() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-phase5-screenshot-${Date.now()}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-files')
        .getPublicUrl(filePath);

      await supabase.from('phase_unlocks').upsert({
        user_id: user.id,
        phase_number: 5,
        screenshot_url: publicUrl,
        uploaded_at: new Date().toISOString()
      });

      alert('Screenshot uploaded successfully! Phase 5 will be unlocked once approved.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Unlock Phase 5</h1>

          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload Your Passing Exam Screenshot</h2>
            <p className="text-gray-600 mb-6">
              To unlock Phase 5 (Sales Training), you must upload a screenshot of your passing state exam score.
            </p>

            <div className="space-y-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full p-3 border rounded-lg"
              />

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Screenshot'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Requirements:</strong> You must have passed at least one exam simulation version AND uploaded your state exam passing screenshot to unlock Phase 5.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

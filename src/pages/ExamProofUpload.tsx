import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { supabase } from '../lib/supabase';

type ExamProofStatus = 'pending' | 'approved' | 'rejected';

type PhaseUnlock = {
  id: string;
  user_id: string;
  phase_number: number;
  screenshot_url: string | null;
  uploaded_at: string | null;
  status: ExamProofStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
};

export function ExamProofUpload() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [examProof, setExamProof] = useState<PhaseUnlock | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [phase4Completed, setPhase4Completed] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;

    setLoading(true);

    const { data: phase4Modules } = await supabase
      .from('modules')
      .select('id')
      .eq('phase_number', 4);

    if (phase4Modules && phase4Modules.length > 0) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('is_completed')
        .eq('user_id', profile.id)
        .eq('module_id', phase4Modules[0].id)
        .maybeSingle();

      setPhase4Completed(progress?.is_completed || false);
    }

    const { data: proofData } = await supabase
      .from('phase_unlocks')
      .select('*')
      .eq('user_id', profile.id)
      .eq('phase_number', 4)
      .maybeSingle();

    setExamProof(proofData);
    setLoading(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image (JPEG, PNG, GIF) or PDF file');
      return;
    }

    if (file.size > 10485760) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  }

  async function handleUpload() {
    if (!selectedFile || !profile) return;

    setUploading(true);
    setError('');

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

      if (examProof?.screenshot_url) {
        const oldPath = examProof.screenshot_url.split('/').slice(-2).join('/');
        await supabase.storage.from('exam-proofs').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('exam-proofs')
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('exam-proofs')
        .getPublicUrl(fileName);

      if (examProof) {
        const { error: updateError } = await supabase
          .from('phase_unlocks')
          .update({
            screenshot_url: urlData.publicUrl,
            uploaded_at: new Date().toISOString(),
            status: 'pending',
            rejection_reason: null,
          })
          .eq('id', examProof.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('phase_unlocks')
          .insert({
            user_id: profile.id,
            phase_number: 4,
            screenshot_url: urlData.publicUrl,
            uploaded_at: new Date().toISOString(),
            status: 'pending',
          });

        if (insertError) throw insertError;
      }

      setSelectedFile(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!phase4Completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Phase 4 Required</h1>
          <p className="text-gray-600 mb-6">
            You must complete Phase 4 before you can upload your exam proof.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">State Exam Proof Upload</h1>
          <p className="text-gray-600 mt-2">
            Upload proof of your passing state exam to unlock the next phase.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Requirements</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Upload a clear image or PDF of your passing exam results</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Accepted formats: JPEG, PNG, GIF, PDF</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Maximum file size: 10MB</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Ensure your name and passing score are clearly visible</span>
            </li>
          </ul>
        </div>

        {examProof && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>

            {examProof.status === 'pending' && (
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-900">Pending Review</p>
                  <p className="text-sm text-yellow-700">
                    Your exam proof has been submitted and is awaiting admin review.
                  </p>
                </div>
              </div>
            )}

            {examProof.status === 'approved' && (
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Approved</p>
                  <p className="text-sm text-green-700">
                    Your exam proof has been approved! The next phase is now unlocked.
                  </p>
                  {examProof.reviewed_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Reviewed on {new Date(examProof.reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {examProof.status === 'rejected' && (
              <div className="flex items-start p-4 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Rejected</p>
                  <p className="text-sm text-red-700">
                    Your exam proof was not approved. Please upload a clearer image.
                  </p>
                  {examProof.rejection_reason && (
                    <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
                      Reason: {examProof.rejection_reason}
                    </p>
                  )}
                  {examProof.reviewed_at && (
                    <p className="text-xs text-red-600 mt-1">
                      Reviewed on {new Date(examProof.reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {examProof.screenshot_url && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Uploaded file:</p>
                <a
                  href={examProof.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View uploaded file
                </a>
              </div>
            )}
          </div>
        )}

        {(!examProof || examProof.status === 'rejected') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {examProof ? 'Upload New Proof' : 'Upload Exam Proof'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Exam Proof
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

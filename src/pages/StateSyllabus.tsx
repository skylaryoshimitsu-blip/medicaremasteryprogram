import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function StateSyllabus() {
  const [selectedState, setSelectedState] = useState('');
  const [syllabusData, setSyllabusData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedState) loadSyllabus();
  }, [selectedState]);

  async function loadSyllabus() {
    const { data } = await supabase
      .from('state_syllabus')
      .select('*')
      .eq('state_code', selectedState)
      .order('topic');

    setSyllabusData(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">State Licensing Syllabus</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <label className="block font-semibold mb-2">Select Your State:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Choose a state...</option>
            {STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {syllabusData.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Topic</th>
                  <th className="px-6 py-3 text-left">Weight</th>
                  <th className="px-6 py-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {syllabusData.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-semibold">{item.topic}</td>
                    <td className="px-6 py-4">{item.weight}%</td>
                    <td className="px-6 py-4 text-gray-600">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedState && syllabusData.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <p className="text-yellow-800">No syllabus data available for {selectedState} yet. Contact admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
